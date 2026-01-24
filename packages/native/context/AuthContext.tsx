import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { Platform } from 'react-native';
import { saveToken, getToken, deleteToken } from '../lib/storage';
import { api, API_BASE_URL, UserProfile } from '../lib/api';

// Ensure auth session can complete on web
WebBrowser.maybeCompleteAuthSession();

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: UserProfile | null;
  error: string | null;
}

interface AuthContextType extends AuthState {
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    user: null,
    error: null,
  });

  const loadUser = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      const user = await api.getProfile();
      setState({
        isLoading: false,
        isAuthenticated: true,
        user,
        error: null,
      });
    } catch {
      // Token is invalid or expired
      await deleteToken();
      setState({
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: null,
      });
    }
  }, []);

  // Check for existing auth on mount
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Handle deep link auth callback
  useEffect(() => {
    const handleDeepLink = async ({ url }: { url: string }) => {
      if (!url) return;

      const { queryParams } = Linking.parse(url);

      if (queryParams?.error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: String(queryParams.error),
        }));
        return;
      }

      if (queryParams?.token) {
        setState((prev) => ({ ...prev, isLoading: true }));
        try {
          await saveToken(String(queryParams.token));
          const user = await api.getProfile();
          setState({
            isLoading: false,
            isAuthenticated: true,
            user,
            error: null,
          });
        } catch {
          await deleteToken();
          setState({
            isLoading: false,
            isAuthenticated: false,
            user: null,
            error: 'Failed to complete sign in',
          });
        }
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Handle app opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Generate the correct redirect URI for the current environment
      // - Expo Go: exp://127.0.0.1:8081/--/auth
      // - Dev build/standalone: artemis://auth
      const redirectUri = makeRedirectUri({ scheme: 'artemis', path: 'auth' });

      // Pass the redirect URI to the server so it knows where to redirect after OAuth
      const authUrl = `${API_BASE_URL}/auth/google?redirect_uri=${encodeURIComponent(redirectUri)}`;

      if (Platform.OS === 'web') {
        // For web, redirect directly
        window.location.href = authUrl;
      } else {
        // For mobile, use WebBrowser which handles the redirect back
        const result = await WebBrowser.openAuthSessionAsync(
          authUrl,
          redirectUri,
        );

        if (result.type === 'success' && result.url) {
          // WebBrowser intercepted the redirect - extract token from URL
          const { queryParams } = Linking.parse(result.url);

          if (queryParams?.error) {
            setState((prev) => ({
              ...prev,
              isLoading: false,
              error: String(queryParams.error),
            }));
            return;
          }

          if (queryParams?.token) {
            await saveToken(String(queryParams.token));
            const user = await api.getProfile();
            setState({
              isLoading: false,
              isAuthenticated: true,
              user,
              error: null,
            });
            return;
          }
        }

        if (result.type === 'cancel' || result.type === 'dismiss') {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      }
    } catch {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Failed to open sign in',
      }));
    }
  }, []);

  const signOut = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      // Try to call server logout (optional, mainly for cleanup)
      await api.logout().catch(() => {
        // Ignore server errors during logout
      });
    } finally {
      await deleteToken();
      setState({
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: null,
      });
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signInWithGoogle,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
