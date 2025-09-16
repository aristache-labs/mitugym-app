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

MITUGYM is a production-quality UI-only prototype for a modern gym check-in mobile application. Built with React Native, Expo, and TypeScript, it showcases a complete gym management experience including QR code entry, class booking, and membership management.

### ✨ Key Features

- **🔐 Quick Check-In**: Secure QR code system for fast gym entry
- **📅 Class Booking**: Reserve spots in fitness classes with real-time availability
- **💳 Membership Management**: Track status, view history, and easy renewal
- **📱 Modern UI**: Dark theme with premium design and smooth animations
- **🎯 User-Friendly**: Intuitive navigation with floating action buttons

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

3. **Font files included**
   
   The Inter font family is already included in `assets/fonts/` with all required weights:
   - ✅ `Inter-Regular.ttf` 
   - ✅ `Inter-Medium.ttf`
   - ✅ `Inter-SemiBold.ttf` 
   - ✅ `Inter-Bold.ttf`

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on device**
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
│   ├── PillButton.tsx     # Button component
│   ├── QRCard.tsx         # QR code display
│   ├── StatusCard.tsx     # Membership status
│   └── ...
├── lib/                   # Core logic and utilities
│   ├── store.ts           # Zustand state management
│   ├── theme.ts           # Design system tokens
│   ├── mock.ts            # Mock data
│   ├── utils.ts           # Utility functions
│   └── navigation.ts      # Navigation helpers
├── assets/                # Static assets
│   ├── fonts/             # Font files
│   └── images/            # Image assets
└── __tests__/             # Test files
```

## 🎨 Design System

### Color Palette

- **Primary**: `#1e9b71` (Green)
- **Secondary**: `#31d7a6` (Mint)  
- **Background**: `#0b0f0e` (Dark)
- **Surface**: `#111618` (Dark Grey)
- **Text Primary**: `#e6f2ee` (Light Green)
- **Text Secondary**: `#a7c3ba` (Muted Green)
- **Success**: `#2ecc71`
- **Warning**: `#f1c40f`
- **Error**: `#e74c3c`

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

### UI & Styling
- **NativeWind** 2.0.11 - Tailwind CSS for React Native
- **Expo Linear Gradient** 15.0.7 - Gradient effects
- **Lucide React Native** 0.544.0 - Modern icon library
- **React Native Safe Area Context** 5.6.0 - Safe area handling

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
- **Magic Link**: Email-based passwordless login
- **Social Auth**: Apple ID and Google Sign-In (UI only)
- **Onboarding**: 3-slide introduction carousel

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
- **Account Management**: Personal information display
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

## 🚀 Backend Integration Guide

The app is designed for easy backend integration. Key integration points:

### Authentication
```typescript
// Replace in lib/store.ts - login function
const response = await fetch('/api/auth/magic-link', {
  method: 'POST',
  body: JSON.stringify({ email })
});
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
- **Logo Usage**: MITUGYM wordmark in green (#1e9b71)
- **Color Application**: Dark backgrounds with green accents
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
