
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Bell } from 'lucide-react-native';
import { theme } from '../lib/theme';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showNotifications?: boolean;
  onBack?: () => void;
  onNotificationPress?: () => void;
  transparent?: boolean;
}

export function AppHeader({
  title,
  subtitle,
  showBack = false,
  showNotifications = false,
  onBack,
  onNotificationPress,
  transparent = false,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();

  const headerHeight = Platform.OS === 'ios' ? 44 : 56;
  const totalHeight = headerHeight + insets.top;

  const HeaderContent = (
    <View
      style={{
        height: totalHeight,
        paddingTop: insets.top,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.md,
      }}
    >
      {/* Left side */}
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        {showBack && (
          <TouchableOpacity
            onPress={onBack}
            style={{
              padding: theme.spacing.sm,
              marginRight: theme.spacing.sm,
              borderRadius: theme.borderRadius.sm,
              backgroundColor: 'rgba(30, 155, 113, 0.1)',
            }}
            activeOpacity={0.7}
          >
            <ChevronLeft
              size={24}
              color={theme.colors.primary.DEFAULT}
            />
          </TouchableOpacity>
        )}

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: theme.typography.h3.fontSize,
              fontWeight: theme.typography.h3.fontWeight,
              color: theme.colors.text.primary,
              lineHeight: theme.typography.h3.lineHeight,
            }}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={{
                fontSize: theme.typography.caption.fontSize,
                color: theme.colors.text.secondary,
                lineHeight: theme.typography.caption.lineHeight,
                marginTop: 2,
              }}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {/* Right side */}
      {showNotifications && (
        <TouchableOpacity
          onPress={onNotificationPress}
          style={{
            padding: theme.spacing.sm,
            borderRadius: theme.borderRadius.sm,
            backgroundColor: 'rgba(30, 155, 113, 0.1)',
          }}
          activeOpacity={0.7}
        >
          <Bell
            size={24}
            color={theme.colors.primary.DEFAULT}
          />
        </TouchableOpacity>
      )}
    </View>
  );

  if (transparent) {
    return (
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
      }}>
        {HeaderContent}
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['rgba(17, 22, 24, 0.95)', 'rgba(11, 15, 14, 0.8)']}
      style={{
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(30, 155, 113, 0.2)',
      }}
    >
      {HeaderContent}
    </LinearGradient>
  );
}
