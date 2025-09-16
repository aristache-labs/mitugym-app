import { create } from 'zustand';
import { supabase } from '../utils/supabase';
import {
  mockMember,
  mockClasses,
  mockBookingHistory,
  generateQRToken,
  type Member,
  type GymClass,
  type BookingHistory,
} from './mock';

interface AuthState {
  isAuthenticated: boolean;
  member: Member | null;
  session: any; // Supabase session
  loginWithSupabase: (email: string, password: string) => Promise<void>;
  signUpWithSupabase: (email: string, password: string, profileData?: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthState: () => Promise<void>;
}

interface ClassState {
  classes: GymClass[];
  bookings: Set<string>;
  bookingHistory: BookingHistory[];
  reserveClass: (classId: string) => void;
  cancelReservation: (classId: string) => void;
  isClassReserved: (classId: string) => boolean;
}

interface QRState {
  token: string;
  expiresAt: number;
  isValid: boolean;
  generateNewToken: () => void;
  checkExpiry: () => void;
}

interface MembershipState {
  renewMembership: (planId: string) => void;
  toggleMembershipStatus: () => void;
}

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
  visible: boolean;
  toastTimeoutId: ReturnType<typeof setTimeout> | null;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
}

type AppState = AuthState & ClassState & QRState & MembershipState & ToastState;

