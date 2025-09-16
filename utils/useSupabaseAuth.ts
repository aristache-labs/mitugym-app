import { useEffect } from 'react';
import { supabase } from './supabase';
import { useAppStore } from '../lib/store';

export function useSupabaseAuth() {
  const session = useAppStore(state => state.session);

  useEffect(() => {
    // Check initial auth state only once
    useAppStore.getState().checkAuthState();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, authSession) => {
        console.log('Auth state changed:', event, authSession?.user?.email);

        if (event === 'SIGNED_IN' && authSession) {
          const currentMember = useAppStore.getState().member;
          const memberData: any = {
            id: authSession.user.id,
            name: currentMember?.name || 'User',
            email: authSession.user.email || '',
            phone: currentMember?.phone || '',
            membershipStatus: currentMember?.membershipStatus || 'active',
            membershipPlan: currentMember?.membershipPlan || 'Basic',
            joinDate: currentMember?.joinDate || new Date().toISOString(),
            expiryDate: currentMember?.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          };

          if (currentMember?.visitsLeft !== undefined) {
            memberData.visitsLeft = currentMember.visitsLeft;
          }
          if (currentMember?.daysLeft !== undefined) {
            memberData.daysLeft = currentMember.daysLeft;
          }
          if (currentMember?.lastCheckIn !== undefined) {
            memberData.lastCheckIn = currentMember.lastCheckIn;
          }

          useAppStore.setState({
            isAuthenticated: true,
            session: authSession,
            member: memberData,
          });
        } else if (event === 'SIGNED_OUT') {
          useAppStore.setState({
            isAuthenticated: false,
            session: null,
            member: null,
            bookings: new Set(),
            bookingHistory: [],
          });
        }
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array - only run once

  return { session };
}
