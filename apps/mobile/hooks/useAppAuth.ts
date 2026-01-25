import { useEffect, useCallback } from 'react';
import * as Linking from 'expo-linking';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { apiSlice } from '../store/api/apiSlice';
import {
  initializeAuth,
  signInWithGoogle as signInWithGoogleThunk,
  signOut as signOutThunk,
  handleDeepLinkToken,
  clearError,
  setAuthError,
  selectAuthState,
} from '../store/slices/authSlice';
import type { UserProfile } from '../lib/api';

// Create selector outside component to avoid recreation
const selectAuthProfile = apiSlice.endpoints.getAuthProfile.select(undefined);

export function useAppAuth() {
  const dispatch = useAppDispatch();
  const authState = useAppSelector(selectAuthState);

  // Get cached user data from RTK Query
  const profileResult = useAppSelector(selectAuthProfile);
  const user: UserProfile | null = profileResult?.data ?? null;
  const isProfileLoading = profileResult?.isLoading ?? false;

  // Initialize auth on mount
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  // Handle deep links
  useEffect(() => {
    const handleDeepLink = ({ url }: { url: string }) => {
      if (!url) return;
      const { queryParams } = Linking.parse(url);

      if (queryParams?.error) {
        dispatch(setAuthError(String(queryParams.error)));
        return;
      }

      if (queryParams?.token) {
        dispatch(handleDeepLinkToken(String(queryParams.token)));
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
  }, [dispatch]);

  const signInWithGoogle = useCallback(() => {
    dispatch(signInWithGoogleThunk());
  }, [dispatch]);

  const signOut = useCallback(() => {
    dispatch(signOutThunk());
  }, [dispatch]);

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Combined loading state
  const isLoading =
    !authState.isInitialized || authState.isAuthenticating || isProfileLoading;
  const isAuthenticated = !!user;

  return {
    // State
    isLoading,
    isAuthenticated,
    user,
    error: authState.error,

    // Actions
    signInWithGoogle,
    signOut,
    clearError: handleClearError,
  };
}
