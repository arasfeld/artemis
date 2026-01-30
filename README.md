# Artemis

A full-stack mobile application built with a Turborepo monorepo, featuring a React Native mobile app with Expo and a NestJS backend API.

## Architecture

This monorepo includes:

### Apps
- `apps/api`: NestJS backend server with PostgreSQL and JWT authentication
- `apps/mobile`: React Native app built with Expo Router and TypeScript

### Packages
- `@artemis/ui`: Shared React Native component library
- `@artemis/eslint-config`: Shared ESLint configurations
- `@artemis/typescript-config`: Shared TypeScript configurations

## Quick Start

### Prerequisites

- **Node.js 18+** and **pnpm** (see `packageManager` in package.json)
- **PostgreSQL** running locally (or via Docker)
- **Expo Go** app installed on your phone (for physical device testing)
- **Google Cloud Console** access (for OAuth credentials)

### For Simulators/Emulators Only

If you're only using iOS Simulator or Android Emulator:

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment files
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your database and Google OAuth credentials

# 3. Run database migrations
pnpm --filter=@artemis/api db:migrate:up

# 4. Start development
pnpm dev
```

### For Expo Go on Physical Device

If you want to test on a real phone with Expo Go:

```bash
# 1. Install dependencies
pnpm install

# 2. Install localtunnel globally
npm install -g localtunnel

# 3. Set up environment files
cp apps/api/.env.example apps/api/.env
cp apps/mobile/.env.example apps/mobile/.env

# 4. Configure Google OAuth (see Google OAuth Setup section)

# 5. Run database migrations
pnpm --filter=@artemis/api db:migrate:up

# 6. Start the tunnel (Terminal 1)
lt --port 4000 --subdomain artemis-dev

# 7. Update apps/api/.env with the tunnel URL for GOOGLE_CALLBACK_URL
#    (e.g., https://artemis-dev.loca.lt/auth/google/callback)

# 8. Update apps/mobile/.env with the tunnel URL for EXPO_PUBLIC_API_URL
#    (e.g., EXPO_PUBLIC_API_URL=https://artemis-dev.loca.lt)

# 9. Start the API server (Terminal 2)
pnpm dev:api

# 10. Start the mobile app (Terminal 3)
pnpm dev:mobile
```

## Development

### Running Commands

```bash
# Install dependencies
pnpm install

# Start all apps in development mode
pnpm dev

# Start specific apps
pnpm dev:api      # Start only the API server
pnpm dev:mobile   # Start only the mobile app

# Build all apps
pnpm build

# Run linting
pnpm lint

# Run type checking
pnpm check-types

# Clean all build artifacts
pnpm clean
```

### Database Management

```bash
# Run migrations
pnpm --filter=@artemis/api db:migrate:up

# Rollback migrations
pnpm --filter=@artemis/api db:migrate:down

# Reset database (drop and recreate)
pnpm --filter=@artemis/api db:migrate:fresh
```

## Google OAuth Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the "Google+ API" (or "Google Identity")

### 2. Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Select **Web application** as the application type
4. Configure the following:

**Authorized JavaScript origins:**
```
http://localhost:4000
https://artemis-dev.loca.lt
```

**Authorized redirect URIs:**
```
http://localhost:4000/auth/google/callback
https://artemis-dev.loca.lt/auth/google/callback
```

5. Copy the **Client ID** and **Client Secret**

### 3. Configure Environment Variables

Update `apps/api/.env`:

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# For physical device testing, use tunnel URL:
GOOGLE_CALLBACK_URL=https://artemis-dev.loca.lt/auth/google/callback

# For simulator-only testing:
# GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback
```

## Tunneling for Expo Go

### Installing Localtunnel

First, install localtunnel globally:

```bash
npm install -g localtunnel
```

### Starting the Tunnel

```bash
# Start a tunnel with a custom subdomain (if available)
lt --port 4000 --subdomain artemis-dev

# Or let localtunnel assign a random subdomain
lt --port 4000
```

The tunnel will output a public HTTPS URL (e.g., `https://artemis-dev.loca.lt`).

### Manual Configuration

After starting the tunnel, you need to manually update your environment files:

1. **Update `apps/api/.env`:**
   ```bash
   GOOGLE_CALLBACK_URL=https://your-tunnel-url.loca.lt/auth/google/callback
   ```

