import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export function SongRowSkeleton({ count = 8 }: { count?: number }) {
  const { colors, rowHeight } = useTheme();
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={[styles.row, { minHeight: rowHeight }]}>
          <View style={[styles.art, { backgroundColor: colors.surfaceElevated }]} />
          <View style={styles.meta}>
            <View style={[styles.line, { backgroundColor: colors.surfaceElevated, width: '70%' }]} />
            <View style={[styles.line, { backgroundColor: colors.surfaceElevated, width: '45%', marginTop: 8 }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  art: { width: 48, height: 48, borderRadius: 12 },
  meta: { flex: 1 },
  line: { height: 12, borderRadius: 6 },
});
