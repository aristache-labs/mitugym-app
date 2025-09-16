
import { TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { QrCode } from 'lucide-react-native';
import { theme } from '../lib/theme';
import { triggerHaptic } from '../lib/utils';

interface FloatingQRButtonProps {
  onPress: () => void;
  visible?: boolean;
}

export function FloatingQRButton({ onPress, visible = true }: FloatingQRButtonProps) {
  const insets = useSafeAreaInsets();

  const handlePress = () => {
    triggerHaptic('medium');
    onPress();
  };

  if (!visible) {return null;}

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={{
        position: 'absolute',
        bottom: insets.bottom + 100, // Above tab bar
        right: theme.spacing.lg,
        zIndex: 1000,
      }}
    >
      <LinearGradient
        colors={[theme.colors.primary.DEFAULT, theme.colors.primary[600]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          justifyContent: 'center',
          alignItems: 'center',
          ...theme.shadows.strong,
        }}
      >
        <QrCode
          size={28}
          color="#ffffff"
        />
      </LinearGradient>
    </TouchableOpacity>
  );
}
