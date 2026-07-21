import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';

type Props = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
};

export function EmptyState({
  icon = 'musical-notes-outline',
  title,
  message,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
}: Props) {
  const { colors, fonts, radii } = useTheme();

  return (
    <View style={styles.wrap}>
      <View style={[styles.iconCircle, { backgroundColor: colors.accentSoft }]}>
        <Ionicons name={icon} size={32} color={colors.accent} />
      </View>
      <Text style={[styles.title, { color: colors.text, fontFamily: fonts.display }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.textSecondary, fontFamily: fonts.body }]}>
        {message}
      </Text>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          style={[styles.btn, { backgroundColor: colors.accent, borderRadius: radii.lg }]}
        >
          <Text style={[styles.btnText, { fontFamily: fonts.bodyBold, color: '#fff' }]}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
      {secondaryLabel && onSecondary ? (
        <Pressable onPress={onSecondary} style={styles.secondary}>
          <Text style={{ color: colors.accent, fontFamily: fonts.bodyMedium }}>{secondaryLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 22, textAlign: 'center', marginBottom: 8 },
  message: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  btn: { paddingHorizontal: 22, paddingVertical: 12 },
  btnText: { fontSize: 15 },
  secondary: { marginTop: 14, padding: 8 },
});
