# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Artemis is a dating platform for animal lovers. It's a pnpm monorepo with two packages:

- **packages/native** - Expo/React Native mobile app (iOS, Android, Web)
- **packages/server** - NestJS backend API with PostgreSQL

## Common Commands

### Development

```bash
# Start services
docker compose up -d              # Start PostgreSQL
pnpm server start:dev             # Start backend with hot reload
pnpm native start                 # Start Expo dev server

# Run on specific platform
pnpm native ios                   # iOS simulator
pnpm native android               # Android emulator
pnpm native web                   # Web browser
```

### Testing

```bash
pnpm server test                  # Run server unit tests
pnpm server test:watch            # Unit tests in watch mode
pnpm server test:e2e              # End-to-end tests
pnpm native test                  # Run native app tests
```

### Database

```bash
pnpm server db:migrate:up         # Apply pending migrations
pnpm server db:migrate:down       # Rollback last migration
pnpm server db:migrate:fresh      # Reset DB and reapply all migrations
```

### Code Quality

```bash
pnpm lint                         # ESLint across workspace
pnpm format                       # Prettier formatting
```

## Architecture

### Backend (NestJS)

- **Modular architecture** in `packages/server/src/modules/`
- **MikroORM** for database with entities in `modules/database/entities/`
- **Migrations** in `modules/database/migrations/` (transactional)
- **Two-strategy authentication**:
  - Google OAuth for initial login → redirects to `artemis://auth?token={JWT}`
  - JWT Bearer tokens for API calls

### Mobile App (Expo)

- **File-based routing** via Expo Router in `packages/native/app/`
- **Deep linking** scheme: `artemis://`
- Auth flow: Opens browser for OAuth → captures token via deep link

### Key Entities

User-centric schema with:

- User → UserEmail (1:N, one primary)
- User → UserAuthentication (1:N, OAuth providers)
- User → UserSecrets (1:1, hidden)
- User ↔ Role, Permission (M:N)

## Environment Setup

Copy `.env.example` to `.env` and configure:

- PostgreSQL connection (default port 5432)
- JWT_SECRET for token signing
- Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
