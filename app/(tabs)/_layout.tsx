
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

export default function TabLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated } = useAppStore();

  // Define tabBarIcon function outside render to avoid creating new component instances
  const renderTabBarIcon = React.useCallback((props: any, routeName: string) => (
    <TabIcon name={routeName} {...props} />
  ), []);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  // Show loading/blank while redirecting
  if (!isAuthenticated) {
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
