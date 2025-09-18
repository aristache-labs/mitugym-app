import { create } from 'zustand';
import { supabase } from '../utils/supabase';
import { SecureStorage } from '../utils/secureStorage';
import {
  mockMember,
  mockBookingHistory,
  generateQRToken,
  type Member,
  type Service,
  type ServiceBooking,
  type BookingHistory,
  type MembershipPlan,
  type Checkin,
  type Announcement,
  type GymSchedule,
} from './mock';

interface AuthState {
  isAuthenticated: boolean;
  member: Member | null;
  session: any; // Supabase session
  loginWithSupabase: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUpWithSupabase: (email: string, password: string, profileData?: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthState: () => Promise<void>;
  checkRememberedSession: () => Promise<boolean>;
  loadMemberProfile: () => Promise<void>;
}

interface ServiceState {
  services: Service[];
  servicesLoading: boolean;
  serviceBookings: ServiceBooking[];
  bookingHistory: BookingHistory[];
  fetchServices: () => Promise<void>;
  bookService: (serviceId: string, bookingDate: string, notes?: string) => Promise<void>;
  cancelServiceBooking: (bookingId: string) => void;
  fetchServiceBookings: () => Promise<void>;
}

interface QRState {
  token: string;
  expiresAt: number;
  isValid: boolean;
  generateNewToken: () => void;
  checkExpiry: () => void;
}

interface CheckinState {
  checkins: Checkin[];
  checkinsLoading: boolean;
  currentCheckin: Checkin | null;
  isCheckedIn: boolean;
  fetchCheckins: () => Promise<void>;
  checkIn: (location?: string, notes?: string) => Promise<void>;
  checkOut: (notes?: string) => Promise<void>;
}

interface AnnouncementState {
  announcements: Announcement[];
  announcementsLoading: boolean;
  fetchAnnouncements: () => Promise<void>;
}

interface GymScheduleState {
  gymSchedule: GymSchedule[];
  gymScheduleLoading: boolean;
  todaySchedule: GymSchedule | null;
  fetchGymSchedule: () => Promise<void>;
  getTodayHours: () => string | null;
}

interface MembershipState {
  membershipPlans: MembershipPlan[];
  membershipPlansLoading: boolean;
  fetchMembershipPlans: () => Promise<void>;
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

type AppState = AuthState & ServiceState & QRState & CheckinState & AnnouncementState & GymScheduleState & MembershipState & ToastState;

export const useAppStore = create<AppState>((set, get) => ({
  // Auth state
  isAuthenticated: false,
  member: null,
  session: null,


  loginWithSupabase: async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      console.log('Attempting login for:', email, 'rememberMe:', rememberMe);
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

        // Store remember me data if requested
        if (rememberMe && data.session.access_token) {
          try {
            await SecureStorage.storeRememberMeData(email, data.session.access_token);
            console.log('Remember me data stored successfully');
          } catch (storageError) {
            console.error('Failed to store remember me data:', storageError);
            // Don't fail the login if storage fails
          }
        }

        // Don't set state here - let authManager handle it to prevent conflicts
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

      // Clear remember me data on logout FIRST
      console.log('Clearing remember me data...');
      await SecureStorage.clearRememberMeData();
      console.log('Remember me data cleared successfully');

      console.log('Signing out from Supabase...');
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Logout error:', error.message);
        get().showToast(error.message, 'error');
        return;
      }

      console.log('Supabase logout successful - auth state will be handled by authManager');
      // Don't set state here - let authManager handle the SIGNED_OUT event
      get().showToast('Logged out successfully', 'info');
    } catch (error: any) {
      console.error('Logout failed:', error.message);
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

  checkRememberedSession: async () => {
    try {
      console.log('Checking for remembered session...');
      const rememberMeData = await SecureStorage.getRememberMeData();

      if (!rememberMeData) {
        console.log('No remembered session found');
        return false;
      }

      console.log('Found remembered session for:', rememberMeData.email);

      // Try to restore session using the stored token
      const { data, error } = await supabase.auth.setSession({
        access_token: rememberMeData.sessionToken,
        refresh_token: '', // We don't store refresh token for security
      });

      if (error || !data.session) {
        console.log('Failed to restore remembered session:', error?.message);
        // Clear invalid remember me data
        await SecureStorage.clearRememberMeData();
        return false;
      }

      console.log('Successfully restored remembered session');
      // Refresh the remember me data with new expiry
      await SecureStorage.refreshRememberMeData();
      return true;
    } catch (error) {
      console.error('Error checking remembered session:', error);
      await SecureStorage.clearRememberMeData();
      return false;
    }
  },

  loadMemberProfile: async () => {
    try {
      const { session } = get();
      if (!session?.user?.id) {
        console.log('No session available for loading profile');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error loading member profile:', error);
        return;
      }

      if (data) {
        // Transform profile data to Member format
        const member: Member = {
          id: data.id,
          name: `${data.first_name} ${data.last_name}`,
          email: data.email || '',
          phone: data.phone || '',
          membershipStatus: data.membership_status || 'expired',
          membershipPlan: data.membership_plan || 'No Plan',
          joinDate: data.join_date || '',
          expiryDate: data.expiry_date || '',
          daysLeft: data.days_left || 0,
          lastCheckIn: data.last_check_in || undefined,
        };

        console.log('Loaded member profile:', member);
        set({ member });
      }
    } catch (error) {
      console.error('Error loading member profile:', error);
    }
  },

  // Service state
  services: [],
  servicesLoading: false,
  serviceBookings: [],
  bookingHistory: mockBookingHistory,

  fetchServices: async () => {
    set({ servicesLoading: true });
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching services:', error);
        get().showToast('Failed to load services', 'error');
        return;
      }

      set({ services: data || [] });
    } catch (error) {
      console.error('Error fetching services:', error);
      get().showToast('Failed to load services', 'error');
    } finally {
      set({ servicesLoading: false });
    }
  },

