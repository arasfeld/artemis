import React, { createContext, useMemo, useContext } from 'react';
import { StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native';

import { Separator } from './Separator';
import { Text } from './Text';

import type { Theme } from '../theme/ThemeContext';
import { useTheme } from '../theme/ThemeContext';

export type ItemVariant = 'default' | 'outline' | 'muted';
export type ItemSize = 'default' | 'sm' | 'xs';
export type ItemMediaVariant = 'default' | 'icon' | 'image';

const gapBySize = { default: 16, sm: 10, xs: 8 } as const;
const paddingBySize = {
  default: { horizontal: 12, vertical: 10 },
  sm: { horizontal: 12, vertical: 10 },
  xs: { horizontal: 10, vertical: 8 },
} as const;
const contentGapBySize = { default: 4, sm: 4, xs: 0 } as const;
const mediaImageSizeBySize = { default: 40, sm: 32, xs: 24 } as const;

const ItemContext = createContext<{ size: ItemSize }>({ size: 'default' });

function useItemSize() {
  return useContext(ItemContext).size;
}

export interface ItemGroupProps extends ViewProps {
  size?: ItemSize;
  style?: ViewStyle;
}

export function ItemGroup({ size, style, ...props }: ItemGroupProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createGroupStyles(theme, size), [theme, size]);

  return (
    <View accessibilityRole="list" style={[styles.root, style]} {...props} />
  );
}

function createGroupStyles(theme: Theme, size?: ItemSize) {
  const gap = size ? gapBySize[size] : theme.spacing.md;
  return StyleSheet.create({
    root: {
      flexDirection: 'column',
      gap,
      width: '100%',
    },
  });
}

export interface ItemSeparatorProps extends ViewProps {
  style?: ViewStyle;
}

export function ItemSeparator({ style, ...props }: ItemSeparatorProps) {
  const resolvedStyle =
    style != null
      ? StyleSheet.flatten([{ marginVertical: 8 }, style])
      : { marginVertical: 8 };
  return (
    <Separator orientation="horizontal" style={resolvedStyle} {...props} />
  );
}

export interface ItemProps extends ViewProps {
  asChild?: boolean;
  size?: ItemSize;
  style?: ViewStyle;
  variant?: ItemVariant;
}

export function Item({
  asChild = false,
  children,
  size = 'default',
  style,
  variant = 'default',
  ...props
}: ItemProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createItemStyles(theme), [theme]);
  const contextValue = useMemo(() => ({ size }), [size]);

  const padding = paddingBySize[size];
  const gap = size === 'xs' ? 8 : 10;

  const variantStyle =
    variant === 'outline'
      ? styles.variantOutline
      : variant === 'muted'
        ? styles.variantMuted
        : styles.variantDefault;
  const itemStyle: ViewStyle[] = [
    styles.base,
    {
      borderRadius: theme.borderRadius.lg,
      gap,
      paddingHorizontal: padding.horizontal,
      paddingVertical: padding.vertical,
    },
    variantStyle,
    ...(style ? [style] : []),
  ];

  if (
    asChild &&
    React.Children.count(children) === 1 &&
    React.isValidElement(children)
  ) {
    const child = React.Children.only(
      children
    ) as React.ReactElement<ViewProps>;
    return (
      <ItemContext.Provider value={contextValue}>
        {React.cloneElement(child, {
          ...child.props,
          style: [itemStyle, child.props.style],
        })}
      </ItemContext.Provider>
    );
  }

  return (
    <ItemContext.Provider value={contextValue}>
      <View style={itemStyle} {...props}>
        {children}
      </View>
    </ItemContext.Provider>
  );
}

function createItemStyles(theme: Theme) {
  const { colors } = theme;
  const variantDefault: ViewStyle = {
    borderColor: 'transparent',
    borderWidth: 1,
  };
  const variantOutline: ViewStyle = {
    borderColor: colors.border,
    borderWidth: 1,
  };
  const variantMuted: ViewStyle = {
    backgroundColor: colors.muted,
    borderColor: 'transparent',
    borderWidth: 1,
  };
  return StyleSheet.create({
    base: {
      alignItems: 'center',
      flexDirection: 'row',
      flexWrap: 'wrap',
      width: '100%',
    },
    variantDefault,
    variantMuted,
    variantOutline,
  });
}

export interface ItemMediaProps extends ViewProps {
  style?: ViewStyle;
  variant?: ItemMediaVariant;
}

