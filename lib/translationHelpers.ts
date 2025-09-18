import { TranslationKey } from './translations';

// Helper function to get day name translation key
export const getDayTranslationKey = (dayOfWeek: number): TranslationKey => {
  const dayKeys: TranslationKey[] = [
    'monday',    // 0
    'tuesday',   // 1
    'wednesday', // 2
    'thursday',  // 3
    'friday',    // 4
    'saturday',  // 5
    'sunday',    // 6
  ];

  return dayKeys[dayOfWeek] || 'monday';
};

// Helper function to format time with localized status
export const getGymStatusTranslationKey = (status: string): TranslationKey => {
  switch (status.toLowerCase()) {
    case 'open':
    case 'open now':
      return 'openNow';
    case 'closed':
      return 'closed';
    case 'opens today':
      return 'opensToday';
    case 'opens tomorrow':
      return 'opensTomorrow';
    default:
      return 'notAvailable';
  }
};

// Helper to get filter translation keys
export const getFilterTranslationKey = (filter: string): TranslationKey => {
  switch (filter) {
    case 'ALL':
      return 'all';
    case '1M':
      return 'oneMonth';
    case '3M':
      return 'threeMonths';
    case '6M':
      return 'sixMonths';
    case '1Y':
      return 'oneYear';
    default:
      return 'all';
  }
};
