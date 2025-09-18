# MITUGYM - Gym Check-In App

<div align="center">
  <h1>🏋️‍♂️ MITUGYM</h1>
  <p>Your fitness journey starts here</p>
  
  [![React Native](https://img.shields.io/badge/React%20Native-0.81.4-blue.svg)](https://reactnative.dev/)
  [![Expo](https://img.shields.io/badge/Expo-54.0.7-000020.svg)](https://expo.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue.svg)](https://www.typescriptlang.org/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
</div>

## 📱 Overview

MITUGYM is a production-quality gym management mobile application built with React Native, Expo, TypeScript, and Supabase. It provides a complete premium gym experience including secure authentication, membership management with real plans, QR-based check-ins with live occupancy tracking, personal services booking, multi-language support, and real-time announcements - all with automated database functions for seamless operations.

### ✨ Key Features

- **🔐 Secure Authentication**: Supabase-powered email/password registration and login with social login options
- **👤 Complete User Profiles**: Personal information with database persistence
- **📝 Advanced Registration**: Native date picker, dropdown gender selection, and comprehensive forms
- **🎯 Membership Management**: Real membership plans with automatic expiry tracking and days calculation
- **🏃‍♂️ Check-In System**: QR-based gym entry with automatic check-out and occupancy tracking
- **💼 Personal Services**: Personal Trainer and Professional Massage booking system
- **📱 Modern UI**: Dark theme with premium design and smooth animations
- **🌍 Multi-Language Support**: Full English and Romanian localization
- **📰 Announcements**: Real-time gym announcements and news system
- **⏰ Gym Schedule**: Live gym hours with smart status indicators
- **🗄️ Real-time Data**: Live profile data with Supabase integration
- **🛡️ Password Recovery**: Secure password reset functionality
- **🔔 Smart Notifications**: Automated check-out and data cleanup systems

## 🆕 Recent Major Updates

### Latest Release Features (September 2024)

**🔄 Complete System Overhaul**
- **Real Database Integration**: Migrated from mock data to full Supabase implementation
- **Membership System**: Real membership plans with automatic expiry tracking
- **Check-In Revolution**: QR-based system with live gym occupancy and auto-checkout
- **Services Transformation**: Replaced classes with Personal Trainer and Massage services

**🌍 Multi-Language Implementation**
- **Full Localization**: Complete English and Romanian translation system
- **Smart Persistence**: Language preferences saved across app sessions
- **Premium Messaging**: Professional authentication and onboarding copy

**🏠 Homepage Redesign**
- **Live Information**: Real-time announcements and gym schedule integration
- **Smart Status Indicators**: Dynamic gym hours with opening/closing times
- **Occupancy Tracking**: Live count of people currently in gym
- **Filtered History**: Check-in history with time-based filtering

**⚙️ Backend Automation**
- **Automated Check-out**: Smart system checks out users when gym closes
- **Data Cleanup**: Scheduled jobs for invalid check-in removal
- **Timezone Handling**: Romania timezone support with DST awareness
- **Database Functions**: Custom PostgreSQL functions for business logic

**🎨 UI/UX Enhancements**
- **Premium Design**: Professional authentication with social login UI
- **Keyboard Optimization**: Touch-to-dismiss keyboard behavior
- **Navigation Fixes**: Resolved logout navigation and state management issues
- **Component Evolution**: Updated headers, status cards, and form components

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or later
- **npm** or **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **Expo Go** app on your mobile device

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mitugym-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup Supabase environment**
   
   Create a `.env.local` file in the project root with your Supabase credentials:
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
   ```
   
   The database schema and RLS policies are automatically configured. See the **Database Setup** section below for details.

4. **Font files included**
   
   The Inter font family is already included in `assets/fonts/` with all required weights:
   - ✅ `Inter-Regular.ttf` 
   - ✅ `Inter-Medium.ttf`
   - ✅ `Inter-SemiBold.ttf` 
   - ✅ `Inter-Bold.ttf`

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Run on device**
   - Scan the QR code with Expo Go (Android) or Camera app (iOS)
   - Or run on simulator: `npm run ios` or `npm run android`

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo development server |
| `npm run ios` | Run on iOS simulator |
| `npm run android` | Run on Android emulator |
| `npm run web` | Run in web browser |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run test` | Run Jest tests |

## 🗄️ Database Setup (Supabase)

The app uses Supabase for authentication and data storage with a comprehensive schema for gym management.

### Database Schema

**Profiles Table (`profiles`)**
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  date_of_birth DATE,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  county TEXT,
  gender TEXT,
  avatar_url TEXT,
  membership_status TEXT DEFAULT 'active',
  membership_plan_id UUID REFERENCES membership_plans(id),
  join_date TIMESTAMPTZ DEFAULT NOW(),
  expiry_date TIMESTAMPTZ,
  days_left INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Membership Plans Table (`membership_plans`)**
```sql
CREATE TABLE membership_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_months INTEGER NOT NULL,
  is_student BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Services Table (`services`)**
```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  price DECIMAL(10,2),
  service_type TEXT NOT NULL,
  requires_advance_booking BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Check-ins Table (`checkins`)**
```sql
CREATE TABLE checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  check_in_time TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Europe/Bucharest'),
  check_out_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Announcements Table (`announcements`)**
```sql
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Gym Schedule Table (`gym_schedule`)**
```sql
CREATE TABLE gym_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS)

- **Users can view own profile**: `auth.uid() = id`
- **Users can update own profile**: `auth.uid() = id` 
- **Users can insert own profile**: `auth.uid() = id`

### Database Functions & Automation

**Profile Management**
- `create_user_profile()` - Securely creates user profiles during registration
- `update_days_left()` - Trigger function to automatically calculate membership days remaining

**Check-in System**
- `get_current_gym_occupancy()` - Returns current people in gym with validation
- `cleanup_invalid_checkins()` - Removes stale check-ins older than 24 hours
- `auto_checkout_at_closing()` - Automatically checks out users when gym closes
- `run_auto_checkout_with_logging()` - Wrapper function with logging for manual triggers

**Automated Scheduling (pg_cron)**
- Auto-checkout runs every 5 minutes: `SELECT cron.schedule('auto-checkout', '*/5 * * * *', 'SELECT auto_checkout_at_closing();');`
- Cleanup invalid check-ins runs hourly: `SELECT cron.schedule('cleanup-checkins', '0 * * * *', 'SELECT cleanup_invalid_checkins();');`

**Timezone Handling**
- All time operations use `AT TIME ZONE 'Europe/Bucharest'` for Romania timezone
- Automatic daylight saving time adjustments

### Environment Configuration

Add these environment variables to your `.env.local`:
```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your-anon-key
```

## 🏗️ Project Structure

```
mitugym-app/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication screens
│   │   ├── login.tsx      # Login with social options
│   │   ├── register.tsx   # Registration with validation
│   │   └── recovery.tsx   # Password recovery
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Homepage with announcements & gym status
│   │   ├── membership.tsx # Membership with real plans & check-in history
│   │   ├── services.tsx   # Personal trainer & massage services
│   │   └── profile.tsx    # Profile with language settings
│   ├── service/           # Service detail modals
│   ├── _layout.tsx        # Root layout with language provider
│   └── index.tsx          # Onboarding entry
├── components/            # Reusable UI components
│   ├── AppHeader.tsx      # App header with solid background
│   ├── ServiceCard.tsx    # Service booking cards
│   ├── PillButton.tsx     # Modern button component
│   ├── QRCard.tsx         # QR code display
│   ├── StatusCard.tsx     # Membership status (no visits, shows expiry)
│   ├── EmptyState.tsx     # Empty state illustrations
│   ├── ListFilters.tsx    # Filter buttons for check-ins
│   ├── NativeDatePicker.tsx # Native iOS/Android date picker
│   ├── DropdownPicker.tsx  # Custom dropdown with translation support
│   ├── Toast.tsx          # Toast notifications
│   └── ...
├── lib/                   # Core logic and utilities
│   ├── store.ts           # Zustand state management (all features)
│   ├── theme.ts           # Design system tokens
│   ├── mock.ts            # Data interfaces and helpers
│   ├── translations.ts    # English & Romanian translations
│   ├── LanguageContext.tsx # Language provider & hook
│   ├── translationHelpers.ts # Translation utility functions
│   ├── utils.ts           # Utility functions
│   └── navigation.ts      # Navigation helpers
├── utils/                 # Utility modules
│   ├── supabase.ts        # Supabase client configuration
│   ├── authManager.ts     # Standalone authentication manager
│   └── useSupabaseAuth.ts # Auth state management hook
├── assets/                # Static assets
│   ├── fonts/             # Font files
│   └── images/            # Image assets
└── __tests__/             # Test files
```

## 🎨 Design System

### Color Palette

**Brand-Aligned Turquoise Theme** 🎨
- **Primary**: `#4DD4D4` (Turquoise - matches logo)
- **Secondary**: `#5CDFDF` (Light Turquoise)  
- **Accent**: `#44E4E4` (Bright Turquoise highlights)
- **Background**: `#0A0F0F` (Deep Dark)
- **Surface**: `#141A1A` (Dark Surface)
- **Card**: `#1A2222` (Card Backgrounds)
- **Text Primary**: `#F0FEFE` (High Contrast)
- **Text Secondary**: `#B3D9D9` (Muted Turquoise)
- **Text Tertiary**: `#7A9999` (Caption Text)
- **Gray**: `#8B9999` (Logo Gray)
- **Success**: `#00E6A6` (Turquoise-tinted)
- **Warning**: `#FFD93D` (Bright Yellow)
- **Error**: `#FF6B6B` (Coral Red)

### Typography

- **Font Family**: Inter (fallback: SF Pro / Roboto)
- **Sizes**: 12px (small) → 32px (h1)
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Spacing & Layout

- **Base Unit**: 4px
- **Common Sizes**: 8px, 16px, 24px, 32px, 48px
- **Border Radius**: 16px-20px for cards, 8px for smaller elements
- **Shadows**: Soft elevation with 2-8px blur

## 🔧 Tech Stack

### Core Technologies
- **React Native** 0.81.4 - Mobile app framework
- **Expo** 54.0.7 - Development platform
- **TypeScript** 5.9.2 - Type safety
- **Expo Router** 6.0.5 - File-based navigation

### Backend & Database
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **@supabase/supabase-js** - Supabase JavaScript client
- **PostgreSQL Functions** - Custom business logic and automation
- **pg_cron Extension** - Scheduled database jobs for auto-checkout
- **Row Level Security** - Secure data access policies
- **React Native Async Storage** - Local data persistence and language settings
- **React Native URL Polyfill** - URL support for Supabase

### UI & Styling
- **NativeWind** 2.0.11 - Tailwind CSS for React Native
- **Expo Linear Gradient** 15.0.7 - Gradient effects
- **Lucide React Native** 0.544.0 - Modern icon library
- **React Native Safe Area Context** 5.6.0 - Safe area handling
- **React Native DateTimePicker** - Native date/time selection

### State Management & Internationalization
- **Zustand** 4.5.4 - Lightweight state management
- **React Context** - Language provider for i18n
- **AsyncStorage** - Persistent language preferences

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework
- **TypeScript** - Static type checking

## 🧪 Testing

The app includes comprehensive test coverage for components and utilities:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Test Structure
- **Component Tests**: UI rendering and interaction
- **Utility Tests**: Helper function validation
- **Integration Tests**: Feature workflow testing

## 🌍 Multi-Language Support

### Localization Features
- **Complete Translation**: All UI elements, forms, and messages
- **Language Persistence**: User preference saved locally with AsyncStorage
- **Dynamic Switching**: Real-time language changes from profile settings
- **Supported Languages**: English (en) and Romanian (ro)
- **Context-Aware**: Navigation and state preserved during language changes

### Translation Coverage
- **Authentication**: Login, register, recovery pages with form validation
- **Navigation**: Tab labels, headers, and button text
- **Homepage**: Announcements, gym schedule, membership status
- **Services**: Personal trainer and massage booking
- **Profile**: Settings, legal pages, and user information
- **System Messages**: Toasts, errors, and confirmations

## 📱 App Features

### 🔐 Authentication
- **Email/Password**: Secure Supabase authentication with premium messaging
- **Social Login**: Google and Facebook integration buttons (UI ready)
- **User Registration**: Comprehensive profile creation with validation
- **Password Recovery**: Secure password reset via email with professional messaging
- **Profile Management**: Complete user information with database persistence
- **Form Validation**: Real-time validation for all user inputs
- **Native UI Components**: iOS/Android native date picker and dropdowns
- **Remember Me**: Secure credential storage with biometric option
- **Multi-Language**: All authentication flows fully translated

### 🏠 Home Dashboard
- **Announcements**: Real-time gym news and updates with modal details
- **Gym Hours**: Live gym status with smart opening/closing indicators
- **Membership Status**: Active/expired with days remaining and expiry date
- **Quick Stats**: Last visit, current month check-ins, live gym occupancy
- **QR Code Access**: Quick gym entry
- **Available Services**: Personal trainer and massage options

### 🏃‍♂️ Check-In System
- **QR-Based Entry**: Secure gym access via QR scanning (gym-side implementation)
- **Automatic Check-out**: Smart system checks out users when gym closes
- **Live Occupancy**: Real-time count of people currently in gym
- **History Tracking**: Complete check-in history with filtering options
- **Data Validation**: Automatic cleanup of invalid/stale check-ins
- **Timezone Aware**: Romania timezone handling with DST support

### 💼 Services Management
- **Personal Training**: 1 hour, 8/12/18 session packages
- **Professional Massage**: 1 hour sessions with advance booking required
- **Service Booking**: Reserve and manage appointments
- **Booking History**: Track past and upcoming services

### 💳 Membership Hub
- **Real Membership Plans**: Full, Student, One Day Entry options (1M/3M/6M/1Y)
- **Status Overview**: Current plan name, days left, and expiry date
- **Check-in History**: Complete gym visit history with filtering (1M/3M/6M/1Y/ALL)
- **Live Occupancy**: Real-time count of people currently in gym
- **Automatic Tracking**: Database-driven membership calculations

### 👤 Profile Center
- **Live Profile Data**: Real-time data from Supabase database
- **Personal Information**: Name, date of birth, contact details, address
- **Age Calculation**: Dynamic age calculation from date of birth
- **Membership Details**: Plan, status, and expiry information
- **Contact Information**: Email, phone, and address management
- **App Settings**: Language selection (English/Romanian), Biometric Authentication
- **Notification Settings**: Granular preference controls
- **Legal & Support**: Terms, privacy, rate app, support access
- **Session Management**: Secure logout with proper navigation

## 🏗️ Data Architecture

### Real Database Integration
- **Supabase Backend**: All data stored in PostgreSQL with RLS
- **Real-time Updates**: Live data synchronization across app
- **Automated Functions**: Database triggers and scheduled jobs
- **Data Validation**: Server-side validation and cleanup

### Data Models
- **Member**: User profile with real membership plans
- **MembershipPlan**: Actual subscription plans with pricing
- **Service**: Personal trainer and massage services
- **Checkin**: Gym visit tracking with timestamps
- **Announcement**: Real-time gym news and updates
- **GymSchedule**: Dynamic gym hours with status calculation

## 🚀 Backend Integration

The app is fully integrated with Supabase for authentication and data management:

### Current Supabase Integration

**Authentication (✅ Implemented)**
```typescript
// Supabase authentication in lib/store.ts
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});
```

**Profile Management (✅ Implemented)**
```typescript
// Real-time profile data from Supabase
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', session.user.id)
  .single();
```

### QR Token Generation
```typescript
// Replace in QRCard component
const response = await fetch('/api/qr/generate', {
  headers: { Authorization: `Bearer ${token}` }
});
```

### Class Booking
```typescript
// Replace in store.ts - reserveClass function
await fetch(`/api/classes/${classId}/reserve`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` }
});
```

### Membership Management
```typescript
// Replace in store.ts - renewMembership function
await fetch('/api/membership/renew', {
  method: 'POST',
  body: JSON.stringify({ planId })
});
```

## 📸 Screenshots

<!-- Add screenshots when available -->
![Onboarding](assets/images/screenshot-onboarding.png)
![Home](assets/images/screenshot-home.png)
![QR Code](assets/images/screenshot-qr.png)
![Classes](assets/images/screenshot-classes.png)

## 🎨 Assets & Branding

### Required Assets
- **App Icon**: 1024x1024px PNG
- **Splash Screen**: 1284x2778px for iOS
- **Onboarding Images**: 1200x1200px illustrations
- **Font Files**: Inter family (Regular, Medium, SemiBold, Bold) - ✅ Included

### Brand Guidelines
- **Logo Usage**: MITUGYM wordmark in turquoise (#4DD4D4)
- **Color Application**: Dark backgrounds with turquoise accents
- **Typography**: Inter for all text content
- **Icon Style**: Outlined icons from Lucide library

## 🔧 Customization

### Theming
Modify `lib/theme.ts` to customize:
- Color palette
- Typography scale
- Spacing system
- Shadow definitions

### Components
All components accept standard props:
- `variant`: Style variations
- `size`: Small, medium, large
- `disabled`: Disabled state
- `loading`: Loading state

### Navigation
Expo Router configuration in:
- `app/_layout.tsx`: Root navigation
- `app/(tabs)/_layout.tsx`: Tab navigation
- Individual screen files for stack navigation

## 🐛 Troubleshooting

### Common Issues

**Fonts not loading**
- Font files are included in `assets/fonts/` by default
- If issues persist, restart Expo development server with `npx expo start --clear`
- Check that font names match exactly in your components

**Metro bundler issues**
- Clear cache: `npx expo start --clear`
- Reset npm cache: `npm start -- --reset-cache`

**TypeScript errors**
- Run type check: `npm run typecheck`
- Check import paths and dependencies

**Navigation issues**
- Verify Expo Router configuration
- Check screen file naming conventions

## 📈 Performance

### Optimization Features
- **Image Optimization**: Expo Image for efficient loading
- **Bundle Splitting**: Code splitting with Expo Router
- **State Management**: Optimized Zustand store
- **Animation**: Native driver for smooth transitions

### Best Practices Implemented
- **TypeScript Strict Mode**: Maximum type safety
- **ESLint Rules**: Code quality enforcement
- **Component Memoization**: React.memo where appropriate
- **Efficient Re-renders**: Optimized state selectors with useCallback
- **Standalone Auth Manager**: Prevents React re-render loops
- **Global State Coordination**: Prevents navigation conflicts
- **Robust Error Handling**: Comprehensive try-catch blocks
- **Timezone Management**: Consistent timezone handling across app and database
- **Database Automation**: Scheduled jobs for data cleanup and maintenance
- **Internationalization**: Scalable translation system with React Context
- **Accessibility**: Proper semantic structure and navigation

## 🚢 Deployment

### Development
1. Install Expo CLI globally
2. Run `npm start` for development server
3. Use Expo Go app for device testing

### Production Build
```bash
# iOS
npx expo run:ios --configuration Release

# Android  
npx expo run:android --variant release

# Web
npx expo export:web
```

### App Store Deployment
1. Configure `app.config.ts` with production values
2. Build using EAS: `npx eas build`
3. Submit to stores: `npx eas submit`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Write tests for new components
- Follow existing code style
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For questions and support:
- **Email**: support@mitugym.com
- **Issues**: [GitHub Issues](https://github.com/mitugym/app/issues)
- **Docs**: [Documentation](https://docs.mitugym.com)

## 🙏 Acknowledgments

- **Design Inspiration**: Modern fitness app UX patterns
- **Icons**: [Lucide](https://lucide.dev/) icon library
- **Fonts**: [Inter](https://rsms.me/inter/) by Rasmus Andersson
- **Framework**: [Expo](https://expo.dev/) development platform

---

<div align="center">
  <p>Built with ❤️ by the MITUGYM team</p>
  <p>© 2024 MITUGYM. All rights reserved.</p>
</div>
