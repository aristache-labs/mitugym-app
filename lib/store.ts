import { create } from 'zustand';
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
  login: (email: string) => Promise<void>;
  logout: () => void;
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
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
}

type AppState = AuthState & ClassState & QRState & MembershipState & ToastState;

export const useAppStore = create<AppState>((set, get) => ({
  // Auth state
  isAuthenticated: false,
  member: null,
  login: async (email: string) => {
    // Mock login - in real app, this would call authentication API
    await new Promise(resolve => setTimeout(resolve, 1000));
    set({
      isAuthenticated: true,
      member: { ...mockMember, email },
    });
    get().showToast('Welcome back!', 'success');
  },
  logout: () => {
    set({
      isAuthenticated: false,
      member: null,
      bookings: new Set(),
      bookingHistory: [],
    });
    get().showToast('Logged out successfully', 'info');
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
  showToast: (message: string, type: 'success' | 'error' | 'info') => {
    set({ message, type, visible: true });
    setTimeout(() => {
      get().hideToast();
    }, 3000);
  },
  hideToast: () => {
    set({ visible: false });
  },
}));
