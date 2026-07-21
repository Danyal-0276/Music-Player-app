import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, interpolate } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { useChrome } from '../navigation/ChromeContext';
import { MiniPlayer } from './MiniPlayer';

const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  LibraryTab: 'planet-outline',
  ArtistsTab: 'people-outline',
  AlbumsTab: 'disc-outline',
  PlaylistsTab: 'albums-outline',
  SettingsTab: 'rocket-outline',
};

const TAB_ICONS_ACTIVE: Record<string, keyof typeof Ionicons.glyphMap> = {
  LibraryTab: 'planet',
  ArtistsTab: 'people',
  AlbumsTab: 'disc',
  PlaylistsTab: 'albums',
  SettingsTab: 'rocket',
};

const DOCK_TRAVEL = 120;

export function SpaceshipTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors, fonts, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { chromeHidden, revealChrome } = useChrome();

  const dockStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(chromeHidden.value, [0, 1], [0, DOCK_TRAVEL]),
      },
    ],
    opacity: interpolate(chromeHidden.value, [0, 1], [1, 0.35]),
  }));

  return (
    <Animated.View
      style={[
        styles.outer,
        dockStyle,
        { paddingBottom: Math.max(insets.bottom, 10) },
      ]}
      pointerEvents="box-none"
    >
      <MiniPlayer embedded />
      <View
        style={[
          styles.dock,
          {
            backgroundColor: isDark ? 'rgba(28, 25, 23, 0.94)' : 'rgba(255, 255, 255, 0.94)',
            borderColor: colors.accent,
            shadowColor: colors.accent,
          },
        ]}
      >
        <View style={[styles.hullGlow, { backgroundColor: colors.accentSoft }]} />
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key];
          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : options.title ?? route.name.replace('Tab', '');

          const onPress = () => {
            revealChrome();
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={label}
              style={styles.tab}
            >
              <View
                style={[
                  styles.pod,
                  focused && {
                    backgroundColor: colors.accentSoft,
                    borderColor: colors.accent,
                  },
                ]}
              >
                <Ionicons
                  name={
                    focused
                      ? TAB_ICONS_ACTIVE[route.name] ?? 'ellipse'
                      : TAB_ICONS[route.name] ?? 'ellipse-outline'
                  }
                  size={20}
                  color={focused ? colors.accent : colors.tabInactive}
                />
              </View>
              <Text
                numberOfLines={1}
                style={{
                  color: focused ? colors.accent : colors.tabInactive,
                  fontFamily: focused ? fonts.bodyMedium : fonts.body,
                  fontSize: 10,
                  marginTop: 2,
                }}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    gap: 8,
  },
  dock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 28,
    borderWidth: 1.5,
    paddingHorizontal: 6,
    paddingVertical: 8,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 12,
  },
  hullGlow: {
    ...StyleSheet.absoluteFill,
    opacity: 0.35,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  pod: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
});
