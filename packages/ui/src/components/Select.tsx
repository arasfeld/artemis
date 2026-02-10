import React, { useMemo, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Text } from './Text';
import type { Theme } from '../theme/ThemeContext';
import { useTheme } from '../theme/ThemeContext';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  style?: ViewStyle;
}

export function Select({
  label,
  placeholder = 'Select an option',
  options,
  value,
  onChange,
  style,
}: SelectProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <View style={style}>
      {label && (
        <Text variant="label" style={styles.label}>
          {label}
        </Text>
      )}

      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.triggerText,
            !selectedOption && styles.placeholderText,
          ]}
        >
          {selectedOption?.label || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={theme.colors.mutedForeground} />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Select'}</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Ionicons name="close" size={24} color={theme.colors.foreground} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item.value === value && styles.optionSelected,
                  ]}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item.value === value && styles.optionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.value === value && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={theme.colors.primary}
                    />
                  )}
                </TouchableOpacity>
              )}
              style={styles.optionList}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    label: {
      marginBottom: theme.spacing.sm,
    },
    modalContent: {
      backgroundColor: theme.colors.card,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      maxHeight: '70%',
    },
    modalHeader: {
      alignItems: 'center',
      borderBottomColor: theme.colors.border,
      borderBottomWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: theme.spacing.lg,
    },
    modalTitle: {
      color: theme.colors.foreground,
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
    },
    option: {
      alignItems: 'center',
      borderBottomColor: theme.colors.border,
      borderBottomWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: theme.spacing.lg,
    },
    optionList: {
      paddingBottom: theme.spacing.xl,
    },
    optionSelected: {
      backgroundColor: theme.colors.accent,
    },
    optionText: {
      color: theme.colors.foreground,
      fontSize: theme.typography.fontSize.base,
    },
    optionTextSelected: {
      color: theme.colors.primary,
      fontWeight: theme.typography.fontWeight.semibold,
    },
    overlay: {
      backgroundColor: theme.colors.overlay,
      flex: 1,
      justifyContent: 'flex-end',
    },
    placeholderText: {
      color: theme.colors.mutedForeground,
    },
    trigger: {
      alignItems: 'center',
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.lg,
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: theme.spacing.md,
      ...theme.shadow.sm,
    },
    triggerText: {
      color: theme.colors.foreground,
      flex: 1,
      fontSize: theme.typography.fontSize.base,
    },
  });
}