  bookService: async (serviceId: string, bookingDate: string, notes?: string) => {
    try {
      const { session } = get();
      if (!session?.user?.id) {
        get().showToast('Please log in to book services', 'error');
        return;
      }

      const service = get().services.find(s => s.id === serviceId);
      if (!service) {
        get().showToast('Service not found', 'error');
        return;
      }

      // Check advance booking requirement
      if (service.requires_advance_booking) {
        const bookingDateTime = new Date(bookingDate);
        const now = new Date();
        const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        if (hoursUntilBooking < service.advance_booking_hours) {
          get().showToast(`This service requires ${service.advance_booking_hours} hours advance booking`, 'error');
          return;
        }
      }

      const bookingData = {
        user_id: session.user.id,
        service_id: serviceId,
        booking_date: bookingDate,
        status: 'upcoming' as const,
        sessions_remaining: service.max_sessions || null,
        notes: notes || null,
      };

      const { data, error } = await supabase
        .from('service_bookings')
        .insert([bookingData])
        .select()
        .single();

      if (error) {
        console.error('Error booking service:', error);
        get().showToast('Failed to book service', 'error');
        return;
      }

      if (data) {
        // Add to local state
        set({
          serviceBookings: [...get().serviceBookings, data],
        });
        
        get().showToast(`Booked ${service.name} successfully!`, 'success');
      }
    } catch (error) {
      console.error('Error booking service:', error);
      get().showToast('Failed to book service', 'error');
    }
  },

  cancelServiceBooking: async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('service_bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) {
        console.error('Error cancelling booking:', error);
        get().showToast('Failed to cancel booking', 'error');
        return;
      }

      // Update local state
      const updatedBookings = get().serviceBookings.map(booking =>
        booking.id === bookingId
          ? { ...booking, status: 'cancelled' as const }
          : booking,
      );

