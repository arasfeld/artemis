import { Image, Modal, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Text, borderRadius, colors } from '@artemis/ui';
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
          colors={[colors.gradient.start, colors.gradient.end]}
          style={styles.container}
        >
          <Text color="light" style={styles.title} variant="title">
            It&apos;s a Match!
          </Text>
          <Text color="light" style={styles.subtitle} variant="subtitle">
            You and {matchedUser.firstName} liked each other
          </Text>

          {matchedUser.photo && (
            <Image
              source={{ uri: matchedUser.photo }}
              style={styles.photo}
            />
          )}

          <View style={styles.buttons}>
            <Button
              onPress={onSendMessage}
              style={styles.messageButton}
              variant="secondary"
            >
              Send Message
            </Button>
            <Button
              onPress={onClose}
              style={styles.keepSwipingButton}
              variant="primary"
            >
              Keep Swiping
            </Button>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  buttons: {
    gap: 12,
    paddingHorizontal: 40,
    width: '100%',
  },
  container: {
    alignItems: 'center',
    borderRadius: borderRadius.xl,
    marginHorizontal: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  keepSwipingButton: {
    width: '100%',
  },
  messageButton: {
    backgroundColor: 'transparent',
    borderColor: colors.white,
    width: '100%',
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: colors.background.overlay,
    flex: 1,
    justifyContent: 'center',
  },
  photo: {
    borderColor: colors.white,
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
