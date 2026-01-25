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
- **packages/ui**: Shared React Native component library (built with tsup)
- **packages/eslint-config**: Shared ESLint configurations
- **packages/typescript-config**: Shared TypeScript configurations

### Backend (apps/api)

- **Framework**: NestJS with modular architecture
- **Database**: PostgreSQL via MikroORM
- **Auth**: JWT tokens with Google OAuth support via Passport

Key modules in `apps/api/src/modules/`:

- `database/`: MikroORM config, entities, and migrations
- `auth/`: Authentication with Google OAuth strategy and JWT

Database entities follow a user-centric model:

- `User` - core user record with roles/permissions
- `UserSecrets` - sensitive auth data (password hashes, tokens)
- `UserEmail` - user email addresses
- `UserAuthentication` - OAuth provider linkages
- `Role`/`Permission` - RBAC support

### Mobile App (apps/mobile)

- **Framework**: React Native with Expo (SDK 52)
- **Navigation**: expo-router (file-based routing in `app/` directory)
- **Auth Flow**: Opens browser for Google OAuth, receives JWT via deep link callback

Key files:

- `app/_layout.tsx` - Root layout with AuthProvider
- `context/AuthContext.tsx` - Auth state management
- `lib/api.ts` - API client with JWT handling
- `lib/storage.ts` - Secure token storage

### Environment Variables

Copy `apps/api/.env.example` to `apps/api/.env` and configure:

- `POSTGRES_*` - Database connection
- `JWT_SECRET` / `JWT_EXPIRES_IN` - Token signing
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - OAuth credentials
