/* eslint-disable max-lines */
import { create } from 'zustand';
import { Alert } from 'react-native';
import { supabase } from '../utils/supabase';
import { SecureStorage } from '../utils/secureStorage';
import type { TranslationKey } from './translations';
import { translations } from './translations';
import {
  mockMember,
  mockBookingHistory,
  generateQRToken,
  type Member,
  type Service,
  type ServiceBooking,
  type PurchasedService,
  type SessionBooking,
  type BookingHistory,
  type MembershipPlan,
  type Checkin,
  type Announcement,
  type GymSchedule,
} from './mock';

export interface Notification {
  id: string;
  member_id: string | null;
  type: string;
  title: string;
  message: string;
  reference_id?: string;
  reference_type?: string;
  is_read: boolean;
  is_global: boolean;
  is_admin_only?: boolean;
  created_at: string;
}
import { generateTOTPCode as generateTOTPCodeUtil, getTOTPTimeRemaining, setupTOTP } from '../utils/totp';
import {
  registerForPushNotificationsAsync,
  savePushTokenToDatabase,
  deactivatePushToken,
} from '../utils/pushNotifications';
import { isBiometricAvailable } from '../utils/biometricAuth';

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
  purchasedServices: PurchasedService[];
  sessionBookings: SessionBooking[];
  bookingHistory: BookingHistory[];
  fetchServices: () => Promise<void>;
  purchaseService: (serviceId: string, notes?: string) => Promise<void>;
  fetchPurchasedServices: () => Promise<void>;
  bookSession: (purchasedServiceId: string, bookingDate: string, notes?: string) => Promise<boolean>;
  updateSession: (sessionId: string, bookingDate: string, notes?: string) => Promise<boolean>;
  fetchSessionBookings: () => Promise<void>;
  cancelSession: (sessionId: string) => Promise<void>;
  // Legacy functions for backwards compatibility
  bookService: (serviceId: string, bookingDate: string, notes?: string) => Promise<void>;
  cancelServiceBooking: (bookingId: string) => void;
  fetchServiceBookings: () => Promise<void>;
}

interface QRState {
  token: string;
  expiresAt: number;
  isValid: boolean;
  totpSecret: string | null;
  totpCode: string;
  totpTimeRemaining: number;
  generateNewToken: () => void;
  checkExpiry: () => void;
  initializeTOTP: () => Promise<void>;
  generateTOTPCode: () => void;
  updateTOTPTimeRemaining: () => void;
}

interface CheckinState {
  checkins: Checkin[];
  checkinsLoading: boolean;
  currentCheckin: Checkin | null;
  isCheckedIn: boolean;
  fetchCheckins: () => Promise<void>;
  checkIn: (notes?: string) => Promise<void>;
  checkOut: (notes?: string) => Promise<void>;
  getValidatedPeopleInGym: () => Promise<number>;
  runAutoCheckout: () => Promise<void>;
  runCleanupInvalidCheckins: () => Promise<number>;
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
  isGymOpen: () => boolean;
  getTodayHours: (t?: (key: TranslationKey) => string) => string | null;
}

interface MembershipState {
  membershipPlans: MembershipPlan[];
  membershipPlansLoading: boolean;
  fetchMembershipPlans: () => Promise<void>;
  renewMembership: (planId: string) => void;
  toggleMembershipStatus: () => void;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  notificationsLoading: boolean;
  notificationSubscription: any;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  subscribeToNotifications: () => void;
  unsubscribeFromNotifications: () => void;
}

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  visible: boolean;
  description: string | undefined;
  duration: number | undefined;
  toastTimeoutId: ReturnType<typeof setTimeout> | null;
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info', description?: string, duration?: number) => void;
  hideToast: () => void;
}

interface LanguageState {
  language: 'en' | 'ro';
  setLanguage: (lang: 'en' | 'ro') => void;
}

interface PushNotificationState {
  pushToken: string | null;
  pushNotificationsEnabled: boolean;
  registerPushNotifications: () => Promise<boolean>;
  unregisterPushNotifications: () => Promise<boolean>;
  setPushNotificationsEnabled: (enabled: boolean) => void;
}

interface BiometricState {
  biometricEnabled: boolean;
  biometricAvailable: boolean;
  setBiometricEnabled: (enabled: boolean) => Promise<void>;
  checkBiometricAvailability: () => Promise<void>;
}

type AppState = AuthState & ServiceState & QRState & CheckinState & AnnouncementState & GymScheduleState & MembershipState & NotificationState & ToastState & LanguageState & PushNotificationState & BiometricState;

// Helper function to map notification types to toast types
const getToastTypeFromNotification = (notificationType: string): 'success' | 'error' | 'warning' | 'info' => {
  const lowerType = notificationType.toLowerCase();

  // Success notifications
  if (lowerType.includes('success') ||
      lowerType.includes('approved') ||
      lowerType.includes('confirmed') ||
      lowerType.includes('completed') ||
      lowerType.includes('updated') ||
      lowerType.includes('profile_update')) {
    return 'success';
  }

  // Error notifications
  if (lowerType.includes('error') ||
      lowerType.includes('failed') ||
      lowerType.includes('rejected') ||
      lowerType.includes('cancelled') ||
      lowerType.includes('expired')) {
    return 'error';
  }

  // Warning notifications
  if (lowerType.includes('warning') ||
      lowerType.includes('expiring') ||
      lowerType.includes('pending') ||
      lowerType.includes('attention')) {
    return 'warning';
  }

  // Default to info for general notifications
  return 'info';
};

