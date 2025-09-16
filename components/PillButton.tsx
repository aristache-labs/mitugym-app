
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LucideIcon } from 'lucide-react-native';
import { theme } from '../lib/theme';
import { triggerHaptic } from '../lib/utils';

interface PillButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export function PillButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
}: PillButtonProps) {

  const handlePress = () => {
    if (disabled || loading) {return;}
    triggerHaptic('medium');
    onPress();
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.xs,
          fontSize: 13,
          iconSize: 16,
          borderRadius: theme.borderRadius.lg,
          height: 36,
        };
      case 'large':
        return {
          paddingHorizontal: theme.spacing.xl,
          paddingVertical: theme.spacing.sm,
          fontSize: theme.typography.body.fontSize,
          iconSize: 20,
          borderRadius: theme.borderRadius.xl,
          height: 48,
        };
      default: // medium
        return {
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.xs,
          fontSize: 14,
          iconSize: 18,
          borderRadius: theme.borderRadius.lg,
          height: 42,
        };
    }
  };

  const getVariantStyles = () => {
    const opacity = disabled ? 0.5 : 1;

    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: theme.colors.secondary.DEFAULT,
          borderColor: theme.colors.secondary.DEFAULT,
          textColor: theme.colors.background.DEFAULT,
          opacity,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: theme.colors.primary.DEFAULT,
          textColor: theme.colors.primary.DEFAULT,
          opacity,
        };
      case 'danger':
        return {
          backgroundColor: theme.colors.status.error,
          borderColor: theme.colors.status.error,
          textColor: '#ffffff',
          opacity,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          textColor: theme.colors.text.secondary,
          opacity,
        };
      default: // primary
        return {
          backgroundColor: theme.colors.primary.DEFAULT,
          borderColor: theme.colors.primary.DEFAULT,
          textColor: '#ffffff',
          opacity,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();

  const ButtonContent = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: sizeStyles.height - (sizeStyles.paddingVertical * 2),
      }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyles.textColor}
        />
      ) : (
        <>
          {Icon && iconPosition === 'left' && (
            <Icon
              size={sizeStyles.iconSize}
              color={variantStyles.textColor}
              style={{ marginRight: theme.spacing.sm }}
            />
          )}

          <Text
            style={{
              fontSize: sizeStyles.fontSize,
              fontWeight: '600',
              color: variantStyles.textColor,
              textAlign: 'center',
              letterSpacing: 0.3,
            }}
          >
            {title}
          </Text>

          {Icon && iconPosition === 'right' && (
            <Icon
              size={sizeStyles.iconSize}
              color={variantStyles.textColor}
              style={{ marginLeft: theme.spacing.sm }}
            />
          )}
        </>
      )}
    </View>
  );

  if (variant === 'primary' && !disabled) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={{
          width: fullWidth ? '100%' : undefined,
          opacity: variantStyles.opacity,
        }}
      >
        <LinearGradient
          colors={[theme.colors.primary.DEFAULT, theme.colors.primary[600]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: sizeStyles.borderRadius,
            paddingHorizontal: sizeStyles.paddingHorizontal,
            paddingVertical: sizeStyles.paddingVertical,
            height: sizeStyles.height,
            justifyContent: 'center',
            ...theme.shadows.soft,
          }}
        >
          {ButtonContent}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={{
        backgroundColor: variantStyles.backgroundColor,
        borderWidth: variant === 'outline' ? 1.5 : 0,
        borderColor: variantStyles.borderColor,
        borderRadius: sizeStyles.borderRadius,
        paddingHorizontal: sizeStyles.paddingHorizontal,
        paddingVertical: sizeStyles.paddingVertical,
        height: sizeStyles.height,
        justifyContent: 'center',
        width: fullWidth ? '100%' : undefined,
        opacity: variantStyles.opacity,
        ...theme.shadows.soft,
      }}
    >
      {ButtonContent}
    </TouchableOpacity>
  );
}
