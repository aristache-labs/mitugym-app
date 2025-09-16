export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  membershipStatus: 'active' | 'expired';
  membershipPlan: string;
  joinDate: string;
  expiryDate: string;
  visitsLeft?: number;
  daysLeft?: number;
  lastCheckIn?: string;
}

export interface GymClass {
  id: string;
  title: string;
  description: string;
  startAt: string;
  duration: number; // in minutes
  spots: number;
  spotsLeft: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  trainer: string;
  room: string;
  category: string;
  rules: string[];
}

export interface MembershipPlan {
  id: string;
  name: string;
  type: 'visits' | 'unlimited';
  price: number;
  duration: number; // in days
  visits?: number;
  features: string[];
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
export const mockClasses: GymClass[] = [
  {
    id: '1',
    title: 'Morning Yoga Flow',
    description: 'Start your day with a gentle yoga flow designed to awaken your body and mind. Suitable for all levels.',
    startAt: '2024-09-17T07:00:00Z',
    duration: 60,
    spots: 20,
    spotsLeft: 8,
    level: 'Beginner',
    trainer: 'Sarah Martinez',
    room: 'Studio A',
    category: 'Yoga',
    rules: [
      'Arrive 10 minutes early',
      'Bring your own mat',
      'No shoes in the studio',
      'Turn off mobile devices',
    ],
  },
  {
    id: '2',
    title: 'HIIT Bootcamp',
    description: 'High-intensity interval training that will push your limits and maximize calorie burn.',
    startAt: '2024-09-17T18:00:00Z',
    duration: 45,
    spots: 15,
    spotsLeft: 3,
    level: 'Advanced',
    trainer: 'Mike Thompson',
    room: 'Main Floor',
    category: 'Cardio',
    rules: [
      'Arrive 5 minutes early',
      'Bring water bottle',
      'Wear proper athletic shoes',
      'No late entries allowed',
    ],
  },
  {
    id: '3',
    title: 'Strength Training',
    description: 'Build muscle and increase strength with guided weight training exercises.',
    startAt: '2024-09-17T19:30:00Z',
    duration: 75,
    spots: 12,
    spotsLeft: 7,
    level: 'Intermediate',
    trainer: 'Emma Wilson',
    room: 'Weight Room',
    category: 'Strength',
    rules: [
      'Wipe down equipment after use',
      'Use safety clips on barbells',
      'Ask for help if unsure',
      'Proper form is essential',
    ],
  },
  {
    id: '4',
    title: 'Pilates Core',
    description: 'Focus on core strength and stability with precision-based movements.',
    startAt: '2024-09-18T08:30:00Z',
    duration: 50,
    spots: 16,
    spotsLeft: 12,
    level: 'Beginner',
    trainer: 'Lisa Chen',
    room: 'Studio B',
    category: 'Pilates',
    rules: [
      'Bring a small towel',
      'Comfortable clothing required',
      'No previous experience needed',
      'Listen to your body',
    ],
  },
  {
    id: '5',
    title: 'Spin Class',
    description: 'High-energy cycling workout with motivating music and instructor guidance.',
    startAt: '2024-09-18T17:00:00Z',
    duration: 45,
    spots: 24,
    spotsLeft: 5,
    level: 'Intermediate',
    trainer: 'David Rodriguez',
    room: 'Spin Studio',
    category: 'Cardio',
    rules: [
      'Arrive 10 minutes early for bike setup',
      'Bring water and towel',
      'Cycling shoes recommended',
      'Adjust bike to your height',
    ],
  },
  {
    id: '6',
    title: 'Zumba Dance',
    description: 'Fun, energetic dance workout that feels more like a party than exercise.',
    startAt: '2024-09-18T19:00:00Z',
    duration: 60,
    spots: 30,
    spotsLeft: 18,
    level: 'Beginner',
    trainer: 'Maria Gonzalez',
    room: 'Main Studio',
    category: 'Dance',
    rules: [
      'No dance experience required',
      'Wear comfortable shoes',
      'Bring plenty of water',
      'Have fun and let loose!',
    ],
  },
];

// Mock membership plans
export const mockMembershipPlans: MembershipPlan[] = [
  {
    id: '1',
    name: 'Basic Monthly',
    type: 'visits',
    price: 49.99,
    duration: 30,
    visits: 8,
    features: [
      '8 gym visits per month',
      'Access to basic equipment',
      'Locker room access',
      'Free fitness assessment',
    ],
  },
  {
    id: '2',
    name: 'Premium Monthly',
    type: 'unlimited',
    price: 79.99,
    duration: 30,
    features: [
      'Unlimited gym access',
      'All group classes included',
      'Guest pass (2 per month)',
      'Nutrition consultation',
      'Priority booking',
    ],
  },
  {
    id: '3',
    name: 'Annual Premium',
    type: 'unlimited',
    price: 799.99,
    duration: 365,
    features: [
      'Unlimited gym access',
      'All group classes included',
      'Guest pass (4 per month)',
      'Personal trainer session',
      'Nutrition consultation',
      'Priority booking',
      '2 months free!',
    ],
  },
];

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

// Helper functions
export const getClassById = (id: string): GymClass | undefined => {
  return mockClasses.find(cls => cls.id === id);
};

export const getClassesByCategory = (category?: string): GymClass[] => {
  if (!category || category === 'All') {return mockClasses;}
  return mockClasses.filter(cls => cls.category === category);
};

export const getClassesForToday = (): GymClass[] => {
  const today = new Date().toDateString();
  return mockClasses.filter(cls => {
    const classDate = new Date(cls.startAt).toDateString();
    return classDate === today;
  });
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
