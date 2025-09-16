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

MITUGYM is a production-quality gym management mobile application built with React Native, Expo, TypeScript, and Supabase. It provides a complete gym experience including secure authentication, profile management, QR code entry, class booking, and membership management with real-time data storage.

### ✨ Key Features

- **🔐 Secure Authentication**: Supabase-powered email/password registration and login
- **👤 Complete User Profiles**: Personal information with database persistence
- **📝 Advanced Registration**: Native date picker, dropdown gender selection, and comprehensive forms
- **🔐 Quick Check-In**: Secure QR code system for fast gym entry
- **📅 Class Booking**: Reserve spots in fitness classes with real-time availability
- **💳 Membership Management**: Track status, view history, and easy renewal
- **📱 Modern UI**: Dark theme with premium design and smooth animations
- **🎯 User-Friendly**: Intuitive navigation with floating action buttons
- **🗄️ Real-time Data**: Live profile data with Supabase integration
- **🛡️ Password Recovery**: Secure password reset functionality

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

The app uses Supabase for authentication and data storage. The following components are configured:

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
  membership_plan TEXT DEFAULT 'Basic',
  join_date TIMESTAMPTZ DEFAULT NOW(),
  expiry_date TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  visits_left INTEGER DEFAULT 10,
  days_left INTEGER,
  last_check_in TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS)

- **Users can view own profile**: `auth.uid() = id`
- **Users can update own profile**: `auth.uid() = id` 
- **Users can insert own profile**: `auth.uid() = id`

### Database Functions

**`create_user_profile()`** - Securely creates user profiles during registration:
```sql
CREATE OR REPLACE FUNCTION create_user_profile(...)
RETURNS UUID SECURITY DEFINER
```

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
│   ├── (tabs)/            # Tab navigation screens
│   ├── class/             # Class detail modals
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Onboarding entry
├── components/            # Reusable UI components
│   ├── AppHeader.tsx      # App header component
│   ├── ClassCard.tsx      # Class card component
│   ├── PillButton.tsx     # Modern button component
│   ├── QRCard.tsx         # QR code display
│   ├── StatusCard.tsx     # Membership status
│   ├── NativeDatePicker.tsx # Native iOS/Android date picker
│   ├── DropdownPicker.tsx  # Custom dropdown selection
│   ├── Toast.tsx          # Toast notifications
│   └── ...
├── lib/                   # Core logic and utilities
│   ├── store.ts           # Zustand state management
│   ├── theme.ts           # Design system tokens
│   ├── mock.ts            # Mock data
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
- **React Native Async Storage** - Local data persistence
- **React Native URL Polyfill** - URL support for Supabase

### UI & Styling
- **NativeWind** 2.0.11 - Tailwind CSS for React Native
- **Expo Linear Gradient** 15.0.7 - Gradient effects
- **Lucide React Native** 0.544.0 - Modern icon library
- **React Native Safe Area Context** 5.6.0 - Safe area handling
- **React Native DateTimePicker** - Native date/time selection

### State Management
- **Zustand** 4.5.4 - Lightweight state management

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

## 📱 App Features

### 🔐 Authentication
- **Email/Password**: Secure Supabase authentication
- **User Registration**: Comprehensive profile creation with validation
- **Password Recovery**: Secure password reset via email
- **Profile Management**: Complete user information with database persistence
- **Form Validation**: Real-time validation for all user inputs
- **Native UI Components**: iOS/Android native date picker and dropdowns

### 🏠 Home Dashboard
- **Membership Status**: Active/expired with days/visits remaining
- **Quick Actions**: QR code access and last check-in info
- **Today's Classes**: Preview of scheduled classes
- **Popular Classes**: Trending fitness sessions

### 📱 QR Code System
- **Dynamic Tokens**: Auto-regenerating QR codes (60s expiry)
- **Visual Timer**: Countdown with color-coded urgency
- **Security Features**: Mock JWT-style tokens
- **Status Indicators**: Valid/expired state banners

### 📅 Class Management
- **Class Browsing**: Filter by category (All, Today, Yoga, etc.)
- **Real-time Availability**: Live spot counting
- **Instant Booking**: Reserve/cancel with haptic feedback
- **Class Details**: Full information modals with trainer info

### 💳 Membership Hub
- **Status Overview**: Current plan and expiry tracking
- **Renewal System**: In-app plan selection and upgrade
- **Activity History**: Recent bookings and check-ins
- **Plan Comparison**: Feature matrix for different tiers

### 👤 Profile Center
- **Live Profile Data**: Real-time data from Supabase database
- **Personal Information**: Name, date of birth, contact details, address
- **Age Calculation**: Dynamic age calculation from date of birth
- **Membership Details**: Plan, status, and expiry information
- **Contact Information**: Email, phone, and address management
- **Notification Settings**: Granular preference controls
- **App Settings**: Terms, privacy, support access
- **Session Management**: Secure logout functionality

## 🎭 Mock Data & State

### Demo Features
- **Toggle Membership**: Switch between active/expired for testing
- **Booking System**: Local state management for reservations
- **QR Generation**: Random token creation with expiry
- **Toast Notifications**: Success/error feedback system

### Data Models
- **Member**: User profile with membership details
- **GymClass**: Class information with availability
- **Booking**: Reservation history and status
- **Plans**: Membership tier options with features

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
- **Efficient Re-renders**: Optimized state selectors
- **Standalone Auth Manager**: Prevents React re-render loops
- **Global State Coordination**: Prevents navigation conflicts
- **Robust Error Handling**: Comprehensive try-catch blocks

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
