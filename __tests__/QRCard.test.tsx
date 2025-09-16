import React from 'react';
import { render } from '@testing-library/react-native';
import { QRCard } from '../components/QRCard';

// Mock expo components
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
}));

// Mock Lucide icons
jest.mock('lucide-react-native', () => ({
  QrCode: () => null,
  RefreshCw: () => null,
}));

// Mock Animated
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Animated: {
      ...RN.Animated,
      Value: jest.fn(() => ({ setValue: jest.fn() })),
      timing: jest.fn(() => ({ start: jest.fn() })),
      sequence: jest.fn(() => ({ start: jest.fn() })),
    },
  };
});

describe('QRCard Component', () => {
  const defaultProps = {
    token: 'MM-ABC12345',
    expiresAt: Date.now() + 30000, // 30 seconds from now
    isValid: true,
    onRefresh: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with valid QR', () => {
    const { getByText } = render(<QRCard {...defaultProps} />);
    
    expect(getByText('Valid Now')).toBeTruthy();
    expect(getByText('MM-ABC12345')).toBeTruthy();
    expect(getByText('Member ID: #001234')).toBeTruthy();
  });

  it('shows expired state when invalid', () => {
    const expiredProps = {
      ...defaultProps,
      isValid: false,
      expiresAt: Date.now() - 1000, // 1 second ago
    };

    const { getByText } = render(<QRCard {...expiredProps} />);
    
    expect(getByText('Expired — Renew')).toBeTruthy();
    expect(getByText('Generate New QR')).toBeTruthy();
  });

  it('shows refresh button when valid', () => {
    const { getByText } = render(<QRCard {...defaultProps} />);
    
    expect(getByText('Refresh')).toBeTruthy();
  });

  it('displays instructions text', () => {
    const { getByText } = render(<QRCard {...defaultProps} />);
    
    expect(getByText(/Show this QR code to gym staff/)).toBeTruthy();
  });

  it('shows expired instructions when invalid', () => {
    const expiredProps = {
      ...defaultProps,
      isValid: false,
      expiresAt: Date.now() - 1000,
    };

    const { getByText } = render(<QRCard {...expiredProps} />);
    
    expect(getByText(/QR code has expired/)).toBeTruthy();
  });
});
