import React, { useMemo } from 'react';
import {
  Text,
  View,
  StyleSheet,
  type ViewProps,
  type ViewStyle,
  type TextProps,
  type TextStyle,
} from 'react-native';

import { Label } from './Label';
import { Separator } from './Separator';
import type { Theme } from '../theme/ThemeContext';
import { useTheme } from '../theme/ThemeContext';

type Orientation = 'horizontal' | 'vertical';

export interface FieldErrorItem {
  message?: string;
}

// FieldSet - container for multiple fields
interface FieldSetProps extends ViewProps {
  style?: ViewStyle;
}

export function FieldSet({ children, style, ...props }: FieldSetProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createFieldSetStyles(theme), [theme]);

  return (
    <View style={[styles.fieldSet, style]} {...props}>
      {children}
    </View>
  );
}

// FieldLegend - section legend/label
interface FieldLegendProps extends TextProps {
  style?: TextStyle;
  variant?: 'legend' | 'label';
}

export function FieldLegend({
  children,
  style,
  variant = 'legend',
  ...props
}: FieldLegendProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createFieldLegendStyles(theme), [theme]);

  return (
    <Text
      style={[
        styles.legend,
        variant === 'label' ? styles.labelVariant : styles.legendVariant,
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

// FieldGroup - groups fields with spacing
interface FieldGroupProps extends ViewProps {
  style?: ViewStyle;
}

export function FieldGroup({ children, style, ...props }: FieldGroupProps) {
  return (
    <View style={[fieldGroupStyles.fieldGroup, style]} {...props}>
      {children}
    </View>
  );
}

// Field - single field container with orientation
interface FieldProps extends ViewProps {
  invalid?: boolean;
  orientation?: Orientation;
  style?: ViewStyle;
}

export function Field({
  children,
  invalid = false,
  orientation = 'vertical',
  style,
  ...props
}: FieldProps) {
  const { theme } = useTheme();
  const styles = useMemo(
    () => createFieldStyles(theme, invalid, orientation),
    [theme, invalid, orientation]
  );

  return (
    <View accessibilityRole="none" style={[styles.field, style]} {...props}>
      {children}
    </View>
  );
}

// FieldContent - wraps input/content area
interface FieldContentProps extends ViewProps {
  style?: ViewStyle;
}

export function FieldContent({ children, style, ...props }: FieldContentProps) {
  return (
    <View style={[fieldContentStyles.fieldContent, style]} {...props}>
      {children}
    </View>
  );
}

// FieldLabel - label for a field (uses Label)
type FieldLabelProps = React.ComponentProps<typeof Label>;

export function FieldLabel({ children, style, ...props }: FieldLabelProps) {
  return (
    <Label style={[fieldLabelStyles.fieldLabel, style]} {...props}>
      {children}
    </Label>
  );
}

// FieldTitle - simpler title for field groups
interface FieldTitleProps extends ViewProps {
  style?: ViewStyle;
}

export function FieldTitle({ children, style, ...props }: FieldTitleProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createFieldTitleStyles(theme), [theme]);

  return (
    <View style={[styles.fieldTitle, style]} {...props}>
      {children}
    </View>
  );
}

// FieldDescription - helper text
interface FieldDescriptionProps extends TextProps {
  style?: TextStyle;
}

export function FieldDescription({
  children,
  style,
  ...props
}: FieldDescriptionProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createFieldDescriptionStyles(theme), [theme]);

  return (
    <Text style={[styles.fieldDescription, style]} {...props}>
      {children}
    </Text>
  );
}

// FieldSeparator - line with optional centered text
interface FieldSeparatorProps extends ViewProps {
  children?: React.ReactNode;
  style?: ViewStyle;
}

export function FieldSeparator({
  children,
  style,
  ...props
}: FieldSeparatorProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createFieldSeparatorStyles(theme), [theme]);

  return (
    <View style={[styles.fieldSeparator, style]} {...props}>
      <View style={styles.separatorLineWrapper}>
        <Separator style={styles.separatorLine} />
      </View>
      {children ? (
        <View style={styles.separatorContent}>
          <Text style={styles.separatorText}>{children}</Text>
        </View>
      ) : null}
    </View>
  );
}

// FieldError - error message(s)
interface FieldErrorProps extends ViewProps {
  children?: React.ReactNode;
  errors?: FieldErrorItem[];
  style?: ViewStyle;
}