export const useAppStore = create<AppState>((set, get) => ({
  // Auth state
  isAuthenticated: false,
  member: null,
  session: null,


  loginWithSupabase: async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log('Login error:', error.message);
        get().showToast(error.message, 'error');
        throw error;
      }

      if (data.session) {
        console.log('Login successful for:', data.session.user.email);
        // Don't set state here - let useSupabaseAuth handle it to prevent conflicts
        get().showToast('Welcome back!', 'success');
      }
    } catch (error: any) {
      console.log('Login failed:', error.message);
      get().showToast(error.message || 'Login failed', 'error');
      throw error;
    }
  },

  signUpWithSupabase: async (email: string, password: string, profileData?: any) => {
    try {
      console.log('SignUp with profile data:', profileData);
      const signUpParams: any = { email, password };
      if (profileData) {
        signUpParams.options = { data: profileData };
      }
      const { data, error } = await supabase.auth.signUp(signUpParams);

      if (error) {
        console.error('Signup error:', error);
        get().showToast(error.message, 'error');
        throw error;
      }

      console.log('Signup data:', data);

      if (data.session) {
        console.log('Session exists, creating profile...');
        // Create profile record using the database function
        if (profileData) {
          console.log('Creating profile with data:', profileData);

          const { data: profileResult, error: profileError } = await supabase
            .rpc('create_user_profile', {
              user_id: data.session.user.id,
              user_email: email,
              first_name: profileData.first_name,
              last_name: profileData.last_name,
              date_of_birth: profileData.date_of_birth,
              phone: profileData.phone,
              address: profileData.address || null,
              city: profileData.city || null,
              county: profileData.county || null,
              gender: profileData.gender,
            });

          if (profileError) {
            console.error('Error creating profile:', profileError);
            get().showToast('Failed to save profile data', 'error');
          } else {
            console.log('Profile created successfully:', profileResult);
          }
        }

        // Don't set state here - let useSupabaseAuth handle it to prevent conflicts
        get().showToast('Account created successfully!', 'success');
      } else if (data.user && !data.session) {
        console.log('User created but no session (email confirmation required)');
        // Email confirmation required - still create profile for when they confirm
        if (profileData) {
          console.log('Creating profile for unconfirmed user with data:', profileData);

          const { data: profileResult, error: profileError } = await supabase
            .rpc('create_user_profile', {
              user_id: data.user.id,
              user_email: email,
              first_name: profileData.first_name,
              last_name: profileData.last_name,
              date_of_birth: profileData.date_of_birth,
              phone: profileData.phone,
              address: profileData.address || null,
              city: profileData.city || null,
              county: profileData.county || null,
              gender: profileData.gender,
            });

          if (profileError) {
            console.error('Error creating profile for unconfirmed user:', profileError);
          } else {
            console.log('Profile created for unconfirmed user:', profileResult);
          }
        }
        get().showToast('Please check your email to confirm your account', 'info');
      } else {
        console.log('No user or session created');
        get().showToast('Please check your email to confirm your account', 'info');
      }
    } catch (error: any) {
      console.error('SignUp failed:', error);
      get().showToast(error.message || 'Sign up failed', 'error');
      throw error;
    }
  },

  logout: async () => {
    try {
      console.log('Initiating logout...');
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.log('Logout error:', error.message);
        get().showToast(error.message, 'error');
        return;
      }

      console.log('Logout successful - auth state will be handled by useSupabaseAuth');
      // Don't set state here - let useSupabaseAuth handle the SIGNED_OUT event
      get().showToast('Logged out successfully', 'info');
    } catch (error: any) {
      console.log('Logout failed:', error.message);
      get().showToast(error.message || 'Logout failed', 'error');
    }
  },

  checkAuthState: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error checking auth state:', error);
        return;
      }

      const currentState = get();
      // Only update if session state has actually changed
      if (session && (!currentState.isAuthenticated || currentState.session?.user?.id !== session.user.id)) {
        set({
          isAuthenticated: true,
          session,
          member: {
            ...mockMember,
            email: session.user.email || '',
            id: session.user.id,
            name: session.user.user_metadata?.full_name || mockMember.name,
          },
        });
      } else if (!session && currentState.isAuthenticated) {
        // Clear auth state if no session but currently authenticated
        set({
          isAuthenticated: false,
          session: null,
          member: null,
        });
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    }
  },

  // Class state
  classes: mockClasses,
  bookings: new Set(),
  bookingHistory: mockBookingHistory,
  reserveClass: (classId: string) => {
    const { classes, bookings } = get();
    const classToReserve = classes.find(cls => cls.id === classId);

    if (!classToReserve || classToReserve.spotsLeft <= 0) {
      get().showToast('Cannot reserve class - no spots available', 'error');
      return;
    }

    if (bookings.has(classId)) {
      get().showToast('Class already reserved', 'info');
      return;
    }

    const updatedClasses = classes.map(cls =>
      cls.id === classId
        ? { ...cls, spotsLeft: cls.spotsLeft - 1 }
        : cls,
    );

    const newBooking: BookingHistory = {
      id: Date.now().toString(),
      classId,
      className: classToReserve.title,
      date: classToReserve.startAt,
      status: 'upcoming',
    };

    set({
      classes: updatedClasses,
      bookings: new Set([...bookings, classId]),
      bookingHistory: [newBooking, ...get().bookingHistory],
    });

    get().showToast(`Reserved ${classToReserve.title}`, 'success');
  },

  cancelReservation: (classId: string) => {
    const { classes, bookings, bookingHistory } = get();
    const classToCancel = classes.find(cls => cls.id === classId);

    if (!classToCancel || !bookings.has(classId)) {
      get().showToast('No reservation found to cancel', 'error');
      return;
    }

    const updatedClasses = classes.map(cls =>
      cls.id === classId
        ? { ...cls, spotsLeft: cls.spotsLeft + 1 }
        : cls,
    );

    const newBookings = new Set(bookings);
    newBookings.delete(classId);

    const updatedHistory = bookingHistory.map(booking =>
      booking.classId === classId && booking.status === 'upcoming'
        ? { ...booking, status: 'cancelled' as const }
        : booking,
    );

    set({
      classes: updatedClasses,
      bookings: newBookings,
      bookingHistory: updatedHistory,
    });

    get().showToast(`Cancelled ${classToCancel.title}`, 'info');
  },

  isClassReserved: (classId: string) => {
    return get().bookings.has(classId);
  },

  // QR state
  token: generateQRToken(),
  expiresAt: Date.now() + 60000, // 60 seconds from now
  isValid: true,
  generateNewToken: () => {
    const now = Date.now();
    set({
      token: generateQRToken(),
      expiresAt: now + 60000,
      isValid: true,
    });
  },
  checkExpiry: () => {
    const now = Date.now();
    const { expiresAt } = get();

    if (now >= expiresAt) {
      set({ isValid: false });
    }
  },

  // Membership state
  renewMembership: (_planId: string) => {
    // Mock renewal - in real app, this would process payment
    const { member } = get();
    if (member) {
      const renewedMember = {
        ...member,
        membershipStatus: 'active' as const,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        daysLeft: 30,
      };
      set({ member: renewedMember });
      get().showToast('Membership renewed successfully!', 'success');
    }
  },

  toggleMembershipStatus: () => {
    const { member } = get();
    if (member) {
      const updatedMember = {
        ...member,
        membershipStatus: member.membershipStatus === 'active' ? 'expired' as const : 'active' as const,
        daysLeft: member.membershipStatus === 'active' ? 0 : 30,
      };
      set({ member: updatedMember });
    }
  },

  // Toast state
  message: '',
  type: 'info',
  visible: false,
  toastTimeoutId: null as ReturnType<typeof setTimeout> | null,
  showToast: (message: string, type: 'success' | 'error' | 'info') => {
    const state = get();

    // Clear existing timeout
    if (state.toastTimeoutId) {
      clearTimeout(state.toastTimeoutId);
    }

    const timeoutId = setTimeout(() => {
      get().hideToast();
    }, 3000);

    set({ message, type, visible: true, toastTimeoutId: timeoutId });
  },
  hideToast: () => {
    const state = get();
    if (state.toastTimeoutId) {
      clearTimeout(state.toastTimeoutId);
    }
    set({ visible: false, toastTimeoutId: null });
  },
}));
