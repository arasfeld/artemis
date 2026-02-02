import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { makeRedirectUri } from 'expo-auth-session';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { saveToken, deleteToken, getToken } from '@/lib/storage';
import { API_BASE_URL } from '@/lib/api-config';
import { apiSlice } from '../api/apiSlice';
import type { AppDispatch, RootState } from '../index';

// Ensure auth session can complete on web
WebBrowser.maybeCompleteAuthSession();

interface AuthState {
  isInitialized: boolean;
  isAuthenticating: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isInitialized: false,
  isAuthenticating: false,
  error: null,
};

// Thunk: Initialize auth (check for existing token)
export const initializeAuth = createAsyncThunk<
  boolean,
  void,
  { dispatch: AppDispatch }
>('auth/initialize', async (_, { dispatch }) => {
  const token = await getToken();
  if (token) {
    await dispatch(apiSlice.endpoints.getAuthProfile.initiate());
    return true;
  }
  return false;
});

// Thunk: Sign in with Google OAuth
export const signInWithGoogle = createAsyncThunk<
  void,
  void,
  { rejectValue: string; dispatch: AppDispatch }
>('auth/signInWithGoogle', async (_, { dispatch, rejectWithValue }) => {
  const redirectUri = makeRedirectUri({ scheme: 'artemis', path: 'auth' });
  const authUrl = `${API_BASE_URL}/auth/google?redirect_uri=${encodeURIComponent(redirectUri)}`;

  if (Platform.OS === 'web') {
    window.location.href = authUrl;
    return;
  }

  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

  if (result.type === 'success' && result.url) {
    const { queryParams } = Linking.parse(result.url);

    if (queryParams?.error) {
      return rejectWithValue(String(queryParams.error));
    }

    if (queryParams?.token) {
      await saveToken(String(queryParams.token));
      await dispatch(apiSlice.endpoints.getAuthProfile.initiate());
      return;
    }
  }

  if (result.type === 'cancel' || result.type === 'dismiss') {
    return rejectWithValue('Sign in cancelled');
  }
});

// Thunk: Handle deep link token (for when app is opened via link)
export const handleDeepLinkToken = createAsyncThunk<
  void,
  string,
  { rejectValue: string; dispatch: AppDispatch }
>('auth/handleDeepLinkToken', async (token, { dispatch, rejectWithValue }) => {
  try {
    await saveToken(token);
    await dispatch(apiSlice.endpoints.getAuthProfile.initiate());
  } catch {
    await deleteToken();
    return rejectWithValue('Failed to complete sign in');
  }
});

// Thunk: Sign out
export const signOut = createAsyncThunk<void, void, { dispatch: AppDispatch }>(
  'auth/signOut',
  async (_, { dispatch }) => {
    try {
      await dispatch(apiSlice.endpoints.logout.initiate()).unwrap();
    } catch {
      // Ignore server errors during logout
    }
    await deleteToken();
    dispatch(apiSlice.util.resetApiState());
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setAuthError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize
      .addCase(initializeAuth.pending, (state) => {
        state.isInitialized = false;
      })
      .addCase(initializeAuth.fulfilled, (state) => {
        state.isInitialized = true;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isInitialized = true;
      })
      // Sign in with Google
      .addCase(signInWithGoogle.pending, (state) => {
        state.isAuthenticating = true;
        state.error = null;
      })
      .addCase(signInWithGoogle.fulfilled, (state) => {
        state.isAuthenticating = false;
      })
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.isAuthenticating = false;
        if (action.payload && action.payload !== 'Sign in cancelled') {
          state.error = action.payload;
        }
      })
      // Handle deep link token
      .addCase(handleDeepLinkToken.pending, (state) => {
        state.isAuthenticating = true;
      })
      .addCase(handleDeepLinkToken.fulfilled, (state) => {
        state.isAuthenticating = false;
      })
      .addCase(handleDeepLinkToken.rejected, (state, action) => {
        state.isAuthenticating = false;
        state.error = action.payload || 'Authentication failed';
      })
      // Sign out
      .addCase(signOut.fulfilled, (state) => {
        state.error = null;
      });
  },
});

export const { clearError, setAuthError } = authSlice.actions;

// Selectors
export const selectAuthState = (state: RootState) => state.auth;
export const selectIsInitialized = (state: RootState) =>
  state.auth.isInitialized;
export const selectIsAuthenticating = (state: RootState) =>
  state.auth.isAuthenticating;
export const selectAuthError = (state: RootState) => state.auth.error;

export default authSlice.reducer;
