
import React from 'react';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { Platform } from 'react-native';
import {
  Home,
  QrCode,
  Calendar,
  CreditCard,
  User,
} from 'lucide-react-native';
import { useAppStore } from '../../lib/store';
import { theme } from '../../lib/theme';
import { FloatingQRButton } from '../../components/FloatingQRButton';
import { shouldShowFloatingQR } from '../../lib/navigation';

interface TabIconProps {
  name: string;
  color: string;
  size: number;
}

function TabIcon({ name, color, size }: TabIconProps) {
  const iconProps = { size, color };

  switch (name) {
    case 'index':
      return <Home {...iconProps} />;
    case 'qr':
      return <QrCode {...iconProps} />;
    case 'classes':
      return <Calendar {...iconProps} />;
    case 'membership':
      return <CreditCard {...iconProps} />;
    case 'profile':
      return <User {...iconProps} />;
    default:
      return <Home {...iconProps} />;
  }
}

// Global flag to prevent multiple tab layout initializations
let globalTabLayoutInitialized = false;
let globalRedirectInProgress = false;

export default function TabLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [localAuthState, setLocalAuthState] = React.useState(true); // Start optimistic
  const hasCheckedAuth = React.useRef(false);

  // Define tabBarIcon function outside render to avoid creating new component instances
  const renderTabBarIcon = React.useCallback((props: any, routeName: string) => (
    <TabIcon name={routeName} {...props} />
  ), []);

  // Check auth state only once on mount
  React.useEffect(() => {
    if (hasCheckedAuth.current || globalTabLayoutInitialized) {
      return;
    }
    hasCheckedAuth.current = true;
    globalTabLayoutInitialized = true;

    // Check initial auth state
    const initialAuth = useAppStore.getState().isAuthenticated;
    console.log('TabLayout: Initial auth state:', initialAuth);
    setLocalAuthState(initialAuth);

    // If not authenticated initially, redirect immediately
    if (!initialAuth && !globalRedirectInProgress) {
      globalRedirectInProgress = true;
      setTimeout(() => {
        console.log('TabLayout: Initial redirect to login');
        // Try to navigate out of tabs stack first
        if (router.canGoBack()) {
          router.back();
        }
        setTimeout(() => {
          router.replace('/');
        }, 50);
        // Reset after a delay to allow for future redirects if needed
        setTimeout(() => {
          globalRedirectInProgress = false;
          globalTabLayoutInitialized = false; // Reset to allow new checks
        }, 1000);
      }, 100);
      return; // Don't set up polling if we're redirecting
    }

    // Set up a simple polling mechanism to check auth state changes
    // This avoids the subscription causing re-renders
    let previousAuth = initialAuth;
    let isActive = true;

    const checkAuthChanges = () => {
      if (!isActive) {return;}

      const currentAuth = useAppStore.getState().isAuthenticated;
      if (currentAuth !== previousAuth) {
        console.log('TabLayout: Auth polling detected change from', previousAuth, 'to', currentAuth);
        previousAuth = currentAuth;

        if (!currentAuth && !globalRedirectInProgress) {
          globalRedirectInProgress = true;
          isActive = false; // Stop polling
          setLocalAuthState(false);
          setTimeout(() => {
            console.log('TabLayout: Polling redirect to login');
            // Try to navigate out of tabs stack first
            if (router.canGoBack()) {
              router.back();
            }
            setTimeout(() => {
              router.replace('/');
            }, 50);
            // Reset after a delay to allow for future redirects if needed
            setTimeout(() => {
              globalRedirectInProgress = false;
              globalTabLayoutInitialized = false; // Reset to allow new checks
            }, 1000);
          }, 100);
        } else if (currentAuth) {
          setLocalAuthState(true);
        }
      }

      // Poll every 500ms
      if (isActive) {
        setTimeout(checkAuthChanges, 500);
      }
    };

    // Start polling after auth manager has time to initialize
    setTimeout(checkAuthChanges, 1000);

    return () => {
      isActive = false;
      globalTabLayoutInitialized = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // router intentionally excluded to prevent re-initialization

  // Show loading/blank while redirecting
  if (!localAuthState) {
    return null;
  }

  const currentRoute = segments[segments.length - 1] || 'index';
  const showFloatingQR = shouldShowFloatingQR(currentRoute);

  const handleFloatingQRPress = () => {
    router.push('/(tabs)/qr');
  };

  return (
    <>
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.colors.background.surface,
            borderTopColor: 'rgba(30, 155, 113, 0.2)',
            borderTopWidth: 1,
            height: Platform.OS === 'ios' ? 90 : 70,
            paddingBottom: Platform.OS === 'ios' ? 25 : 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: theme.colors.primary.DEFAULT,
          tabBarInactiveTintColor: theme.colors.text.secondary,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginTop: 4,
          },
          tabBarIconStyle: {
            marginBottom: 0,
          },
          tabBarIcon: (props) => renderTabBarIcon(props, route.name),
        })}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
          }}
        />
        <Tabs.Screen
          name="qr"
          options={{
            title: 'QR Code',
          }}
        />
        <Tabs.Screen
          name="classes"
          options={{
            title: 'Classes',
          }}
        />
        <Tabs.Screen
          name="membership"
          options={{
            title: 'Membership',
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
          }}
        />
      </Tabs>

      {/* Floating QR Button */}
      <FloatingQRButton
        onPress={handleFloatingQRPress}
        visible={showFloatingQR}
      />
    </>
  );
}
