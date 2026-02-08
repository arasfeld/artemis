import { Image } from 'expo-image';
import { useEffect, useMemo } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, useTheme, type Theme } from '@artemis/ui';
import { GoogleLoginButton } from '@/components/GoogleLoginButton';
import { useAppAuth } from '@/hooks/useAppAuth';
import { useOnboardingFlow } from '@/hooks/useOnboardingFlow';

export default function SignInScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { clearError, error, isLoading, isAuthenticated, signInWithGoogle } =
    useAppAuth();
  const { navigate, destination } = useOnboardingFlow();

  // Redirect authenticated users to the appropriate screen
  useEffect(() => {
    if (isAuthenticated) {
      navigate();
    }
  }, [isAuthenticated, navigate, destination]);

  // Show error alerts
  useEffect(() => {
    if (error) {
      Alert.alert('Sign In Error', error, [
        { text: 'OK', onPress: clearError },
      ]);
    }
  }, [clearError, error]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          contentFit="contain"
          source={require('@/assets/images/sign-in-hero.png')}
          style={styles.heroImage}
        />
        <Text variant="title" center>
          Artemis
        </Text>
        <Text variant="subtitle" center>
          Dating for Animal Lovers
        </Text>
      </View>

      <GoogleLoginButton
        disabled={isLoading}
        loading={isLoading}
        onPress={signInWithGoogle}
      />
    </SafeAreaView>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.md,
    },
    content: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
    },
    heroImage: {
      alignSelf: 'center',
      height: 360,
      width: '100%',
    },
  });
}
