export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  membershipStatus: 'active' | 'expired' | 'pending' | 'inactive' | 'frozen';
  membershipPlan: string;
  joinDate: string;
  expiryDate: string;
  planStartDate?: string;
  visitsLeft?: number;
  daysLeft?: number;
  lastCheckIn?: string;
}

export interface Service {
  id: string;
  name: string;
  service_type: 'personal_trainer' | 'professional_massage';
  session_type: string;
  duration_minutes: number;
  price: number;
  description: string;
  requires_advance_booking: boolean;
  advance_booking_hours: number;
  max_sessions?: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface PurchasedService {
  id: string;
  member_id: string;
  service_id: string;
  status: 'pending' | 'approved' | 'cancelled';
  sessions_total: number;
  sessions_remaining: number;
  purchase_date: string;
  approved_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  services?: {
    name: string;
    service_type: string;
    duration_minutes: number;
    price: number;
  };
}

export interface SessionBooking {
  id: string;
  purchased_service_id: string;
  member_id: string;
  booking_date: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
  purchased_services?: {
    services: {
      name: string;
      service_type: string;
      duration_minutes: number;
    };
  };
}

// Keep the old interface for backwards compatibility if needed
export interface ServiceBooking {
  id: string;
  member_id: string;
  service_id: string;
  booking_date: string;
  status: 'pending' | 'upcoming' | 'completed' | 'cancelled';
  sessions_remaining?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  services?: {
    name: string;
    service_type: string;
    duration_minutes: number;
  };
}

export interface Checkin {
  id: string;
  user_id: string;
  check_in_time: string;
  check_out_time?: string;
  duration_minutes?: number;
  location?: string; // Keep for backward compatibility
  membership_plan_name?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 1 | 2 | 3; // 1=low, 2=medium, 3=high
  is_active: boolean;
  start_date: string;
  end_date?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface GymSchedule {
  id: string;
  day_of_week: number; // 0=Monday, 1=Tuesday, ..., 6=Sunday
  open_time: string;
  close_time: string;
  is_active: boolean;
  special_note?: string;
  created_at: string;
  updated_at: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  plan_type: 'full' | 'student' | 'day_entry';
  duration_months?: number; // null for day entry
  price: number;
  features: string[];
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface BookingHistory {
  id: string;
  classId: string;
  className: string;
  date: string;
  status: 'completed' | 'cancelled' | 'upcoming';
}

// Mock member data
export const mockMember: Member = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex@example.com',
  phone: '+1 (555) 123-4567',
  membershipStatus: 'active',
  membershipPlan: 'Premium Monthly',
  joinDate: '2024-01-15',
  expiryDate: '2024-10-15',
  daysLeft: 29,
  lastCheckIn: '2024-09-14T09:30:00Z',
};

// Mock classes data
// Note: Services (Personal Trainer & Professional Massage) are now stored in Supabase database
// Use the store methods to fetch services from the database

export const mockServices: Service[] = [];

// Note: Membership plans are now stored in Supabase database
// Use the store methods to fetch membership plans from the database

// Mock booking history
export const mockBookingHistory: BookingHistory[] = [
  {
    id: '1',
    classId: '1',
    className: 'Morning Yoga Flow',
    date: '2024-09-10T07:00:00Z',
    status: 'completed',
  },
  {
    id: '2',
    classId: '2',
    className: 'HIIT Bootcamp',
    date: '2024-09-12T18:00:00Z',
    status: 'completed',
  },
  {
    id: '3',
    classId: '3',
    className: 'Strength Training',
    date: '2024-09-18T19:30:00Z',
    status: 'upcoming',
  },
];

// Helper functions - updated for services
export const getServiceById = (id: string, services: Service[]): Service | undefined => {
  return services.find(srv => srv.id === id);
};

export const getServicesByType = (services: Service[], type?: string): Service[] => {
  if (!type || type === 'All') {return services;}
  return services.filter(srv => srv.service_type === type);
};

export const generateQRToken = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'MM-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};