      set({ serviceBookings: updatedBookings });
      get().showToast('Booking cancelled successfully', 'info');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      get().showToast('Failed to cancel booking', 'error');
    }
  },

  fetchServiceBookings: async () => {
    try {
      const { session } = get();
      if (!session?.user?.id) {
        return;
      }

      const { data, error } = await supabase
        .from('service_bookings')
        .select(`
          *,
          services(name, service_type, duration_minutes)
        `)
        .eq('user_id', session.user.id)
        .order('booking_date', { ascending: false });

      if (error) {
        console.error('Error fetching service bookings:', error);
        return;
      }

      set({ serviceBookings: data || [] });
    } catch (error) {
      console.error('Error fetching service bookings:', error);
    }
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

  // Check-in state
  checkins: [],
  checkinsLoading: false,
  currentCheckin: null,
  isCheckedIn: false,

  fetchCheckins: async () => {
    set({ checkinsLoading: true });
    try {
      const { session } = get();
      if (!session?.user?.id) {
        return;
      }

      const { data, error } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', session.user.id)
        .order('check_in_time', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching checkins:', error);
        get().showToast('Failed to load check-ins', 'error');
        return;
      }

      const checkins = data || [];
      
      // Check if user is currently checked in (has a checkin without checkout)
      const currentCheckin = checkins.find(c => !c.check_out_time);
      
      set({ 
        checkins,
        currentCheckin: currentCheckin || null,
        isCheckedIn: !!currentCheckin
      });
    } catch (error) {
      console.error('Error fetching checkins:', error);
      get().showToast('Failed to load check-ins', 'error');
    } finally {
      set({ checkinsLoading: false });
    }
  },

  checkIn: async (location = 'MITUGYM Main', notes = '') => {
    try {
      const { session, isCheckedIn } = get();
      if (!session?.user?.id) {
        get().showToast('Please log in to check in', 'error');
        return;
      }

      if (isCheckedIn) {
        get().showToast('You are already checked in', 'info');
        return;
      }

      const checkinData = {
        user_id: session.user.id,
        check_in_time: new Date().toISOString(),
        location,
        notes: notes || null,
      };

      const { data, error } = await supabase
        .from('checkins')
        .insert([checkinData])
        .select()
        .single();

      if (error) {
        console.error('Error checking in:', error);
        get().showToast('Failed to check in', 'error');
        return;
      }

      if (data) {
        set({
          currentCheckin: data,
          isCheckedIn: true,
          checkins: [data, ...get().checkins],
        });
        
        get().showToast('Checked in successfully!', 'success');
      }
    } catch (error) {
      console.error('Error checking in:', error);
      get().showToast('Failed to check in', 'error');
    }
  },

  checkOut: async (notes = '') => {
    try {
      const { currentCheckin, isCheckedIn } = get();
      
      if (!isCheckedIn || !currentCheckin) {
        get().showToast('You are not currently checked in', 'error');
        return;
      }

      const checkOutTime = new Date().toISOString();
      const updateData: any = {
        check_out_time: checkOutTime,
        updated_at: checkOutTime,
      };

      if (notes) {
        updateData.notes = currentCheckin.notes ? `${currentCheckin.notes} | ${notes}` : notes;
      }

      const { data, error } = await supabase
        .from('checkins')
        .update(updateData)
        .eq('id', currentCheckin.id)
        .select()
        .single();

      if (error) {
        console.error('Error checking out:', error);
        get().showToast('Failed to check out', 'error');
        return;
      }

      if (data) {
        // Update the checkin in the list
        const updatedCheckins = get().checkins.map(c => 
          c.id === currentCheckin.id ? data : c
        );

        set({
          currentCheckin: null,
          isCheckedIn: false,
          checkins: updatedCheckins,
        });
        
        const duration = data.duration_minutes ? `${Math.round(data.duration_minutes)} minutes` : '';
        get().showToast(`Checked out successfully! ${duration}`, 'success');
      }
    } catch (error) {
      console.error('Error checking out:', error);
      get().showToast('Failed to check out', 'error');
    }
  },

  // Announcement state
  announcements: [],
  announcementsLoading: false,

  fetchAnnouncements: async () => {
    set({ announcementsLoading: true });
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', new Date().toISOString())
        .or('end_date.is.null,end_date.gte.' + new Date().toISOString())
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching announcements:', error);
        get().showToast('Failed to load announcements', 'error');
        return;
      }

      set({ announcements: data || [] });
    } catch (error) {
      console.error('Error fetching announcements:', error);
      get().showToast('Failed to load announcements', 'error');
    } finally {
      set({ announcementsLoading: false });
    }
  },

  // Gym Schedule state
  gymSchedule: [],
  gymScheduleLoading: false,
  todaySchedule: null,

  fetchGymSchedule: async () => {
    set({ gymScheduleLoading: true });
    try {
      const { data, error } = await supabase
        .from('gym_schedule')
        .select('*')
        .eq('is_active', true)
        .order('day_of_week', { ascending: true });

      if (error) {
        console.error('Error fetching gym schedule:', error);
        get().showToast('Failed to load gym schedule', 'error');
        return;
      }

      const schedule = data || [];
      const today = new Date().getDay(); // 0=Sunday, 1=Monday, etc.
      const todaySchedule = schedule.find(s => s.day_of_week === today) || null;

      set({ 
        gymSchedule: schedule,
        todaySchedule 
      });
    } catch (error) {
      console.error('Error fetching gym schedule:', error);
      get().showToast('Failed to load gym schedule', 'error');
    } finally {
      set({ gymScheduleLoading: false });
    }
  },

  getTodayHours: () => {
    const { todaySchedule } = get();
    if (!todaySchedule) return null;
    
    // Convert 24h time to 12h format
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours || '0');
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes || '00'} ${ampm}`;
    };

    return formatTime(todaySchedule.close_time);
  },

  // Membership state
  membershipPlans: [],
  membershipPlansLoading: false,

  fetchMembershipPlans: async () => {
    set({ membershipPlansLoading: true });
    try {
      const { data, error } = await supabase
        .from('membership_plans')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching membership plans:', error);
        get().showToast('Failed to load membership plans', 'error');
        return;
      }

      set({ membershipPlans: data || [] });
    } catch (error) {
      console.error('Error fetching membership plans:', error);
      get().showToast('Failed to load membership plans', 'error');
    } finally {
      set({ membershipPlansLoading: false });
    }
  },

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
