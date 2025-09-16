import React from 'react';
import { render } from '@testing-library/react-native';
import { ClassCard } from '../components/ClassCard';
import { GymClass } from '../lib/mock';

// Mock expo components
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
}));

// Mock Lucide icons
jest.mock('lucide-react-native', () => ({
  Clock: () => null,
  Users: () => null,
  MapPin: () => null,
  User: () => null,
  Calendar: () => null,
}));

describe('ClassCard Component', () => {
  const mockClass: GymClass = {
    id: '1',
    title: 'Morning Yoga Flow',
    description: 'A gentle yoga flow to start your day',
    startAt: '2024-09-17T07:00:00Z',
    duration: 60,
    spots: 20,
    spotsLeft: 8,
    level: 'Beginner',
    trainer: 'Sarah Martinez',
    room: 'Studio A',
    category: 'Yoga',
    rules: ['Bring your own mat', 'No shoes in studio'],
  };

  const defaultProps = {
    gymClass: mockClass,
    isReserved: false,
    onPress: jest.fn(),
    onReserve: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders class information correctly', () => {
    const { getByText } = render(<ClassCard {...defaultProps} />);
    
    expect(getByText('Morning Yoga Flow')).toBeTruthy();
    expect(getByText('Beginner')).toBeTruthy();
    expect(getByText('Sarah Martinez')).toBeTruthy();
    expect(getByText('Studio A')).toBeTruthy();
    expect(getByText('8 available')).toBeTruthy();
  });

  it('shows reserve button when not reserved', () => {
    const { getByText } = render(<ClassCard {...defaultProps} />);
    
    expect(getByText('Reserve Spot')).toBeTruthy();
  });

  it('shows cancel button when reserved', () => {
    const reservedProps = {
      ...defaultProps,
      isReserved: true,
    };

    const { getByText } = render(<ClassCard {...reservedProps} />);
    
    expect(getByText('Cancel Reservation')).toBeTruthy();
    expect(getByText('Reserved')).toBeTruthy();
  });

  it('shows full status when no spots left', () => {
    const fullClass = {
      ...mockClass,
      spotsLeft: 0,
    };

    const fullProps = {
      ...defaultProps,
      gymClass: fullClass,
    };

    const { getByText } = render(<ClassCard {...fullProps} />);
    
    expect(getByText('Full')).toBeTruthy();
  });

  it('shows date when showDate prop is true', () => {
    const { getByText } = render(
      <ClassCard {...defaultProps} showDate={true} />
    );
    
    // The exact date format will depend on the current date, 
    // so we just check that some date-related text is present
    expect(getByText(/Tue|Wed|Thu|Fri|Sat|Sun|Mon/)).toBeTruthy();
  });

  it('renders in compact mode', () => {
    const { queryByText } = render(
      <ClassCard {...defaultProps} compact={true} />
    );
    
    // In compact mode, the reserve button should not be present
    expect(queryByText('Reserve Spot')).toBeFalsy();
  });

  it('handles different level colors', () => {
    const advancedClass = {
      ...mockClass,
      level: 'Advanced' as const,
    };

    const { getByText } = render(
      <ClassCard 
        {...defaultProps} 
        gymClass={advancedClass}
      />
    );
    
    expect(getByText('Advanced')).toBeTruthy();
  });
});