export function ItemMedia({
  style,
  variant = 'default',
  ...props
}: ItemMediaProps) {
  const size = useItemSize();
  const { theme } = useTheme();
  const styles = useMemo(() => createMediaStyles(theme), [theme]);

  const imageSize = mediaImageSizeBySize[size];
  const variantStyle =
    variant === 'image'
      ? [
          styles.mediaImage,
          {
            borderRadius: theme.borderRadius.sm,
            height: imageSize,
            overflow: 'hidden' as const,
            width: imageSize,
          },
        ]
      : variant === 'icon'
        ? styles.mediaIcon
        : styles.mediaDefault;

  return (
    <View
      style={[
        styles.base,
        ...(Array.isArray(variantStyle) ? variantStyle : [variantStyle]),
        style,
      ]}
      {...props}
    />
  );
}

function createMediaStyles(theme: Theme) {
  return StyleSheet.create({
    base: {
      alignItems: 'center',
      flexDirection: 'row',
      flexShrink: 0,
      gap: theme.spacing.sm,
      justifyContent: 'center',
    },
    mediaDefault: {
      backgroundColor: 'transparent',
    },
    mediaIcon: {
      backgroundColor: 'transparent',
    },
    mediaImage: {
      backgroundColor: 'transparent',
    },
  });
}

export interface ItemContentProps extends ViewProps {
  style?: ViewStyle;
}

export function ItemContent({ style, ...props }: ItemContentProps) {
  const size = useItemSize();
  const styles = useMemo(() => createContentStyles(), []);
  const gap = contentGapBySize[size];

  return (
    <View
      style={[
        styles.root,
        {
          gap,
        },
        style,
      ]}
      {...props}
    />
  );
}

function createContentStyles() {
  return StyleSheet.create({
    root: {
      flex: 1,
      flexDirection: 'column',
    },
  });
}

export interface ItemTitleProps extends ViewProps {
  style?: ViewStyle;
}

export function ItemTitle({ children, style, ...props }: ItemTitleProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createTitleStyles(theme), [theme]);

  return (
    <View style={[styles.root, style]} {...props}>
      {typeof children === 'string' ? (
        <Text numberOfLines={1} style={[styles.text]} variant="body">
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

function createTitleStyles(theme: Theme) {
  const { colors, typography } = theme;
  return StyleSheet.create({
    root: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      alignItems: 'center',
    },
    text: {
      color: colors.foreground,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      lineHeight: typography.fontSize.sm * theme.typography.lineHeight.tight,
    },
  });
}

export interface ItemDescriptionProps extends ViewProps {
  style?: ViewStyle;
}

export function ItemDescription({
  children,
  style,
  ...props
}: ItemDescriptionProps) {
  const size = useItemSize();
  const { theme } = useTheme();
  const styles = useMemo(() => createDescriptionStyles(theme), [theme]);
  const fontSize =
    size === 'xs' ? theme.typography.fontSize.xs : theme.typography.fontSize.sm;

  return (
    <View style={[styles.root, style]} {...props}>
      {typeof children === 'string' ? (
        <Text
          numberOfLines={2}
          style={[styles.text, { fontSize }]}
          variant="muted"
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

function createDescriptionStyles(theme: Theme) {
  const { colors, typography } = theme;
  return StyleSheet.create({
    root: {
      alignSelf: 'stretch',
    },
    text: {
      color: colors.mutedForeground,
      fontFamily: undefined,
      fontWeight: typography.fontWeight.normal,
      lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
      textAlign: 'left',
    },
  });
}

export interface ItemActionsProps extends ViewProps {
  style?: ViewStyle;
}

export function ItemActions({ style, ...props }: ItemActionsProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createActionsStyles(theme), [theme]);

  return <View style={[styles.root, style]} {...props} />;
}

function createActionsStyles(theme: Theme) {
  return StyleSheet.create({
    root: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
  });
}

export interface ItemHeaderProps extends ViewProps {
  style?: ViewStyle;
}

export function ItemHeader({ style, ...props }: ItemHeaderProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createHeaderFooterStyles(theme), [theme]);

  return <View style={[styles.root, style]} {...props} />;
}

export interface ItemFooterProps extends ViewProps {
  style?: ViewStyle;
}

export function ItemFooter({ style, ...props }: ItemFooterProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createHeaderFooterStyles(theme), [theme]);

  return <View style={[styles.root, style]} {...props} />;
}

function createHeaderFooterStyles(theme: Theme) {
  return StyleSheet.create({
    root: {
      alignItems: 'center',
      flexBasis: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
  });
}
