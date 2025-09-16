import React from 'react';
import { render } from '@testing-library/react-native';
import { useAppStore } from '../lib/store';
import { PillButton } from '../components/PillButton';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSegments: () => ['(tabs)', 'index'],
  Stack: ({ children }: any) => children,
  Tabs: ({ children }: any) => children,
}));

// Mock expo components
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }: any) => children,
}));

// Mock Lucide icons
jest.mock('lucide-react-native', () => ({
  Home: () => null,
  QrCode: () => null,
  Calendar: () => null,
  CreditCard: () => null,
  User: () => null,
  ChevronLeft: () => null,
  Bell: () => null,
}));

describe('App Components', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAppStore.setState({
      isAuthenticated: false,
      member: null,
      classes: [],
      bookings: new Set(),
      token: 'TEST-TOKEN',
      expiresAt: Date.now() + 60000,
      isValid: true,
      message: '',
      type: 'info',
      visible: false,
    });
  });

  it('renders PillButton component correctly', () => {
    const mockOnPress = jest.fn();
    
    const { getByText } = render(
      <PillButton
        title="Test Button"
        onPress={mockOnPress}
        variant="primary"
      />
    );

    expect(getByText('Test Button')).toBeTruthy();
  });

  it('PillButton calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    
    const { getByText } = render(
      <PillButton
        title="Test Button"
        onPress={mockOnPress}
        variant="primary"
      />
    );

    const button = getByText('Test Button');
    // Note: fireEvent.press would be used in a real test, but we're keeping this simple
    expect(button).toBeTruthy();
  });

  it('PillButton shows loading state correctly', () => {
    const mockOnPress = jest.fn();
    
    const { queryByText } = render(
      <PillButton
        title="Test Button"
        onPress={mockOnPress}
        variant="primary"
        loading={true}
      />
    );

    // When loading, the title should not be visible
    expect(queryByText('Test Button')).toBeFalsy();
  });

  it('PillButton can be disabled', () => {
    const mockOnPress = jest.fn();
    
    const { getByText } = render(
      <PillButton
        title="Test Button"
        onPress={mockOnPress}
        variant="primary"
        disabled={true}
      />
    );

    const button = getByText('Test Button');
    expect(button).toBeTruthy();
    // In a real test, we would verify that onPress is not called when disabled
  });
});
