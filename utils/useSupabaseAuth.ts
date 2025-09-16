import { useEffect, useRef } from 'react';
import { supabase } from './supabase';
import { useAppStore } from '../lib/store';

// Global flags to prevent multiple auth state changes
let isProcessingAuthChange = false;
let authInitialized = false;

// DEPRECATED: Use authManager instead
export function useSupabaseAuth() {
  console.log('WARNING: useSupabaseAuth is deprecated, use authManager instead');
  return {};
}

export function _useSupabaseAuth_deprecated() {
  const hasInitialized = useRef(false);
  const stateUpdateTimeout = useRef<number | null>(null);
  const lastStateUpdate = useRef<number>(0);

  console.log('useSupabaseAuth hook initializing...');

  useEffect(() => {
    // Prevent multiple initializations
    if (hasInitialized.current || authInitialized) {
      return;
    }
    hasInitialized.current = true;
    authInitialized = true;

    let isMounted = true;

    // Check initial auth state only once
    const initializeAuth = async () => {
      try {
        await useAppStore.getState().checkAuthState();
      } catch (error) {
        console.error('Error checking initial auth state:', error);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, authSession) => {
        if (!isMounted || isProcessingAuthChange) {
          return;
        }

        console.log('Auth state changed:', event, authSession?.user?.email);
        isProcessingAuthChange = true;

        // Prevent unnecessary updates by checking current state
        const currentState = useAppStore.getState();

        if (event === 'SIGNED_IN' && authSession) {
          // Only update if not already authenticated with the same session
          if (!currentState.isAuthenticated || currentState.session?.user?.id !== authSession.user.id) {
            console.log('Setting authenticated state for user:', authSession.user.email);

            const currentMember = currentState.member;
            const memberData: any = {
              id: authSession.user.id,
              name: currentMember?.name || authSession.user.user_metadata?.full_name || authSession.user.user_metadata?.first_name + ' ' + authSession.user.user_metadata?.last_name || 'User',
              email: authSession.user.email || '',
              phone: currentMember?.phone || '',
              membershipStatus: currentMember?.membershipStatus || 'active',
              membershipPlan: currentMember?.membershipPlan || 'Basic',
              joinDate: currentMember?.joinDate || new Date().toISOString(),
              expiryDate: currentMember?.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            };

            // Add optional properties only if they exist
            if (currentMember?.visitsLeft !== undefined) {
              memberData.visitsLeft = currentMember.visitsLeft;
            }
            if (currentMember?.daysLeft !== undefined) {
              memberData.daysLeft = currentMember.daysLeft;
            }
            if (currentMember?.lastCheckIn !== undefined) {
              memberData.lastCheckIn = currentMember.lastCheckIn;
            }

            // Debounce state updates to prevent rapid successive changes
            const now = Date.now();
            if (now - lastStateUpdate.current < 200) {
              console.log('Debouncing sign-in state update');
              return;
            }

            // Clear any pending state updates
            if (stateUpdateTimeout.current) {
              clearTimeout(stateUpdateTimeout.current);
            }

            // Use a timeout to prevent rapid state updates
            stateUpdateTimeout.current = setTimeout(() => {
              if (isMounted) {
                lastStateUpdate.current = Date.now();
                useAppStore.setState({
                  isAuthenticated: true,
                  session: authSession,
                  member: memberData,
                });
                isProcessingAuthChange = false;
              }
            }, 100);
          } else {
            isProcessingAuthChange = false;
          }
        } else if (event === 'SIGNED_OUT') {
          // Only update if currently authenticated
          if (currentState.isAuthenticated) {
            console.log('Processing sign out event');

            // Debounce state updates to prevent rapid successive changes
            const now = Date.now();
            if (now - lastStateUpdate.current < 200) {
              console.log('Debouncing sign-out state update');
              return;
            }

            // Clear any pending state updates
            if (stateUpdateTimeout.current) {
              clearTimeout(stateUpdateTimeout.current);
            }

            // Use a timeout to prevent rapid state updates
            stateUpdateTimeout.current = setTimeout(() => {
              if (isMounted) {
                lastStateUpdate.current = Date.now();
                useAppStore.setState({
                  isAuthenticated: false,
                  session: null,
                  member: null,
                  bookings: new Set(),
                  bookingHistory: [],
                });
                isProcessingAuthChange = false;
              }
            }, 200); // Longer delay for sign out to ensure navigation completes
          } else {
            isProcessingAuthChange = false;
          }
        } else {
          isProcessingAuthChange = false;
        }
      },
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      // Clear any pending timeouts
      if (stateUpdateTimeout.current) {
        clearTimeout(stateUpdateTimeout.current);
      }
    };
  }, []); // Empty dependency array - only run once

  // Don't return any state that would cause re-renders
  return {};
}
