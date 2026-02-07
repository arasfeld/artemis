import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, useTheme, type Theme } from '@artemis/ui';

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
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const content = (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {showChevron && (
          <Ionicons
            color={theme.colors.mutedForeground}
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

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      borderBottomColor: theme.colors.border,
      borderBottomWidth: 1,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    content: {
      marginTop: theme.spacing.xs,
    },
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    pressed: {
      backgroundColor: theme.colors.card,
    },
    title: {
      color: theme.colors.foreground,
      fontSize: 16,
      fontWeight: '600',
    },
  });
}
