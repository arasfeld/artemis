import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, Text } from '@artemis/ui';

interface ProfileSectionProps {
  children: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  title: string;
}

export function ProfileSection({
  children,
  onPress,
  showChevron = true,
  title,
}: ProfileSectionProps) {
  const content = (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {showChevron && (
          <Ionicons
            color={colors.text.muted}
            name="chevron-forward"
            size={20}
          />
        )}
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderBottomColor: colors.border.light,
    borderBottomWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  content: {
    marginTop: spacing.xs,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pressed: {
    backgroundColor: colors.background.card,
  },
  title: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
