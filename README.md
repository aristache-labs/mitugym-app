<div align="center">

<img src="showcase/logo.png" width="76" alt="MituGym">

# MituGym · Member App

<em>Ready for your workout?</em>

<br />

<a href="https://github.com/pateutz1/mitugym-app">MituGym · React Native &amp; Expo</a>

<br />

<img src="showcase/MituGym%20%C2%B7%20Prezentare%401x.png" width="100%" alt="MituGym member app: services, home dashboard, QR entry, membership and gym schedule">

<br />

![React Native](https://shields.io/badge/React_Native-0.81.5-76f5e1?style=flat-square&labelColor=0f6e68)
![Expo](https://shields.io/badge/Expo-54-76f5e1?style=flat-square&labelColor=0f6e68)
![Stars](https://shields.io/github/stars/pateutz1/mitugym-app?style=flat-square&labelColor=0f6e68&color=76f5e1)
![Contributors](https://shields.io/github/contributors/pateutz1/mitugym-app?style=flat-square&labelColor=0f6e68&color=76f5e1)
![License: MIT](https://shields.io/github/license/pateutz1/mitugym-app?style=flat-square&labelColor=0f6e68&color=76f5e1)
![Last commit](https://shields.io/github/last-commit/pateutz1/mitugym-app?style=flat-square&labelColor=0f6e68&color=76f5e1)
![Issues](https://shields.io/github/issues/pateutz1/mitugym-app?style=flat-square&labelColor=0f6e68&color=76f5e1)
![Watchers](https://shields.io/github/watchers/pateutz1/mitugym-app?style=flat-square&labelColor=0f6e68&color=76f5e1)

<strong>QR entry &middot; membership status &middot; personal training &middot; gym schedule &middot; live occupancy</strong><br>
<sub>iOS &amp; Android &middot; dark theme &middot; English / Romanian</sub>

<br />

[Stack](#stack) &middot; [The app](#the-app) &middot; [Local setup](#local-setup) &middot; [Admin panel](#admin-panel) &middot; [Deployment](#deployment)

<sub><b>AI agents / LLMs:</b> screens live in <code>app/</code>, shared state in <code>lib/store.ts</code>, and backend integrations in <code>utils/</code> and <code>supabase/functions/</code>.</sub>

</div>

---

## Overview

MituGym is a gym member app built with React Native, Expo, TypeScript, and Supabase. Members can access the gym with a rotating QR code, check their membership status and visit history, book personal training and massage sessions, and see the gym schedule and live occupancy. The app brings announcements, notifications, profile settings, and biometric sign-in into a dark interface with full English and Romanian support.

## Table of Contents

- [MituGym · Member App](#mitugym--member-app)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Stack](#stack)
  - [The app](#the-app)
  - [Architecture overview](#architecture-overview)
  - [Prerequisites](#prerequisites)
  - [Local setup](#local-setup)
    - [1. Clone and install](#1-clone-and-install)
    - [2. Environment variables](#2-environment-variables)
    - [3. Database setup](#3-database-setup)
    - [4. Backend integrations](#4-backend-integrations)
    - [5. Run the dev server](#5-run-the-dev-server)
  - [Commands](#commands)
  - [Admin panel](#admin-panel)
  - [Deployment](#deployment)
  - [Contributing](#contributing)
  - [Contributors](#contributors)
  - [License](#license)
  - [Support the project](#support-the-project)
  - [Connect](#connect)

---

## Stack

| Layer | Technology |
| ----- | ---------- |
| Framework | React Native 0.81.5, Expo SDK 54 |
| UI library | React 19.1 |
| Language | TypeScript 5.9 |
| Navigation | Expo Router 6, React Navigation 7 |
| Styling | NativeWind, Tailwind CSS, shared theme tokens, Inter |
| Animation | React Native Reanimated 4 |
| Icons | Lucide React Native, Expo Vector Icons |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth, Expo Local Authentication |
| File storage | Supabase Storage for profile avatars |
| Local storage | AsyncStorage, Expo SecureStore |
| QR access | OTPAuth, React Native QRCode SVG |
| Notifications | Expo Notifications, Supabase Edge Functions |
| State | Zustand |
| Package manager | npm |
| Tests | Jest, React Native Testing Library |
| Native builds | Expo native tooling, EAS |

---

## The app

MituGym uses a dark interface with turquoise accents. Members move between five main tabs:

1. **Home** - greeting, announcements, gym opening status, membership summary, visit stats, and live occupancy.
2. **QR Code** - gym entry code with TOTP rotation and a countdown until refresh.
3. **Services** - personal training packages and massage services, with booking details.
4. **Membership** - current plan, expiry date, remaining days, purchased services, and check-in history.
5. **Profile** - personal information, avatar, language, biometric authentication, notification preferences, and support.

Authentication screens cover registration, login, and password recovery. Members can switch between English and Romanian from their profile.

---

## Architecture overview

- **Routing** - `app/` contains Expo Router screens. Authentication lives in `app/(auth)/`, the main tabs in `app/(tabs)/`, and service details and session booking in separate routes.
- **State** - `lib/store.ts` coordinates member data, memberships, check-ins, services, bookings, notifications, and QR tokens through Zustand.
- **Backend** - `utils/supabase.ts` configures Supabase Auth and database access, with AsyncStorage on native devices and localStorage on web. Database permissions depend on the Supabase project's row-level security policies.
- **QR entry** - `utils/totp.ts` generates rotating codes. The store retrieves the member's TOTP secret from the separate gym backend using the configured API URL and key. Setup details live in [TOTP_SETUP_GUIDE.md](TOTP_SETUP_GUIDE.md).
- **Authentication** - `utils/authManager.ts` and `utils/useSupabaseAuth.ts` manage authentication state. `utils/secureStorage.ts` and `utils/biometricAuth.ts` support remembered credentials and biometric access.
- **Localization** - `lib/LanguageContext.tsx`, `lib/translations.ts`, and translation helpers provide English and Romanian copy with a persisted language preference.
- **Notifications** - `utils/pushNotifications.ts` handles device integration. Supabase Edge Functions send push notifications and reminder emails. See [PUSH_NOTIFICATIONS_COMPLETE.md](PUSH_NOTIFICATIONS_COMPLETE.md).
- **Look** - shared tokens live in `lib/theme.ts`; reusable UI lives in `components/`; fonts and app branding live in `assets/`.

---

## Prerequisites

- **Node.js and npm** compatible with the Expo SDK 54 dependencies in `package.json`.
- A **Supabase project** with the gym database, authentication, and required access policies configured.
- Access to the **gym backend API** for TOTP setup.
- **Android Studio** for local Android builds or **macOS with Xcode** for local iOS builds.
- A physical device and a development build for testing native features such as biometrics and push notifications.

---

## Local setup

### 1. Clone and install

```bash
git clone https://github.com/pateutz1/mitugym-app.git
cd mitugym-app
npm ci
```

### 2. Environment variables

Create `.env.local` in the project root:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your-supabase-anon-key
EXPO_PUBLIC_API_URL=https://your-gym-backend.example.com
EXPO_PUBLIC_API_KEY=your-gym-backend-client-key
```

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `EXPO_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_KEY` | Yes | Supabase public / anon key |
| `EXPO_PUBLIC_API_URL` | For TOTP | Gym backend URL used for member TOTP setup |
| `EXPO_PUBLIC_API_KEY` | For TOTP | Client key expected by the gym backend |

`EXPO_PUBLIC_*` values are included in the client bundle. Use client-appropriate keys; keep Supabase service-role credentials and email provider secrets in the backend environment. For a physical device, the local backend URL must be reachable from the device.

### 3. Database setup

Connect to a configured Supabase gym database. Installing dependencies does not create the schema, policies, triggers, or scheduled jobs, and this repository does not include a complete database migration set.

The app uses member profiles, membership plans, services, check-ins, announcements, scheduling, bookings, and notification data. Configure the corresponding tables and row-level security policies in your Supabase project before testing these flows.

Avatar storage setup is documented in [AVATAR_SETUP_INSTRUCTIONS.md](AVATAR_SETUP_INSTRUCTIONS.md), with supporting SQL in [supabase_avatar_storage_setup.sql](supabase_avatar_storage_setup.sql).

### 4. Backend integrations

Configure the separate gym backend for TOTP setup using [TOTP_SETUP_GUIDE.md](TOTP_SETUP_GUIDE.md). Registration setup behavior is documented in [TOTP_AUTO_SETUP_GUIDE.md](TOTP_AUTO_SETUP_GUIDE.md).

For notifications, deploy and configure the Supabase Edge Functions and database webhook using [PUSH_NOTIFICATIONS_DEPLOYMENT.md](PUSH_NOTIFICATIONS_DEPLOYMENT.md). Function source and deployment notes live in [supabase/functions](supabase/functions/README.md). Reminder emails also require a backend `RESEND_API_KEY`.

### 5. Run the dev server

```bash
npm start
```

Use the Expo development server to open the app on a connected device or simulator. To create and run a native build:

```bash
npm run android
# macOS with Xcode
npm run ios
```

For the web target:

```bash
npm run web
```

---

## Commands

| Command | Description |
| ------- | ----------- |
| `npm start` | Start the Expo development server |
| `npm run android` | Build and run the native Android app |
| `npm run ios` | Build and run the native iOS app on macOS |
| `npm run web` | Start Expo for web |
| `npm run typecheck` | Run TypeScript checking without emitting files |
| `npm run lint` | Run ESLint |
| `npm run format` | Format the repository with Prettier |
| `npm test` | Run Jest tests |
| `npm test -- --watch` | Run tests in watch mode |
| `npm test -- --coverage` | Generate test coverage |

The `build` script currently points to `expo build`. For release builds, use the EAS workflow described below.

---

## Admin panel

The gym administration panel is a separate backend application. This repository contains the member app and Supabase Edge Functions.

- The mobile app reads membership, service, schedule, announcement, and check-in data from the configured backend.
- TOTP initialization calls the backend's `/api/member/totp-setup/:memberId` endpoint.
- Staff-side QR validation and administration must be configured in the gym backend.
- Notification delivery requires the Supabase function and database webhook configuration.

See [TOTP_SETUP_GUIDE.md](TOTP_SETUP_GUIDE.md) and [supabase/functions/README.md](supabase/functions/README.md) for integration details.

---

## Deployment

Native app identifiers, branding, plugins, and the EAS project ID are configured in [app.config.ts](app.config.ts).

1. Set the production Supabase and gym API environment variables in your build environment.
2. Verify the iOS bundle identifier, Android package name, and EAS project ownership in `app.config.ts`.
3. Configure EAS build profiles for your account and project:

   ```bash
   npx eas-cli build:configure
   ```

4. Build the app:

   ```bash
   npx eas-cli build --platform android
   npx eas-cli build --platform ios
   ```

5. Test authentication, QR rotation, membership data, service booking, and notifications on physical devices before store submission.
6. Submit the release builds:

   ```bash
   npx eas-cli submit --platform android
   npx eas-cli submit --platform ios
   ```

Deploy Supabase Edge Functions separately following [PUSH_NOTIFICATIONS_DEPLOYMENT.md](PUSH_NOTIFICATIONS_DEPLOYMENT.md). Store credentials and signing setup are required for publication.

---

## Contributing

Contributions are welcome. Fork, create a branch, and open a PR. Describe the change and include screenshots for UI updates. Bugs and ideas go to [Issues][issues].

Run `npm run typecheck`, `npm run lint`, and the relevant Jest tests before opening a PR. Document any backend configuration required by the change.

## Contributors

Thanks to everyone who has contributed to MituGym.

<a href="https://github.com/pateutz1/mitugym-app/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=pateutz1/mitugym-app" alt="Contributors" />
</a>

## License

Licensed under the **MIT** license. See [LICENSE](LICENSE).

## Support the project

Star the [repository][repo], report bugs, suggest improvements, or contribute a pull request.

## Connect

<div align="center">

**Adrian Cristache** · [aristache.dev](https://www.aristache.dev)

<a href="https://github.com/aristache-labs"><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" /></a>
<a href="https://www.aristache.dev"><img src="https://img.shields.io/badge/Site-0f6e68?style=for-the-badge&logo=googlechrome&logoColor=white" alt="aristache.dev" /></a>

</div>

[repo]: https://github.com/pateutz1/mitugym-app
[issues]: https://github.com/pateutz1/mitugym-app/issues
[pulls]: https://github.com/pateutz1/mitugym-app/pulls
[contributors]: https://github.com/pateutz1/mitugym-app/graphs/contributors
[license]: https://github.com/pateutz1/mitugym-app/blob/HEAD/LICENSE
