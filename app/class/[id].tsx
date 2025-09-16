import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Clock, 
  MapPin, 
  User, 
  Users, 
  Calendar,
  Info,
  AlertCircle
} from 'lucide-react-native';
import { useAppStore } from '../../lib/store';
import { theme } from '../../lib/theme';
import { 
  formatTime12Hour, 
  formatRelativeDate, 
  getLevelColor, 
  getSpotsLeftText 
} from '../../lib/utils';
import { getClassById } from '../../lib/mock';
import { AppHeader } from '../../components/AppHeader';
import { PillButton } from '../../components/PillButton';

export default function ClassDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  
  const { 
    isClassReserved,
    reserveClass,
    cancelReservation
  } = useAppStore();

  const gymClass = getClassById(id || '');

  if (!gymClass) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: theme.colors.background.DEFAULT,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.xl,
      }}>
        <AlertCircle
          size={48}
          color={theme.colors.status.error}
          style={{ marginBottom: theme.spacing.lg }}
        />
        <Text style={{
          fontSize: theme.typography.h3.fontSize,
          fontWeight: theme.typography.h3.fontWeight,
          color: theme.colors.text.primary,
          textAlign: 'center',
          marginBottom: theme.spacing.md,
        }}>
          Class Not Found
        </Text>
        <Text style={{
          fontSize: theme.typography.body.fontSize,
          color: theme.colors.text.secondary,
          textAlign: 'center',
          marginBottom: theme.spacing.xl,
        }}>
          The class you're looking for doesn't exist or has been removed.
        </Text>
        <PillButton
          title="Go Back"
          onPress={() => router.back()}
          variant="primary"
        />
      </View>
    );
  }

  const isReserved = isClassReserved(gymClass.id);
  const isFull = gymClass.spotsLeft <= 0;
  const levelColor = getLevelColor(gymClass.level);

  const handleReservation = () => {
    if (isReserved) {
      cancelReservation(gymClass.id);
    } else {
      reserveClass(gymClass.id);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background.DEFAULT }}>
      <AppHeader
        title={gymClass.title}
        subtitle={gymClass.category}
        showBack
        onBack={handleBack}
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: insets.bottom + theme.spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={[
            'rgba(30, 155, 113, 0.1)',
            'rgba(17, 22, 24, 0.8)',
          ]}
          style={{
            borderRadius: theme.borderRadius.xl,
            padding: theme.spacing.xl,
            marginTop: theme.spacing.lg,
            marginBottom: theme.spacing.xl,
            borderWidth: 1,
            borderColor: 'rgba(30, 155, 113, 0.2)',
            ...theme.shadows.medium,
          }}
        >
          {/* Level Badge */}
          <View style={{
            alignSelf: 'flex-start',
            backgroundColor: `${levelColor}20`,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            borderRadius: theme.borderRadius.lg,
            borderWidth: 1,
            borderColor: `${levelColor}40`,
            marginBottom: theme.spacing.lg,
          }}>
            <Text style={{
              fontSize: theme.typography.caption.fontSize,
              fontWeight: '600',
              color: levelColor,
              textTransform: 'uppercase',
            }}>
              {gymClass.level}
            </Text>
          </View>

          {/* Class Title */}
          <Text style={{
            fontSize: theme.typography.h1.fontSize,
            fontWeight: theme.typography.h1.fontWeight,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.md,
          }}>
            {gymClass.title}
          </Text>

          {/* Class Info Grid */}
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: theme.spacing.lg,
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              flex: 1,
              minWidth: '45%',
            }}>
              <Calendar
                size={20}
                color={theme.colors.primary.DEFAULT}
                style={{ marginRight: theme.spacing.sm }}
              />
              <View>
                <Text style={{
                  fontSize: theme.typography.caption.fontSize,
                  color: theme.colors.text.secondary,
                }}>
                  Date
                </Text>
                <Text style={{
                  fontSize: theme.typography.body.fontSize,
                  fontWeight: '600',
                  color: theme.colors.text.primary,
                }}>
                  {formatRelativeDate(gymClass.startAt)}
                </Text>
              </View>
            </View>

            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              flex: 1,
              minWidth: '45%',
            }}>
              <Clock
                size={20}
                color={theme.colors.primary.DEFAULT}
                style={{ marginRight: theme.spacing.sm }}
              />
              <View>
                <Text style={{
                  fontSize: theme.typography.caption.fontSize,
                  color: theme.colors.text.secondary,
                }}>
                  Time
                </Text>
                <Text style={{
                  fontSize: theme.typography.body.fontSize,
                  fontWeight: '600',
                  color: theme.colors.text.primary,
                }}>
                  {formatTime12Hour(gymClass.startAt)}
                </Text>
              </View>
            </View>

            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              flex: 1,
              minWidth: '45%',
            }}>
              <MapPin
                size={20}
                color={theme.colors.primary.DEFAULT}
                style={{ marginRight: theme.spacing.sm }}
              />
              <View>
                <Text style={{
                  fontSize: theme.typography.caption.fontSize,
                  color: theme.colors.text.secondary,
                }}>
                  Location
                </Text>
                <Text style={{
                  fontSize: theme.typography.body.fontSize,
                  fontWeight: '600',
                  color: theme.colors.text.primary,
                }}>
                  {gymClass.room}
                </Text>
              </View>
            </View>

            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              flex: 1,
              minWidth: '45%',
            }}>
              <Users
                size={20}
                color={isFull ? theme.colors.status.error : theme.colors.primary.DEFAULT}
                style={{ marginRight: theme.spacing.sm }}
              />
              <View>
                <Text style={{
                  fontSize: theme.typography.caption.fontSize,
                  color: theme.colors.text.secondary,
                }}>
                  Availability
                </Text>
                <Text style={{
                  fontSize: theme.typography.body.fontSize,
                  fontWeight: '600',
                  color: isFull ? theme.colors.status.error : theme.colors.text.primary,
                }}>
                  {getSpotsLeftText(gymClass.spotsLeft)}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Trainer Section */}
        <View style={{
          backgroundColor: theme.colors.background.surface,
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.xl,
          borderWidth: 1,
          borderColor: 'rgba(30, 155, 113, 0.2)',
          ...theme.shadows.soft,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.md,
          }}>
            <User
              size={24}
              color={theme.colors.secondary.DEFAULT}
              style={{ marginRight: theme.spacing.sm }}
            />
            <Text style={{
              fontSize: theme.typography.h3.fontSize,
              fontWeight: theme.typography.h3.fontWeight,
              color: theme.colors.text.primary,
            }}>
              Instructor
            </Text>
          </View>

          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <View style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: theme.colors.secondary.DEFAULT,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: theme.spacing.lg,
            }}>
              <Text style={{
                fontSize: 24,
                fontWeight: '700',
                color: '#ffffff',
              }}>
                {gymClass.trainer.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>

            <View>
              <Text style={{
                fontSize: theme.typography.h3.fontSize,
                fontWeight: '600',
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.xs,
              }}>
                {gymClass.trainer}
              </Text>
              <Text style={{
                fontSize: theme.typography.caption.fontSize,
                color: theme.colors.text.secondary,
              }}>
                Certified {gymClass.category} Instructor
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={{
          backgroundColor: theme.colors.background.surface,
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.xl,
          borderWidth: 1,
          borderColor: 'rgba(30, 155, 113, 0.2)',
          ...theme.shadows.soft,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.md,
          }}>
            <Info
              size={24}
              color={theme.colors.primary.DEFAULT}
              style={{ marginRight: theme.spacing.sm }}
            />
            <Text style={{
              fontSize: theme.typography.h3.fontSize,
              fontWeight: theme.typography.h3.fontWeight,
              color: theme.colors.text.primary,
            }}>
              About This Class
            </Text>
          </View>

          <Text style={{
            fontSize: theme.typography.body.fontSize,
            color: theme.colors.text.secondary,
            lineHeight: 24,
          }}>
            {gymClass.description}
          </Text>
        </View>

        {/* Rules */}
        <View style={{
          backgroundColor: theme.colors.background.surface,
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.xl,
          borderWidth: 1,
          borderColor: 'rgba(30, 155, 113, 0.2)',
          ...theme.shadows.soft,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.md,
          }}>
            <AlertCircle
              size={24}
              color={theme.colors.status.warning}
              style={{ marginRight: theme.spacing.sm }}
            />
            <Text style={{
              fontSize: theme.typography.h3.fontSize,
              fontWeight: theme.typography.h3.fontWeight,
              color: theme.colors.text.primary,
            }}>
              Class Rules
            </Text>
          </View>

          {gymClass.rules.map((rule, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                marginBottom: index < gymClass.rules.length - 1 ? theme.spacing.sm : 0,
              }}
            >
              <Text style={{
                fontSize: theme.typography.body.fontSize,
                color: theme.colors.primary.DEFAULT,
                marginRight: theme.spacing.sm,
                marginTop: 2,
              }}>
                •
              </Text>
              <Text style={{
                fontSize: theme.typography.body.fontSize,
                color: theme.colors.text.secondary,
                flex: 1,
                lineHeight: 22,
              }}>
                {rule}
              </Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={{ gap: theme.spacing.md }}>
          <PillButton
            title={
              isReserved 
                ? 'Cancel Reservation' 
                : isFull 
                ? 'Class Full' 
                : 'Reserve Spot'
            }
            onPress={handleReservation}
            variant={isReserved ? 'danger' : 'primary'}
            size="large"
            fullWidth
            disabled={isFull && !isReserved}
          />

          {isReserved && (
            <Text style={{
              fontSize: theme.typography.caption.fontSize,
              color: theme.colors.text.secondary,
              textAlign: 'center',
            }}>
              You have reserved a spot in this class
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