export function FieldError({
  children,
  errors,
  style,
  ...props
}: FieldErrorProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createFieldErrorStyles(theme), [theme]);

  const resolved = useMemo(() => {
    if (children) return { type: 'children' as const, value: children };
    if (!errors?.length) return { type: 'empty' as const };

    const uniqueErrors = [
      ...new Map(
        errors.filter(Boolean).map((error) => [error?.message ?? '', error])
      ).values(),
    ].filter((e) => e?.message) as FieldErrorItem[];

    if (uniqueErrors.length === 1) {
      return { type: 'single' as const, value: uniqueErrors[0]?.message ?? '' };
    }
    return { type: 'multiple' as const, value: uniqueErrors };
  }, [children, errors]);

  if (resolved.type === 'empty') return null;

  return (
    <View
      accessibilityRole="alert"
      style={[styles.fieldError, style]}
      {...props}
    >
      {resolved.type === 'children' && resolved.value}
      {resolved.type === 'single' && (
        <Text style={styles.errorText}>{resolved.value}</Text>
      )}
      {resolved.type === 'multiple' && (
        <>
          {resolved.value.map(
            (error, index) =>
              error?.message && (
                <Text key={index} style={styles.errorItem}>
                  • {error.message}
                </Text>
              )
          )}
        </>
      )}
    </View>
  );
}

function createFieldSetStyles(theme: Theme) {
  return StyleSheet.create({
    fieldSet: {
      flexDirection: 'column',
      gap: theme.spacing.md,
      width: '100%',
    },
  });
}

function createFieldLegendStyles(theme: Theme) {
  const { colors, typography } = theme;
  return StyleSheet.create({
    labelVariant: {
      fontSize: typography.fontSize.sm,
    },
    legend: {
      color: colors.foreground,
      fontWeight: typography.fontWeight.medium,
      marginBottom: 6,
    },
    legendVariant: {
      fontSize: typography.fontSize.base,
    },
  });
}

const fieldGroupStyles = StyleSheet.create({
  fieldGroup: {
    flexDirection: 'column',
    gap: 20,
    width: '100%',
  },
});

function createFieldStyles(
  theme: Theme,
  _invalid: boolean,
  orientation: Orientation
) {
  return StyleSheet.create({
    field: {
      flexDirection: orientation === 'horizontal' ? 'row' : 'column',
      gap: theme.spacing.sm,
      width: '100%',
      ...(orientation === 'horizontal' && {
        alignItems: 'center',
      }),
    },
  });
}

const fieldContentStyles = StyleSheet.create({
  fieldContent: {
    flex: 1,
    flexDirection: 'column',
    gap: 2,
    minWidth: 0,
  },
});

const fieldLabelStyles = StyleSheet.create({
  fieldLabel: {
    width: '100%',
  },
});

function createFieldTitleStyles(theme: Theme) {
  return StyleSheet.create({
    fieldTitle: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      width: '100%',
    },
  });
}

function createFieldDescriptionStyles(theme: Theme) {
  const { colors, typography } = theme;
  return StyleSheet.create({
    fieldDescription: {
      color: colors.mutedForeground,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.normal,
      lineHeight: typography.fontSize.sm * 1.5,
      textAlign: 'left',
    },
  });
}

function createFieldSeparatorStyles(theme: Theme) {
  const { colors } = theme;
  return StyleSheet.create({
    fieldSeparator: {
      height: 20,
      justifyContent: 'center',
      marginVertical: -theme.spacing.sm,
    },
    separatorContent: {
      alignSelf: 'center',
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.sm,
      position: 'absolute',
    },
    separatorLine: {
      width: '100%',
    },
    separatorLineWrapper: {
      left: 0,
      position: 'absolute',
      right: 0,
      top: 10,
    },
    separatorText: {
      color: colors.mutedForeground,
      fontSize: theme.typography.fontSize.sm,
    },
  });
}

function createFieldErrorStyles(theme: Theme) {
  const { colors, typography } = theme;
  return StyleSheet.create({
    errorItem: {
      color: colors.destructive,
      fontSize: typography.fontSize.sm,
      marginBottom: 2,
    },
    errorText: {
      color: colors.destructive,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.normal,
    },
    fieldError: {
      width: '100%',
    },
  });
}
