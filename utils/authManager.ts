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
        } else {
          // No active session, check for remembered session only if not during logout
          console.log('AuthManager: No active session, checking for remembered session...');
          try {
            // Add a small delay to avoid race conditions during logout
            setTimeout(async () => {
              try {
                const hasRememberedSession = await useAppStore.getState().checkRememberedSession();
                if (hasRememberedSession) {
                  console.log('AuthManager: Successfully restored remembered session');
                } else {
                  console.log('AuthManager: No valid remembered session found');
                }
              } catch (rememberError) {
                console.error('AuthManager: Error checking remembered session:', rememberError);
              }
            }, 500); // Wait 500ms to avoid logout race condition
          } catch (rememberError) {
            console.error('AuthManager: Error setting up remembered session check:', rememberError);
          }
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

          setTimeout(async () => {
            console.log('AuthManager: Applying authenticated state and loading profile');
            useAppStore.setState({
              isAuthenticated: true,
              session: authSession,
            });
            
            // Load real member profile from Supabase
            try {
              await useAppStore.getState().loadMemberProfile();
              console.log('AuthManager: Member profile loaded successfully');
            } catch (error) {
              console.error('AuthManager: Failed to load member profile:', error);
            }

            // Load user checkins
            try {
              await useAppStore.getState().fetchCheckins();
              console.log('AuthManager: Check-ins loaded successfully');
            } catch (error) {
              console.error('AuthManager: Failed to load check-ins:', error);
            }

            // Load announcements and gym schedule
            try {
              await Promise.all([
                useAppStore.getState().fetchAnnouncements(),
                useAppStore.getState().fetchGymSchedule()
              ]);
              console.log('AuthManager: Announcements and gym schedule loaded successfully');
            } catch (error) {
              console.error('AuthManager: Failed to load announcements/schedule:', error);
            }
            
            this.isProcessing = false;
          }, 300);
        } else {
          this.isProcessing = false;
        }
      } else if (event === 'SIGNED_OUT') {
        if (currentState.isAuthenticated) {
          console.log('AuthManager: Processing sign out - clearing all state');
          // Clear state immediately for logout
          setTimeout(() => {
            console.log('AuthManager: Applying signed out state');
            useAppStore.setState({
              isAuthenticated: false,
              session: null,
              member: null,
              // Clear push notification state so it loads fresh for next user
              pushNotificationsEnabled: false,
              pushToken: null,
            });
            this.isProcessing = false;
            console.log('AuthManager: Sign out state applied successfully');
          }, 200); // Faster state update for logout
        } else {
          console.log('AuthManager: Already signed out, skipping state update');
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
