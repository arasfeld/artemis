import { useMemo } from 'react';
import { Image, Modal, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Text, useTheme, type Theme } from '@artemis/ui';

import type { MatchedUser } from '@/types/api';

interface MatchModalProps {
  matchedUser: MatchedUser | null;
  onClose: () => void;
  onSendMessage: () => void;
  visible: boolean;
}

export function MatchModal({
  matchedUser,
  onClose,
  onSendMessage,
  visible,
}: MatchModalProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (!matchedUser) return null;

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <LinearGradient
          colors={[theme.colors.muted, theme.colors.primary]}
          style={styles.container}
        >
          <Text style={styles.title} variant="title">
            It&apos;s a Match!
          </Text>
          <Text style={styles.subtitle} variant="subtitle">
            You and {matchedUser.firstName} liked each other
          </Text>

          {matchedUser.photo && (
            <Image source={{ uri: matchedUser.photo }} style={styles.photo} />
          )}

          <View style={styles.buttons}>
            <Button
              fullWidth
              onPress={onSendMessage}
              size="lg"
              variant="outline"
            >
              Send Message
            </Button>
            <Button fullWidth onPress={onClose} size="lg" variant="default">
              Keep Swiping
            </Button>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    buttons: {
      gap: 12,
      paddingHorizontal: 40,
      width: '100%',
    },
    container: {
      alignItems: 'center',
      borderRadius: theme.borderRadius.xl,
      marginHorizontal: 20,
      paddingBottom: 40,
      paddingHorizontal: 20,
      paddingTop: 60,
    },
    overlay: {
      alignItems: 'center',
      backgroundColor: theme.colors.overlay,
      flex: 1,
      justifyContent: 'center',
    },
    photo: {
      borderColor: theme.colors.white,
      borderRadius: 80,
      borderWidth: 4,
      height: 160,
      marginBottom: 30,
      width: 160,
    },
    subtitle: {
      marginBottom: 30,
      opacity: 0.9,
      textAlign: 'center',
    },
    title: {
      fontSize: 36,
      marginBottom: 8,
    },
  });
}