2. **Update `apps/mobile/.env`:**
   ```bash
   EXPO_PUBLIC_API_URL=https://your-tunnel-url.loca.lt
   ```

3. **Update Google Cloud Console:**
   - Add the callback URL to Authorized redirect URIs
   - Wait a few minutes for changes to propagate

### Subdomain Availability

The subdomain `artemis-dev` is **not guaranteed** to be available. If it's taken:

1. A random subdomain will be assigned
2. Use the assigned URL in your environment files
3. Update Google Cloud Console with the new callback URL

### Tips

- Keep the tunnel running in a separate terminal
- Press Ctrl+C to stop the tunnel
- Restart the tunnel if connection drops
- Use `--print-requests` flag to debug incoming requests

## Environment Variables

### API Server (`apps/api/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `4000` |
| `POSTGRES_*` | Database connection | See `.env.example` |
| `JWT_SECRET` | Token signing secret | Generate with `openssl rand -base64 32` |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
| `GOOGLE_CLIENT_ID` | OAuth client ID | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret | `GOCSPX-xxx` |
| `GOOGLE_CALLBACK_URL` | OAuth callback URL | `https://artemis-dev.loca.lt/auth/google/callback` |

### Mobile App (`apps/mobile/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `EXPO_PUBLIC_API_URL` | API base URL | `https://artemis-dev.loca.lt` |

**Note:** Variables must be prefixed with `EXPO_PUBLIC_` to be available in the client bundle.

## Troubleshooting

### "Network request failed" in Expo Go

**Cause:** The phone can't reach the API server.

**Solutions:**
1. Ensure the tunnel is running
2. Check that `EXPO_PUBLIC_API_URL` in `apps/mobile/.env` matches the tunnel URL
3. Restart the Expo development server after changing `.env`

### OAuth redirect fails with "Invalid redirect URI"

**Cause:** The callback URL doesn't match Google's configuration.

**Solutions:**
1. Verify `GOOGLE_CALLBACK_URL` in `apps/api/.env` matches your tunnel URL
2. Add the exact callback URL to Google Cloud Console → Authorized redirect URIs
3. Wait a few minutes for Google's configuration to propagate

### "Tunnel URL changed" after restart

**Cause:** Localtunnel assigns random subdomains when the requested one is unavailable.

**Solutions:**
1. Update `GOOGLE_CALLBACK_URL` in `apps/api/.env`
2. Add the new callback URL to Google Cloud Console
3. Update `EXPO_PUBLIC_API_URL` in `apps/mobile/.env`

### OAuth works but token isn't received

**Cause:** Deep link isn't triggering the app.

**Solutions:**
1. Ensure `artemis://` scheme is configured in `app.json`
2. On iOS, you may need to restart Expo Go
3. Check the auth controller's allowed redirect patterns

### Tunnel connection drops frequently

**Cause:** Localtunnel free tier has occasional reliability issues.

**Solutions:**
1. Restart the tunnel
2. Consider using [ngrok](https://ngrok.com/) for more stability (free tier has random URLs)
3. For production-like testing, use EAS development builds

## Production Considerations

For production or more stable development:

### Option 1: EAS Development Builds

Instead of Expo Go, create a [development build](https://docs.expo.dev/develop/development-builds/introduction/):

```bash
# Install EAS CLI
npm install -g eas-cli

# Create development build
eas build --profile development --platform ios
```

Benefits:
- No tunneling needed (can use direct server URLs)
- Custom native code support
- More production-like behavior

### Option 2: ngrok with Paid Tier

For stable subdomains without the localtunnel variability:

```bash
# Install ngrok
brew install ngrok

# Authenticate (requires free account)
ngrok config add-authtoken YOUR_TOKEN

# For paid tier, reserve a subdomain
ngrok http 4000 --subdomain=artemis-dev
```

### Option 3: Cloudflare Tunnel

If you have a Cloudflare account and domain:

```bash
# Install cloudflared
brew install cloudflared

# Create tunnel (one-time setup)
cloudflared tunnel create artemis-dev

# Run tunnel
cloudflared tunnel run artemis-dev
```

Benefits:
- Stable URL tied to your domain
- No random subdomain issues
- Free for development use

## Useful Links

Learn more about the technologies used:

- [Expo Documentation](https://docs.expo.dev/)
- [NestJS Documentation](https://nestjs.com/)
- [React Native Documentation](https://reactnative.dev/)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction)
