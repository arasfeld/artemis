# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Install dependencies (uses pnpm workspaces)
pnpm install

# Run all apps in development mode
turbo dev

# Run specific app
turbo dev --filter=@artemis/api
turbo dev --filter=@artemis/mobile

# Build all packages
turbo build

# Lint and type checking
turbo lint
turbo check-types
pnpm format              # Run prettier
```

### API Commands (apps/api)

```bash
# Database migrations (from apps/api directory or use full path)
pnpm --filter=@artemis/api db:migrate:up      # Run pending migrations
pnpm --filter=@artemis/api db:migrate:down    # Rollback last migration
pnpm --filter=@artemis/api db:migrate:fresh   # Reset and re-run all migrations

# Tests
pnpm --filter=@artemis/api test               # Run unit tests
pnpm --filter=@artemis/api test:watch         # Watch mode
pnpm --filter=@artemis/api test:e2e           # Run e2e tests
```

### Mobile Commands (apps/mobile)

```bash
pnpm --filter=@artemis/mobile ios     # Run on iOS simulator
pnpm --filter=@artemis/mobile android # Run on Android emulator
```

## Architecture Overview

### Monorepo Structure

This is a **Turborepo** monorepo using **pnpm workspaces**:

- **apps/api**: NestJS backend with PostgreSQL
- **apps/mobile**: React Native/Expo mobile app
- **apps/web**: Next.js web application
- **packages/config-eslint**: Shared ESLint configurations
- **packages/config-typescript**: Shared TypeScript configurations
- **packages/ui**: Shared React Native component library

### Backend (apps/api)

- **Framework**: NestJS with modular architecture
- **Database**: PostgreSQL via MikroORM
- **Auth**: JWT tokens with Google OAuth support via Passport

Key modules in `apps/api/src/modules/`:

- `auth/`: Google OAuth 2.0 + JWT authentication with Passport
- `profile/`: User profile CRUD, photo management, preferences
- `discover/`: Discovery feed with smart matching algorithm, swipe interactions, match detection
- `genders/`: Database-backed gender options (~30+ predefined)
- `relationship-types/`: Database-backed relationship type options
- `database/`: MikroORM config, entities, and migrations

Database entities:

- `User` - core user record with timestamps
- `UserProfile` - onboarding data (name, DOB, genders, seeking, photos, location, age preferences)
- `UserPhoto` - photos with display order (up to 6 per user)
- `Gender` - predefined gender options with display order
- `RelationshipType` - predefined relationship types
- `Interaction` - tracks swipes (LIKE, PASS, VIEW, FAVORITE, MESSAGE_REQUEST)
- `Match` - mutual matches between users (normalized: user1 < user2)
- `UserEmail`, `UserAuthentication` - OAuth provider linkages
- `Role`/`Permission` - RBAC support (not yet utilized)

### Mobile App (apps/mobile)

- **Framework**: React Native with Expo (SDK 54)
- **Navigation**: expo-router (file-based routing in `app/` directory)
- **State**: Redux Toolkit + RTK Query for API state management
- **Auth Flow**: Opens browser for Google OAuth, receives JWT via deep link callback

Key directories:

- `app/(auth)/` - Welcome screen, OAuth callback handling
- `app/(main)/(tabs)/` - Main tab navigation (Discover, Likes, Messages, Profile)
- `app/(main)/(onboarding)/` - 9-step onboarding flow
- `store/` - Redux store, slices, and RTK Query API definitions
- `components/` - Reusable UI components

Main features implemented:

- **Discover Tab**: Swipe cards with animated gestures, match modal, profile detail view
- **Onboarding Flow**: First name, DOB, gender identity, gender preferences, relationship types, age range, location (auto/manual), photo upload
- **Profile Tab**: Basic user info display, sign out

Placeholder screens (not implemented):

- **Likes Tab**: "See who likes you" UI only
- **Messages Tab**: "Your conversations" UI only

### Environment Variables

Copy `apps/api/.env.example` to `apps/api/.env` and configure:

- `POSTGRES_*` - Database connection
- `JWT_SECRET` / `JWT_EXPIRES_IN` - Token signing
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - OAuth credentials

## Current Development Status

### Implemented Features

- User authentication (Google OAuth)
- Complete onboarding flow
- Discover feed with smart matching
- Swipe interactions (like/pass)
- Match detection and notification
- Profile creation during onboarding

### Not Yet Implemented

- **Messaging**: No chat functionality between matches
- **View Likes**: Cannot see who has liked you
- **Profile Editing**: Cannot modify profile after onboarding
- **Photo Management**: No UI to delete/reorder photos post-onboarding
- **User Blocking/Reporting**: No safety features
- **Notifications**: No push notification system
- **Web App**: `apps/web` exists but is not implemented

## Code Style Guidelines

### Import Organization

Order imports in the following groups, separated by blank lines:

1. External packages (e.g., `react`, `expo-router`, `@nestjs/common`)
2. Internal modules using absolute imports with `@/` prefix (when alias is configured)
3. Relative imports for closely related files (e.g., `./utils`, `../components`)

Within each group:

- Alphabetize imports by module path
- Alphabetize destructured items within each import statement
- Remove unused imports

```typescript
// External packages
import { useCallback, useMemo, useState } from 'react';
import { Stack } from 'expo-router';

// Internal modules (absolute)
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

// Relative imports
import { Button } from './Button';
import { formatDate, formatName } from './utils';
```

### Alphabetization

When order doesn't affect functionality, alphabetize for easier scanning:

- Import statements and their destructured items
- Object keys and interface/type properties
- Component props (both definition and usage)
- Array items (when order is arbitrary)
- CSS/style properties
- Enum values

### React Performance

Use `useCallback` and `useMemo` appropriately:

- `useCallback` for functions passed as props or used in dependency arrays
- `useMemo` for expensive computations or objects/arrays used in dependency arrays
- Avoid premature optimization for simple values or rarely re-rendered components

### General Conventions

- Prefer named exports over default exports for better refactoring support
- Use descriptive variable names; avoid abbreviations unless widely understood
- Keep components and functions focused on a single responsibility
- Colocate related files (tests, styles, types) near their source files
