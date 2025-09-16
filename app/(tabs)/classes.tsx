import { useState } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar } from 'lucide-react-native';
import { useAppStore } from '../../lib/store';
import { theme } from '../../lib/theme';
import {
  getClassesByCategory,
  getClassesForToday,
} from '../../lib/mock';
import { AppHeader } from '../../components/AppHeader';
import { ListFilters } from '../../components/ListFilters';
import { ClassCard } from '../../components/ClassCard';
import { EmptyState } from '../../components/EmptyState';

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

export default function ClassesScreen() {
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const {
    classes,
    isClassReserved,
    reserveClass,
    cancelReservation,
  } = useAppStore();

  // Filter options with counts
  const filterOptions: FilterOption[] = [
    { id: 'All', label: 'All', count: classes.length },
    { id: 'Today', label: 'Today', count: getClassesForToday().length },
    { id: 'Yoga', label: 'Yoga', count: getClassesByCategory('Yoga').length },
    { id: 'Cardio', label: 'Cardio', count: getClassesByCategory('Cardio').length },
    { id: 'Strength', label: 'Strength', count: getClassesByCategory('Strength').length },
    { id: 'Dance', label: 'Dance', count: getClassesByCategory('Dance').length },
  ];

  // Get filtered classes
  const getFilteredClasses = () => {
    switch (selectedFilter) {
      case 'Today':
        return getClassesForToday();
      case 'All':
        return classes;
      default:
        return getClassesByCategory(selectedFilter);
    }
  };

  const filteredClasses = getFilteredClasses();

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleClassPress = (classId: string) => {
    router.push(`/class/${classId}`);
  };

  const handleClassReserve = (classId: string) => {
    if (isClassReserved(classId)) {
      cancelReservation(classId);
    } else {
      reserveClass(classId);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background.DEFAULT }}>
      <AppHeader
        title="Classes"
        subtitle={`${filteredClasses.length} available`}
        showNotifications
        onNotificationPress={() => console.log('Notifications pressed')}
      />

      {/* Filters */}
      <ListFilters
        options={filterOptions}
        selectedId={selectedFilter}
        onSelect={setSelectedFilter}
        showCounts
      />

      {/* Classes List */}
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: insets.bottom + 100, // Account for tab bar
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary.DEFAULT}
            colors={[theme.colors.primary.DEFAULT]}
          />
        }
      >
        {filteredClasses.length > 0 ? (
          <View style={{ paddingTop: theme.spacing.md }}>
            {filteredClasses.map(gymClass => (
              <ClassCard
                key={gymClass.id}
                gymClass={gymClass}
                isReserved={isClassReserved(gymClass.id)}
                onPress={() => handleClassPress(gymClass.id)}
                onReserve={() => handleClassReserve(gymClass.id)}
                showDate={selectedFilter !== 'Today'}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            icon={Calendar}
            title="No Classes Found"
            description={
              selectedFilter === 'Today'
                ? 'No classes are scheduled for today. Check back tomorrow or browse all classes.'
                : `No classes found in the ${selectedFilter} category. Try a different filter.`
            }
            actionLabel="View All Classes"
            onAction={() => setSelectedFilter('All')}
          />
        )}
      </ScrollView>
    </View>
  );
}
