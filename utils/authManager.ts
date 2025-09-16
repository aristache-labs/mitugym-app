import { supabase } from './supabase';
import { useAppStore } from '../lib/store';

class AuthManager {
  private initialized = false;
  private subscription: any = null;
  private isProcessing = false;

  async initialize() {
    if (this.initialized) {
      return;
    }

    console.log('AuthManager: Initializing...');
    this.initialized = true;

    try {
      // Check initial auth state
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('AuthManager: Error getting session:', error);
      } else {
        console.log('AuthManager: Initial session:', session?.user?.email || 'none');
        if (session) {
          this.handleAuthChange('SIGNED_IN', session);
        }
      }

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, authSession) => {
          if (this.isProcessing) {
            console.log('AuthManager: Already processing, skipping event:', event);
            return;
          }

          console.log('AuthManager: Auth state changed:', event, authSession?.user?.email);
          this.handleAuthChange(event, authSession);
        },
      );

      this.subscription = subscription;
    } catch (error) {
      console.error('AuthManager: Initialization failed:', error);
    }
  }

  private handleAuthChange(event: string, authSession: any) {
    this.isProcessing = true;

    try {
      const currentState = useAppStore.getState();

      if (event === 'SIGNED_IN' && authSession) {
        if (!currentState.isAuthenticated || currentState.session?.user?.id !== authSession.user.id) {
          console.log('AuthManager: Setting authenticated state');

          const memberData = {
            id: authSession.user.id,
            name: authSession.user.user_metadata?.first_name + ' ' + authSession.user.user_metadata?.last_name || 'User',
            email: authSession.user.email || '',
            phone: '',
            membershipStatus: 'active' as const,
            membershipPlan: 'Basic',
            joinDate: new Date().toISOString(),
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            visitsLeft: 10,
          };

          setTimeout(() => {
            console.log('AuthManager: Applying authenticated state');
            useAppStore.setState({
              isAuthenticated: true,
              session: authSession,
              member: memberData,
            });
            this.isProcessing = false;
          }, 300);
        } else {
          this.isProcessing = false;
        }
      } else if (event === 'SIGNED_OUT') {
        if (currentState.isAuthenticated) {
          console.log('AuthManager: Processing sign out');
            setTimeout(() => {
              console.log('AuthManager: Applying signed out state');
              useAppStore.setState({
                isAuthenticated: false,
                session: null,
                member: null,
                bookings: new Set(),
                bookingHistory: [],
              });
              this.isProcessing = false;
            }, 500);
        } else {
          this.isProcessing = false;
        }
      } else {
        this.isProcessing = false;
      }
    } catch (error) {
      console.error('AuthManager: Error handling auth change:', error);
      this.isProcessing = false;
    }
  }

  cleanup() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    this.initialized = false;
    this.isProcessing = false;
  }
}

export const authManager = new AuthManager();