// Helper function to translate notification messages using translations system
const translateNotification = (title: string, message: string, language: 'en' | 'ro'): { title: string; message: string } => {
  const t = translations[language];

  // Map notification titles to translation keys
  const titleMap: Record<string, keyof typeof translations.en> = {
    'Profile Updated': 'profileUpdated',
    'Membership Approved': 'membershipApproved',
    'Membership Expired': 'membershipExpired',
    'Session Approved': 'sessionApproved',
    'Session Cancelled': 'sessionCancelled',
    'Booking Approved': 'bookingApproved',
    'Booking Rejected': 'bookingRejected',
    'Gym Schedule Updated': 'gymScheduleUpdated',
  };

  const messageMap: Record<string, keyof typeof translations.en> = {
    'Profile Updated': 'profileUpdatedDesc',
    'Membership Approved': 'membershipApprovedDesc',
    'Membership Expired': 'membershipExpiredDesc',
    'Session Approved': 'sessionApprovedDesc',
    'Session Cancelled': 'sessionCancelledDesc',
    'Booking Approved': 'bookingApprovedDesc',
    'Booking Rejected': 'bookingRejectedDesc',
    'Gym Schedule Updated': 'gymScheduleUpdatedDesc',
  };

  const titleKey = titleMap[title];
  const messageKey = messageMap[title];

  if (titleKey && t[titleKey]) {
    return {
      title: t[titleKey],
      message: messageKey && t[messageKey] ? t[messageKey] : message,
    };
  }

  // Return original if no translation found
  return { title, message };
};

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

        // Store biometric credentials if biometric is enabled
        const biometricEnabled = await SecureStorage.isBiometricEnabled();
        if (biometricEnabled) {
          try {
            await SecureStorage.storeBiometricCredentials(email, password);
            console.log('Biometric credentials stored successfully');
          } catch (storageError) {
            console.error('Failed to store biometric credentials:', storageError);
            // Don't fail the login if storage fails
          }
        }

        // Don't set state here - let authManager handle it to prevent conflicts
        // Removed "Welcome back!" toast - user can see they're logged in from the UI
      }
    } catch (error: any) {
      console.log('Login failed:', error.message);
      // Show error with description using translations
      const t = translations[get().language];
      const errorTitle = t.loginFailed;
      const errorDescription = error.message || t.loginFailedDesc;
      get().showToast(errorTitle, 'error', errorDescription);
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
        console.log('Session exists, profile created automatically by trigger');

        // Initialize TOTP for new user
        try {
          await get().initializeTOTP();
        } catch (totpError) {
          console.error('Failed to initialize TOTP during signup:', totpError);
          // Don't fail signup if TOTP setup fails
        }

        get().showToast('Account created successfully!', 'success');
      } else if (data.user && !data.session) {
        console.log('User created but no session (email confirmation required)');
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

      // Only clear biometric credentials if biometric is NOT enabled
      // If enabled, keep credentials for biometric login on next session
      const biometricEnabled = await SecureStorage.isBiometricEnabled();
      if (!biometricEnabled) {
        console.log('Clearing biometric credentials...');
        await SecureStorage.clearBiometricCredentials();
        console.log('Biometric credentials cleared successfully');
      } else {
        console.log('Biometric enabled - keeping credentials for next login');
      }

      console.log('Signing out from Supabase...');

      // Unsubscribe from notifications before logout
      get().unsubscribeFromNotifications();

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Logout error:', error.message);
        get().showToast(error.message, 'error');
        return;
      }

      console.log('Supabase logout successful - auth state will be handled by authManager');
      // Don't set state here - let authManager handle the SIGNED_OUT event
      // Removed "Logged out successfully" toast - user navigates to login screen anyway
    } catch (error: any) {
      console.error('Logout failed:', error.message);
      const t = translations[get().language];
      const errorTitle = t.logoutFailed;
      const errorDescription = error.message || t.logoutFailedDesc;
      get().showToast(errorTitle, 'error', errorDescription);
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
        // Resolve membership plan ID to plan name
        let planName = '';

        if (data.plan_id) {
          const { data: planData } = await supabase
            .from('membership_plans')
            .select('name')
            .eq('id', data.plan_id)
            .single();

          if (planData?.name) {
            planName = planData.name;
          }
        }
        // Transform profile data to Member format
        const member: Member = {
          id: data.id,
          name: `${data.first_name} ${data.last_name}`,
          email: data.email || '',
          phone: data.phone || '',
          membershipStatus: data.status || 'expired',
          membershipPlan: planName,
          joinDate: data.join_date || '',
          expiryDate: data.expires_at || '',
          planStartDate: data.starts_at || undefined,
          daysLeft: data.days_left || 0,
          lastCheckIn: data.last_check_in || undefined,
        };

        console.log('Loaded member profile:', member);
        set({ member });

        // Fetch notifications and subscribe to real-time updates
        await get().fetchNotifications();
        get().subscribeToNotifications();
      }
    } catch (error) {
      console.error('Error loading member profile:', error);
    }
  },

  // Service state
  services: [],
  servicesLoading: false,
  serviceBookings: [],
  purchasedServices: [],
  sessionBookings: [],
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
        member_id: session.user.id,
        service_id: serviceId,
        booking_date: bookingDate,
        status: 'pending' as const, // Set to pending for admin approval
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

        get().showToast(`${service.name} booking submitted! Awaiting approval.`, 'success');
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
        .eq('member_id', session.user.id)
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

  // New service purchase functions
  purchaseService: async (serviceId: string, notes?: string) => {
    try {
      const { session, member } = get();
      if (!session?.user?.id) {
        get().showToast('Please log in to purchase services', 'error');
        return;
      }

      // Check membership status
      if (!member || member.membershipStatus !== 'active') {
        const statusMessages: { [key: string]: string } = {
          'expired': 'Your membership has expired. Please renew to purchase services.',
          'pending': 'Your membership is pending approval. Please wait for activation.',
          'cancelled': 'Your membership has been cancelled. Please contact support.',
        };
        const message = member?.membershipStatus
          ? statusMessages[member.membershipStatus] || 'You need an active membership to purchase services.'
          : 'You need an active membership to purchase services. Please purchase a plan first.';
        get().showToast(message, 'error');
        return;
      }

      const service = get().services.find(s => s.id === serviceId);
      if (!service) {
        get().showToast('Service not found', 'error');
        return;
      }

      const purchaseData = {
        member_id: session.user.id,
        service_id: serviceId,
        status: 'pending' as const,
        sessions_total: service.max_sessions || 1,
        sessions_remaining: service.max_sessions || 1,
        notes: notes || null,
      };

      const { data, error } = await supabase
        .from('purchased_services')
        .insert([purchaseData])
        .select(`
          *,
          services(name, service_type, duration_minutes, price)
        `)
        .single();

      if (error) {
        console.error('Error purchasing service:', error);
        get().showToast('Failed to purchase service', 'error');
        return;
      }

      if (data) {
        // Add to local state with service relationship
        set({
          purchasedServices: [...get().purchasedServices, data],
        });

        get().showToast(`${service.name} purchase submitted! Awaiting approval.`, 'success');
      }
    } catch (error) {
      console.error('Error purchasing service:', error);
      get().showToast('Failed to purchase service', 'error');
    }
  },

  fetchPurchasedServices: async () => {
    try {
      const { session } = get();
      if (!session?.user?.id) {
        return;
      }

      const { data, error } = await supabase
        .from('purchased_services')
        .select(`
          *,
          services(name, service_type, duration_minutes, price)
        `)
        .eq('member_id', session.user.id)
        .order('purchase_date', { ascending: false });

      if (error) {
        console.error('Error fetching purchased services:', error);
        return;
      }

      set({ purchasedServices: data || [] });
    } catch (error) {
      console.error('Error fetching purchased services:', error);
    }
  },

  bookSession: async (purchasedServiceId: string, bookingDate: string, notes?: string): Promise<boolean> => {
    try {
      const { session, member } = get();
      if (!session?.user?.id) {
        get().showToast('Please log in to book sessions', 'error');
        return false;
      }

      // Check membership status
      if (!member || member.membershipStatus !== 'active') {
        const statusMessages: { [key: string]: string } = {
          'expired': 'Your membership has expired. Please renew to book sessions.',
          'pending': 'Your membership is pending approval. Please wait for activation.',
          'cancelled': 'Your membership has been cancelled. Please contact support.',
        };
        const message = member?.membershipStatus
          ? statusMessages[member.membershipStatus] || 'You need an active membership to book sessions.'
          : 'You need an active membership to book sessions. Please purchase a plan first.';
        get().showToast(message, 'error');
        return false;
      }

      const purchasedService = get().purchasedServices.find(ps => ps.id === purchasedServiceId);
      if (!purchasedService) {
        get().showToast('Purchased service not found', 'error');
        return false;
      }

      if (purchasedService.status !== 'approved') {
        get().showToast('Service must be approved before booking sessions', 'error');
        return false;
      }

      if (purchasedService.sessions_remaining <= 0) {
        get().showToast('No sessions remaining for this service', 'error');
        return false;
      }

      // Check for time conflicts
      const requestedTime = new Date(bookingDate);

      // First, check for exact same time bookings
      const { data: exactTimeBookings, error: exactTimeError } = await supabase
        .from('session_bookings')
        .select('booking_date, status')
        .eq('member_id', session.user.id)
        .eq('booking_date', bookingDate)
        .in('status', ['pending', 'confirmed', 'upcoming']);

      if (exactTimeError) {
        console.error('Error checking exact time conflicts:', exactTimeError);
        get().showToast('Failed to validate booking time', 'error');
        return false;
      }

      if (exactTimeBookings && exactTimeBookings.length > 0) {
        const lang = get().language;
        const message = translations[lang].exactTimeConflict;
        Alert.alert(translations[lang].error, message);
        return false;
      }

      // Then check for 1 hour minimum gap between sessions
      const oneHourBefore = new Date(requestedTime.getTime() - (60 * 60 * 1000));
      const oneHourAfter = new Date(requestedTime.getTime() + (60 * 60 * 1000));

      // Get all active bookings for the user
      const { data: allBookings, error: allBookingsError } = await supabase
        .from('session_bookings')
        .select('booking_date, status')
        .eq('member_id', session.user.id)
        .in('status', ['pending', 'confirmed', 'upcoming']);

      if (allBookingsError) {
        console.error('Error checking booking conflicts:', allBookingsError);
        get().showToast('Failed to validate booking time', 'error');
        return false;
      }

      // Check for conflicts manually to ensure proper time comparison
      if (allBookings && allBookings.length > 0) {
        const conflictingBookings = allBookings.filter(booking => {
          const bookingTime = new Date(booking.booking_date);
          return bookingTime > oneHourBefore && bookingTime < oneHourAfter;
        });

        if (conflictingBookings.length > 0) {
          const lang = get().language;
          const message = translations[lang].bookingTimeConflict;
          Alert.alert(translations[lang].error, message);
          return false;
        }
      }

      const bookingData = {
        purchased_service_id: purchasedServiceId,
        member_id: session.user.id,
        booking_date: bookingDate,
        status: 'pending' as const,
        notes: notes || null,
      };

      const { data, error } = await supabase
        .from('session_bookings')
        .insert([bookingData])
        .select()
        .single();

      if (error) {
        console.error('Error booking session:', error);

        // Check if it's a unique constraint violation (duplicate booking)
        if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('unique')) {
          const lang = get().language;
          const message = translations[lang].exactTimeConflict;
          Alert.alert(translations[lang].error, message);
        } else {
          const lang = get().language;
          const message = translations[lang].bookingFailed;
          Alert.alert(translations[lang].error, message);
        }
        return false;
      }

      if (data) {
        // Add to local state
        set({
          sessionBookings: [...get().sessionBookings, data],
        });

        const t = translations[get().language];
        get().showToast(t.sessionBookingSubmitted, 'success', t.sessionBookingSubmittedDesc);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error booking session:', error);
      get().showToast('Failed to book session', 'error');
      return false;
    }
  },

  updateSession: async (sessionId: string, bookingDate: string, notes?: string): Promise<boolean> => {
    try {
      const { session, member } = get();
      if (!session?.user?.id) {
        get().showToast('Please log in to update sessions', 'error');
        return false;
      }

      // Check membership status
      if (!member || member.membershipStatus !== 'active') {
        const statusMessages: { [key: string]: string } = {
          'expired': 'Your membership has expired. Please renew to update sessions.',
          'pending': 'Your membership is pending approval. Please wait for activation.',
          'cancelled': 'Your membership has been cancelled. Please contact support.',
        };
        const message = member?.membershipStatus
          ? statusMessages[member.membershipStatus] || 'You need an active membership to update sessions.'
          : 'You need an active membership to update sessions. Please purchase a plan first.';
        get().showToast(message, 'error');
        return false;
      }

      // Check for time conflicts with OTHER sessions (exclude the current session being edited)
      const requestedTime = new Date(bookingDate);

      // First, check for exact same time bookings (excluding current session)
      const { data: exactTimeBookings, error: exactTimeError } = await supabase
        .from('session_bookings')
        .select('booking_date, status')
        .eq('member_id', session.user.id)
        .eq('booking_date', bookingDate)
        .in('status', ['pending', 'confirmed', 'upcoming'])
        .neq('id', sessionId);

      if (exactTimeError) {
        console.error('Error checking exact time conflicts:', exactTimeError);
        get().showToast('Failed to validate booking time', 'error');
        return false;
      }

      if (exactTimeBookings && exactTimeBookings.length > 0) {
        const lang = get().language;
        const message = translations[lang].exactTimeConflict;
        Alert.alert(translations[lang].error, message);
        return false;
      }

      // Then check for 1 hour minimum gap between sessions (excluding current session)
      const oneHourBefore = new Date(requestedTime.getTime() - (60 * 60 * 1000));
      const oneHourAfter = new Date(requestedTime.getTime() + (60 * 60 * 1000));

      // Get all active bookings for the user (excluding current session)
      const { data: allBookings, error: allBookingsError } = await supabase
        .from('session_bookings')
        .select('booking_date, status')
        .eq('member_id', session.user.id)
        .in('status', ['pending', 'confirmed', 'upcoming'])
        .neq('id', sessionId);

      if (allBookingsError) {
        console.error('Error checking booking conflicts:', allBookingsError);
        get().showToast('Failed to validate booking time', 'error');
        return false;
      }

      // Check for conflicts manually to ensure proper time comparison
      if (allBookings && allBookings.length > 0) {
        const conflictingBookings = allBookings.filter(booking => {
          const bookingTime = new Date(booking.booking_date);
          return bookingTime > oneHourBefore && bookingTime < oneHourAfter;
        });

        if (conflictingBookings.length > 0) {
          const lang = get().language;
          const message = translations[lang].bookingTimeConflict;
          Alert.alert(translations[lang].error, message);
          return false;
        }
      }

      const updateData = {
        booking_date: bookingDate,
        notes: notes || null,
      };

      const { data, error } = await supabase
        .from('session_bookings')
        .update(updateData)
        .eq('id', sessionId)
        .eq('member_id', session.user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating session:', error);
        const lang = get().language;

        // Check if it's a permission error (RLS policy blocked it)
        if (error.code === 'PGRST116' || error.message?.includes('0 rows')) {
          Alert.alert(
            translations[lang].error,
            'Cannot edit this session. Only pending sessions can be edited.',
          );
        } else {
          Alert.alert(translations[lang].error, translations[lang].bookingFailed);
        }
        return false;
      }

      if (data) {
        // Update in local state
        set({
          sessionBookings: get().sessionBookings.map(booking =>
            booking.id === sessionId ? data : booking,
          ),
        });

        const t = translations[get().language];
        get().showToast(t.sessionUpdatedSuccessfully, 'success');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error updating session:', error);
      get().showToast('Failed to update session', 'error');
      return false;
    }
  },

  cancelSession: async (sessionId: string) => {
    try {
      const { session } = get();
      if (!session?.user?.id) {
        get().showToast('Please log in to cancel sessions', 'error');
        return;
      }

      // First check the session status
      const { data: sessionData, error: fetchError } = await supabase
        .from('session_bookings')
        .select('status')
        .eq('id', sessionId)
        .eq('member_id', session.user.id)
        .single();

      if (fetchError || !sessionData) {
        console.error('Error fetching session:', fetchError);
        get().showToast('Failed to find session', 'error');
        return;
      }

      // If pending, delete it. If upcoming, update status to cancelled
      if (sessionData.status === 'pending') {
      const { error } = await supabase
        .from('session_bookings')
        .delete()
        .eq('id', sessionId)
          .eq('member_id', session.user.id);

      if (error) {
          console.error('Error deleting session:', error);
        get().showToast('Failed to cancel session', 'error');
        return;
      }

      // Remove from local state
      set({
        sessionBookings: get().sessionBookings.filter(booking => booking.id !== sessionId),
      });
      } else if (sessionData.status === 'upcoming') {
        const { error } = await supabase
          .from('session_bookings')
          .update({ status: 'cancelled' })
          .eq('id', sessionId)
          .eq('member_id', session.user.id);

        if (error) {
          console.error('Error cancelling session:', error);
          get().showToast('Failed to cancel session', 'error');
          return;
        }

        // Update local state
        set({
          sessionBookings: get().sessionBookings.map(booking =>
            booking.id === sessionId ? { ...booking, status: 'cancelled' } : booking,
          ),
        });
      } else {
        get().showToast('Cannot cancel this session', 'error');
        return;
      }

      const t = translations[get().language];
      get().showToast(t.sessionCancelledSuccessfully, 'success');
    } catch (error) {
      console.error('Error canceling session:', error);
      get().showToast('Failed to cancel session', 'error');
    }
  },

  fetchSessionBookings: async () => {
    try {
      const { session } = get();
      if (!session?.user?.id) {
        return;
      }

      const { data, error } = await supabase
        .from('session_bookings')
        .select(`
          *,
          purchased_services(
            services(name, service_type, duration_minutes)
          )
        `)
        .eq('member_id', session.user.id)
        .order('booking_date', { ascending: false });

      if (error) {
        console.error('Error fetching session bookings:', error);
        return;
      }

      set({ sessionBookings: data || [] });
    } catch (error) {
      console.error('Error fetching session bookings:', error);
    }
  },

  // QR state
  token: generateQRToken(),
  expiresAt: Date.now() + 60000, // 60 seconds from now
  isValid: true,
  totpSecret: null,
  totpCode: '',
  totpTimeRemaining: 30,

  initializeTOTP: async () => {
    try {
      const { member } = get();
      if (!member?.id) {
        console.log('No member ID available for TOTP initialization');
        return;
      }

      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      const apiKey = process.env.EXPO_PUBLIC_API_KEY;

      if (!apiUrl || !apiKey) {
        console.warn('⚠️ TOTP API configuration missing. Set EXPO_PUBLIC_API_URL and EXPO_PUBLIC_API_KEY in .env file');
        return;
      }

      // Always fetch fresh secret from API (which gets it from database)
      // This ensures we always have the latest secret from the database
      try {
        const secret = await setupTOTP(member.id, apiKey, apiUrl);
        set({ totpSecret: secret });
        get().generateTOTPCode();
      } catch (error) {
        console.error('Failed to setup TOTP:', error);
        // Fall back to legacy token generation
        return;
      }
    } catch (error) {
      console.error('Error initializing TOTP:', error);
    }
  },

  generateTOTPCode: () => {
    const { totpSecret } = get();
    if (!totpSecret) {
      return;
    }

    try {
      const code = generateTOTPCodeUtil(totpSecret);
      const timeRemaining = getTOTPTimeRemaining();
      set({
        totpCode: code,
        totpTimeRemaining: timeRemaining,
      });
    } catch (error) {
      console.error('Error generating TOTP code:', error);
    }
  },

  updateTOTPTimeRemaining: () => {
    const timeRemaining = getTOTPTimeRemaining();
    set({ totpTimeRemaining: timeRemaining });

    // Auto-regenerate code when it expires
    if (timeRemaining === 30 || timeRemaining === 29) {
      get().generateTOTPCode();
    }
  },

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
        isCheckedIn: !!currentCheckin,
      });
    } catch (error) {
      console.error('Error fetching checkins:', error);
      get().showToast('Failed to load check-ins', 'error');
    } finally {
      set({ checkinsLoading: false });
    }
  },

  checkIn: async (notes = '') => {
    try {
      const { session, isCheckedIn, member } = get();
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
        membership_plan_name: member?.membershipPlan || 'Basic Plan',
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
          c.id === currentCheckin.id ? data : c,
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

  getValidatedPeopleInGym: async () => {
    try {
      // First run cleanup to remove invalid checkins (ignore errors)
      try {
        await supabase.rpc('cleanup_invalid_checkins');
      } catch (cleanupError) {
        console.warn('Cleanup failed, continuing:', cleanupError);
      }

      // Get validated current occupancy
      const { data, error } = await supabase.rpc('get_current_gym_occupancy');

      if (error) {
        console.error('Error getting gym occupancy:', error);
        // Return 0 if RPC fails - don't use local checkins as they're user-specific
        return 0;
      }

      // data is an array of occupants with is_valid_checkin flag
      if (!data || !Array.isArray(data)) {
        console.warn('Invalid data format from get_current_gym_occupancy:', data);
        return 0;
      }

      // Count only valid checkins
      const validCount = data.filter((occupant: any) => occupant.is_valid_checkin === true).length;
      console.log(`People in gym: ${validCount} (${data.length} total records)`);
      return validCount;
    } catch (error) {
      console.error('Error in getValidatedPeopleInGym:', error);
      // Return 0 if there's an exception - don't use local checkins as they're user-specific
      return 0;
    }
  },

  runAutoCheckout: async () => {
    try {
      const { error } = await supabase.rpc('run_auto_checkout_with_logging');

      if (error) {
        console.error('Error running auto checkout:', error);
        return;
      }

      // Refresh checkins after auto checkout
      await get().fetchCheckins();
      console.log('Auto checkout completed successfully');
    } catch (error) {
      console.error('Error in runAutoCheckout:', error);
    }
  },

  runCleanupInvalidCheckins: async () => {
    try {
      const { data, error } = await supabase.rpc('cleanup_invalid_checkins');

      if (error) {
        console.error('Error cleaning up invalid checkins:', error);
        return 0;
      }

      // Refresh checkins after cleanup
      if (data > 0) {
        await get().fetchCheckins();
      }

      return data || 0;
    } catch (error) {
      console.error('Error in runCleanupInvalidCheckins:', error);
      return 0;
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
        .order('day_of_week', { ascending: true });

      if (error) {
        console.error('Error fetching gym schedule:', error);
        get().showToast('Failed to load gym schedule', 'error');
        return;
      }

      const schedule = data || [];

      // Get current day in Romania timezone using a more reliable method
      const now = new Date();
      const romaniaTime = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/Bucharest',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).formatToParts(now);

      const romaniaDate = new Date(
        parseInt(romaniaTime.find(p => p.type === 'year')?.value || '0', 10),
        parseInt(romaniaTime.find(p => p.type === 'month')?.value || '1', 10) - 1, // Month is 0-based
        parseInt(romaniaTime.find(p => p.type === 'day')?.value || '1', 10),
      );

      const jsDay = romaniaDate.getDay(); // 0=Sunday, 1=Monday, etc.

      // Convert JS day (0=Sunday) to our database day (0=Monday, 6=Sunday)
      const ourDay = jsDay === 0 ? 6 : jsDay - 1;

      const todaySchedule = schedule.find(s => s.day_of_week === ourDay) || null;

      set({
        gymSchedule: schedule,
        todaySchedule,
      });
    } catch (error) {
      console.error('Error fetching gym schedule:', error);
      get().showToast('Failed to load gym schedule', 'error');
    } finally {
      set({ gymScheduleLoading: false });
    }
  },

        isGymOpen: () => {
          const { todaySchedule } = get();

          if (!todaySchedule) {return false;}

          // Get current time in Romania timezone
          const utcNow = new Date();
          const romaniaTimeParts = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Europe/Bucharest',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }).formatToParts(utcNow);

          // Parse the 12-hour format correctly
          let hour = parseInt(romaniaTimeParts.find(p => p.type === 'hour')?.value || '0', 10);
          const minute = parseInt(romaniaTimeParts.find(p => p.type === 'minute')?.value || '0', 10);
          const second = parseInt(romaniaTimeParts.find(p => p.type === 'second')?.value || '0', 10);
          const dayPeriod = romaniaTimeParts.find(p => p.type === 'dayPeriod')?.value;

          // Convert 12-hour to 24-hour format
          if (dayPeriod === 'AM' && hour === 12) {
            hour = 0; // 12 AM = 0 hours
          } else if (dayPeriod === 'PM' && hour !== 12) {
            hour += 12; // PM hours except 12 PM
          }

          const now = new Date(
            parseInt(romaniaTimeParts.find(p => p.type === 'year')?.value || '0', 10),
            parseInt(romaniaTimeParts.find(p => p.type === 'month')?.value || '1', 10) - 1,
            parseInt(romaniaTimeParts.find(p => p.type === 'day')?.value || '1', 10),
            hour,
            minute,
            second,
          );
          const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();

          // Parse gym hours
          const [openHour, openMin] = todaySchedule.open_time.split(':').map(time => parseInt(time, 10));
          const [closeHour, closeMin] = todaySchedule.close_time.split(':').map(time => parseInt(time, 10));
          const openTimeInMinutes = (openHour || 0) * 60 + (openMin || 0);
          const closeTimeInMinutes = (closeHour || 0) * 60 + (closeMin || 0);

          // Check if gym is currently open
          return currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes < closeTimeInMinutes;
        },

        getTodayHours: (t?: (key: TranslationKey) => string) => {
          const { todaySchedule, gymSchedule } = get();

          if (!todaySchedule) {return null;}

          // Keep 24h format for display
          const formatTime = (time: string) => {
            const [hours, minutes] = time.split(':');
            return `${hours || '00'}:${minutes || '00'}`;
          };

          // Get current time in Romania timezone using a more reliable method
          const utcNow = new Date();
          const romaniaTimeParts = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Europe/Bucharest',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }).formatToParts(utcNow);

          // Parse the 12-hour format correctly
          let hour = parseInt(romaniaTimeParts.find(p => p.type === 'hour')?.value || '0', 10);
          const minute = parseInt(romaniaTimeParts.find(p => p.type === 'minute')?.value || '0', 10);
          const second = parseInt(romaniaTimeParts.find(p => p.type === 'second')?.value || '0', 10);
          const dayPeriod = romaniaTimeParts.find(p => p.type === 'dayPeriod')?.value;

          // Convert 12-hour to 24-hour format
          if (dayPeriod === 'AM' && hour === 12) {
            hour = 0; // 12 AM = 0 hours
          } else if (dayPeriod === 'PM' && hour !== 12) {
            hour += 12; // PM hours except 12 PM
          }

          const now = new Date(
            parseInt(romaniaTimeParts.find(p => p.type === 'year')?.value || '0', 10),
            parseInt(romaniaTimeParts.find(p => p.type === 'month')?.value || '1', 10) - 1,
            parseInt(romaniaTimeParts.find(p => p.type === 'day')?.value || '1', 10),
            hour,
            minute,
            second,
          );
          const currentHour = now.getHours();
          const currentMinutes = now.getMinutes();
          const currentTimeInMinutes = currentHour * 60 + currentMinutes;

          // Parse gym hours
          const [openHour, openMin] = todaySchedule.open_time.split(':').map(time => parseInt(time, 10));
          const [closeHour, closeMin] = todaySchedule.close_time.split(':').map(time => parseInt(time, 10));
          const openTimeInMinutes = (openHour || 0) * 60 + (openMin || 0);
          const closeTimeInMinutes = (closeHour || 0) * 60 + (closeMin || 0);

          // Check if gym is currently open
          const isOpen = currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes < closeTimeInMinutes;

          if (isOpen) {
            // Gym is open - show closing time
            const minutesUntilClose = closeTimeInMinutes - currentTimeInMinutes;

            if (minutesUntilClose <= 60) {
              // Closing soon - show minutes
              return t ? `${t('closingIn')} ${minutesUntilClose} ${t('min')}` : `Closing in ${minutesUntilClose} min`;
            } else {
              // Show regular closing time
              return t ? `${t('until')} ${formatTime(todaySchedule.close_time)}` : `Until ${formatTime(todaySchedule.close_time)}`;
            }
          } else {
            // Gym is closed - find next opening time
            const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

            // Check if we should open later today
            if (currentTimeInMinutes < openTimeInMinutes) {
              return t ? `${t('opensTodayAt')} ${formatTime(todaySchedule.open_time)}` : `Opens today at ${formatTime(todaySchedule.open_time)}`;
            }

            // Find next opening day
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            let nextDay = currentDay;
            let daysAhead = 0;

            do {
              daysAhead++;
              nextDay = (nextDay + 1) % 7;

              // Convert our day_of_week (0=Monday) to JS day (0=Sunday)
              const nextScheduleDay = gymSchedule.find(schedule => {
                const scheduleJSDay = schedule.day_of_week === 6 ? 0 : schedule.day_of_week + 1;
                return scheduleJSDay === nextDay;
              });

              if (nextScheduleDay) {
                const dayName = daysAhead === 1 ? (t ? t('tomorrow') : 'Tomorrow') : dayNames[nextDay];
                const openTime = formatTime(nextScheduleDay.open_time);
                return t ? `${t('opensAt')} ${dayName} ${t('at')} ${openTime}` : `Opens ${dayName} at ${openTime}`;
              }
            } while (daysAhead < 7);

            return t ? t('closed') : 'Closed';
          }
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

  // Notification state
  notifications: [],
  unreadCount: 0,
  notificationsLoading: false,
  notificationSubscription: null,

  fetchNotifications: async () => {
    try {
      const { session } = get();
      console.log('Fetching notifications for user:', session?.user?.id);
      if (!session?.user?.id) {
        console.log('No session found, skipping fetch');
        return;
      }

      set({ notificationsLoading: true });

      // Fetch both personal notifications AND global notifications
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`member_id.eq.${session.user.id},is_global.eq.true`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
        set({ notificationsLoading: false });
        return;
      }

      // Fetch which global notifications this user has read or dismissed
      const { data: readData } = await supabase
        .from('notification_reads')
        .select('notification_id, dismissed')
        .eq('member_id', session.user.id);

      const readGlobalIds = new Set(
        readData?.filter(r => !r.dismissed).map(r => r.notification_id) || [],
      );
      const dismissedGlobalIds = new Set(
        readData?.filter(r => r.dismissed).map(r => r.notification_id) || [],
      );

      // Filter out dismissed global notifications, admin-only notifications, and mark read ones as read
      const notificationsWithReadStatus = data
        ?.filter(n => {
          // Exclude admin-only notifications for members
          if (n.is_admin_only === true) {
            return false;
          }
          // Exclude dismissed global notifications
          if (n.is_global && dismissedGlobalIds.has(n.id)) {
            return false;
          }
          return true;
        })
        .map(n => {
          // Mark global notifications as read if user has read them
          if (n.is_global && readGlobalIds.has(n.id)) {
            return { ...n, is_read: true };
          }
          return n;
        }) || [];

      console.log('Fetched notifications:', notificationsWithReadStatus.length);
      const unreadCount = notificationsWithReadStatus.filter(n => !n.is_read).length;
      console.log('Unread count:', unreadCount);
      set({ notifications: notificationsWithReadStatus, unreadCount, notificationsLoading: false });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      set({ notificationsLoading: false });
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      const { session } = get();
      if (!session?.user?.id) {return;}

      const notification = get().notifications.find(n => n.id === notificationId);
      if (!notification) {return;}

      if (notification.is_global) {
        // For global notifications, insert into notification_reads table
        const { error } = await supabase
          .from('notification_reads')
          .insert({
            notification_id: notificationId,
            member_id: session.user.id,
          });

        if (error && error.code !== '23505') { // Ignore duplicate key errors
          console.error('Error marking global notification as read:', error);
          return;
        }
      } else {
        // For personal notifications, update the is_read field
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notificationId);

        if (error) {
          console.error('Error marking notification as read:', error);
          return;
        }
      }

      // Update local state
      set({
        notifications: get().notifications.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n,
        ),
        unreadCount: Math.max(0, get().unreadCount - 1),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      const { session } = get();
      if (!session?.user?.id) {return;}

      const unreadNotifications = get().notifications.filter(n => !n.is_read);

      // Separate personal and global notifications
      const personalNotifications = unreadNotifications.filter(n => !n.is_global);
      const globalNotifications = unreadNotifications.filter(n => n.is_global);

      // Update personal notifications
      if (personalNotifications.length > 0) {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('member_id', session.user.id)
          .eq('is_read', false);

        if (error) {
          console.error('Error marking personal notifications as read:', error);
        }
      }

      // Insert records for global notifications
      if (globalNotifications.length > 0) {
        const readsToInsert = globalNotifications.map(n => ({
          notification_id: n.id,
          member_id: session.user.id,
        }));

        const { error } = await supabase
          .from('notification_reads')
          .upsert(readsToInsert, { onConflict: 'notification_id,member_id' });

        if (error) {
          console.error('Error marking global notifications as read:', error);
        }
      }

      // Update local state
      set({
        notifications: get().notifications.map(n => ({ ...n, is_read: true })),
        unreadCount: 0,
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  },

  subscribeToNotifications: () => {
    const { session } = get();
    if (!session?.user?.id) {return;}

    // Unsubscribe from existing subscription if any
    get().unsubscribeFromNotifications();

    const subscription = supabase
      .channel('notifications_channel')
      // Listen for personal notifications
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `member_id=eq.${session.user.id}`,
        },
        (payload) => {
          console.log('New personal notification received:', payload);
          const newNotification = payload.new as Notification;

          // Skip admin-only notifications
          if (newNotification.is_admin_only === true) {
            console.log('Skipping admin-only notification');
            return;
          }

          // Add to local state
          set({
            notifications: [newNotification, ...get().notifications],
            unreadCount: get().unreadCount + 1,
          });

          // Show toast notification with appropriate type and translation
          const toastType = getToastTypeFromNotification(newNotification.type);
          const translated = translateNotification(newNotification.title, newNotification.message, get().language);
          get().showToast(translated.title, toastType, translated.message);
        },
      )
      // Listen for global notifications
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: 'is_global=eq.true',
        },
        (payload) => {
          console.log('New global notification received:', payload);
          const newNotification = payload.new as Notification;

          // Skip admin-only notifications
          if (newNotification.is_admin_only === true) {
            console.log('Skipping admin-only notification');
            return;
          }

          // Add to local state
          set({
            notifications: [newNotification, ...get().notifications],
            unreadCount: get().unreadCount + 1,
          });

          // Show toast notification with appropriate type and translation
          const toastType = getToastTypeFromNotification(newNotification.type);
          const translated = translateNotification(newNotification.title, newNotification.message, get().language);
          get().showToast(translated.title, toastType, translated.message);
        },
      )
      .subscribe();

    set({ notificationSubscription: subscription });
  },

  unsubscribeFromNotifications: () => {
    const { notificationSubscription } = get();
    if (notificationSubscription) {
      supabase.removeChannel(notificationSubscription);
      set({ notificationSubscription: null });
    }
  },

  clearAllNotifications: async () => {
    try {
      const { session } = get();
      if (!session?.user?.id) {return;}

      const notifications = get().notifications;

      // Separate personal and global notifications
      const personalNotifications = notifications.filter(n => !n.is_global);
      const globalNotifications = notifications.filter(n => n.is_global);

      // Delete personal notifications
      if (personalNotifications.length > 0) {
        const personalIds = personalNotifications.map(n => n.id);
        const { error } = await supabase
          .from('notifications')
          .delete()
          .in('id', personalIds)
          .eq('member_id', session.user.id);

        if (error) {
          console.error('Error deleting personal notifications:', error);
          const t = translations[get().language];
          get().showToast(t.failedToClearNotifications, 'error');
          return;
        }
      }

      // Mark global notifications as dismissed (don't delete the notification itself)
      if (globalNotifications.length > 0) {
        const globalIds = globalNotifications.map(n => n.id);

        // Insert or update records to mark them as dismissed
        const dismissRecords = globalIds.map(id => ({
          notification_id: id,
          member_id: session.user.id,
          dismissed: true,
        }));

        const { error } = await supabase
          .from('notification_reads')
          .upsert(dismissRecords, { onConflict: 'notification_id,member_id' });

        if (error) {
          console.error('Error dismissing global notifications:', error);
        }
      }

      // Clear local state
      set({
        notifications: [],
        unreadCount: 0,
      });

      const t = translations[get().language];
      get().showToast(t.allNotificationsCleared, 'success');
    } catch (error) {
      console.error('Error clearing notifications:', error);
      const t = translations[get().language];
      get().showToast(t.failedToClearNotifications, 'error');
    }
  },

  // Toast state
  message: '',
  type: 'info',
  visible: false,
  description: undefined,
  duration: 5000,
  toastTimeoutId: null as ReturnType<typeof setTimeout> | null,
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info', description?: string, duration?: number) => {
    const state = get();

    // Clear existing timeout
    if (state.toastTimeoutId) {
      clearTimeout(state.toastTimeoutId);
    }

    const toastDuration = duration || 5000;

    // Don't set a timeout here - let the Toast component handle its own dismissal
    // This allows the exit animation to play properly

    set({ message, type, visible: true, description, duration: toastDuration, toastTimeoutId: null });
  },
  hideToast: () => {
    const state = get();
    if (state.toastTimeoutId) {
      clearTimeout(state.toastTimeoutId);
    }
    set({ visible: false, toastTimeoutId: null });
  },

  // Language state
  language: 'en',
  setLanguage: (lang: 'en' | 'ro') => {
    set({ language: lang });
  },

  // Push Notification state
  pushToken: null,
  pushNotificationsEnabled: false,

  registerPushNotifications: async () => {
    try {
      const { session } = get();
      if (!session?.user?.id) {
        console.log('No user session, cannot register push notifications');
        get().showToast('Please log in to enable push notifications', 'error');
        return false;
      }

      console.log('Registering for push notifications...');
      const tokenData = await registerForPushNotificationsAsync();

      if (!tokenData) {
        console.log('Failed to get push token');
        get().showToast('Unable to enable push notifications. Please check permissions in Settings.', 'error');
        return false;
      }

      console.log('Push token obtained:', tokenData.token);

      // Save token to database
      const saved = await savePushTokenToDatabase(tokenData, session.user.id);

      if (!saved) {
        console.log('Failed to save push token to database');
        get().showToast('Failed to save push notification settings', 'error');
        return false;
      }

      // Update local state
      set({
        pushToken: tokenData.token,
        pushNotificationsEnabled: true,
      });

      console.log('Push notifications registered successfully');
      const t = translations[get().language];
      get().showToast(t.pushNotificationsEnabled || 'Push notifications enabled', 'success');
      return true;
    } catch (error) {
      console.error('Error registering push notifications:', error);
      get().showToast('Failed to enable push notifications', 'error');
      return false;
    }
  },

  unregisterPushNotifications: async () => {
    try {
      const { pushToken } = get();

      if (pushToken) {
        // Deactivate token in database
        await deactivatePushToken(pushToken);
      }

      // Update local state
      set({
        pushToken: null,
        pushNotificationsEnabled: false,
      });

      console.log('Push notifications unregistered successfully');
      const t = translations[get().language];
      get().showToast(t.pushNotificationsDisabled || 'Push notifications disabled', 'success');
      return true;
    } catch (error) {
      console.error('Error unregistering push notifications:', error);
      get().showToast('Failed to disable push notifications', 'error');
      return false;
    }
  },

  setPushNotificationsEnabled: (enabled: boolean) => {
    set({ pushNotificationsEnabled: enabled });
  },

  // Biometric Authentication state
  biometricEnabled: false,
  biometricAvailable: false,

  setBiometricEnabled: async (enabled: boolean) => {
    try {
      const { session } = get();
      if (!session?.user?.email) {
        console.log('No user session, cannot enable biometric');
        const t = translations[get().language];
        get().showToast(t.loginRequired || 'Please log in first', 'error');
        return;
      }

      if (enabled) {
        // Check if biometric is available
        const available = await isBiometricAvailable();
        if (!available) {
          const t = translations[get().language];
          get().showToast(t.biometricNotAvailable || 'Biometric authentication not available', 'error');
          return;
        }

        // Note: The actual credential storage and biometric prompt
        // will be handled in the profile screen when user toggles the switch
        await SecureStorage.setBiometricEnabled(true);
        set({ biometricEnabled: true });
        console.log('Biometric authentication enabled');
      } else {
        // Disable biometric and clear stored credentials
        await SecureStorage.setBiometricEnabled(false);
        await SecureStorage.clearBiometricCredentials();
        set({ biometricEnabled: false });
        console.log('Biometric authentication disabled');
      }
    } catch (error) {
      console.error('Error setting biometric enabled:', error);
      const t = translations[get().language];
      get().showToast(t.biometricFailed || 'Failed to update biometric settings', 'error');
    }
  },

  checkBiometricAvailability: async () => {
    try {
      const available = await isBiometricAvailable();
      const enabled = await SecureStorage.isBiometricEnabled();

      set({
        biometricAvailable: available,
        biometricEnabled: enabled,
      });

      console.log('Biometric availability checked:', { available, enabled });
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      set({
        biometricAvailable: false,
        biometricEnabled: false,
      });
    }
  },
}));
