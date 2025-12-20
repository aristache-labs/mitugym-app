import { NavigationProp, RouteProp } from '@react-navigation/native';

// Root Stack parameter list
export type RootStackParamList = {
  index: undefined; // Onboarding/Auth entry point
  '(auth)/login': undefined;
  '(tabs)': undefined;
  'class/[id]': { id: string };
};

// Tab Navigator parameter list
export type TabParamList = {
  index: undefined; // Home tab
  qr: undefined;
  classes: undefined;
  membership: undefined;
  profile: undefined;
};

// Navigation types for type-safe navigation
export type RootStackNavigationProp = NavigationProp<RootStackParamList>;
export type TabNavigationProp = NavigationProp<TabParamList>;

// Route types
export type ClassDetailRouteProp = RouteProp<RootStackParamList, 'class/[id]'>;

// Tab icon names (for Lucide icons)
export type TabIconName =
  | 'home'
  | 'qr-code'
  | 'calendar'
  | 'credit-card'
  | 'user';

// Tab configuration
export interface TabConfig {
  name: keyof TabParamList;
  title: string;
  icon: TabIconName;
  headerShown?: boolean;
}

export const tabConfigs: TabConfig[] = [
  {
    name: 'index',
    title: 'Home',
    icon: 'home',
    headerShown: false,
  },
  {
    name: 'qr',
    title: 'QR Code',
    icon: 'qr-code',
    headerShown: false,
  },
  {
    name: 'classes',
    title: 'Classes',
    icon: 'calendar',
    headerShown: false,
  },
  {
    name: 'membership',
    title: 'Membership',
    icon: 'credit-card',
    headerShown: false,
  },
  {
    name: 'profile',
    title: 'Profile',
    icon: 'user',
    headerShown: false,
  },
];

// Navigation helpers
export const getTabIconName = (routeName: string): TabIconName => {
  const config = tabConfigs.find(tab => tab.name === routeName);
  return config?.icon || 'home';
};

export const getTabTitle = (routeName: string): string => {
  const config = tabConfigs.find(tab => tab.name === routeName);
  return config?.title || 'MITUGYM';
};

// Navigation state helpers
export const isTabRoute = (routeName: string): boolean => {
  return tabConfigs.some(tab => tab.name === routeName);
};

export const shouldShowFloatingQR = (routeName: string): boolean => {
  // Show floating QR button on all tabs except QR tab itself
  // Explicitly list the pages where we want the button to appear
  const pagesWithFloatingQR = ['index', 'services', 'membership', 'profile'];
  return pagesWithFloatingQR.includes(routeName);
};

// Route params helpers
export const getClassIdFromRoute = (route: ClassDetailRouteProp): string => {
  return route.params.id;
};

// Animation configurations
export const screenOptions = {
  headerShown: false,
  gestureEnabled: true,
  cardStyleInterpolator: ({ current, layouts }: any) => {
    return {
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
            }),
          },
        ],
      },
    };
  },
};

export const tabBarOptions = {
  headerShown: false,
  tabBarStyle: {
    backgroundColor: '#111618',
    borderTopColor: '#1e9b71',
    borderTopWidth: 1,
    height: 70,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarActiveTintColor: '#1e9b71',
  tabBarInactiveTintColor: '#a7c3ba',
  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: '500',
  },
  tabBarIconStyle: {
    marginBottom: 4,
  },
};
