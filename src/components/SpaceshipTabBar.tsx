import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';
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
const SLIDE = { damping: 18, stiffness: 160, mass: 0.85 };

function TabItem({
  focused,
  label,
  routeName,
  onPress,
  accent,
  inactive,
  bodyFont,
  mediumFont,
  reduceMotion,
}: {
  focused: boolean;
  label: string;
  routeName: string;
  onPress: () => void;
  accent: string;
  inactive: string;
  bodyFont: string;
  mediumFont: string;
  reduceMotion: boolean;
}) {
  const progress = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    progress.value = reduceMotion
      ? withTiming(focused ? 1 : 0, { duration: 180 })
      : withSpring(focused ? 1 : 0, SLIDE);
  }, [focused, progress, reduceMotion]);

  const iconIdleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [1, 0]),
    transform: [{ scale: interpolate(progress.value, [0, 1], [1, 0.75]) }],
  }));

  const iconActiveStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.75, 1.08]) }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [inactive, accent]),
    opacity: interpolate(progress.value, [0, 1], [0.75, 1]),
    transform: [{ translateY: interpolate(progress.value, [0, 1], [3, 0]) }],
  }));

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={focused ? { selected: true } : {}}
      accessibilityLabel={label}
      style={styles.tab}
    >
      <View style={styles.podSlot}>
        <Animated.View style={[styles.iconLayer, iconIdleStyle]}>
          <Ionicons
            name={TAB_ICONS[routeName] ?? 'ellipse-outline'}
            size={20}
            color={inactive}
          />
        </Animated.View>
        <Animated.View style={[styles.iconLayer, iconActiveStyle]}>
          <Ionicons
            name={TAB_ICONS_ACTIVE[routeName] ?? 'ellipse'}
            size={20}
            color={accent}
          />
        </Animated.View>
      </View>
      <Animated.Text
        numberOfLines={1}
        style={[
          {
            fontFamily: focused ? mediumFont : bodyFont,
            fontSize: 10,
            marginTop: 2,
          },
          labelStyle,
        ]}
      >
        {label}
      </Animated.Text>
    </Pressable>
  );
}

export function SpaceshipTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors, fonts, isDark, reduceMotion } = useTheme();
  const insets = useSafeAreaInsets();
  const { chromeHidden, revealChrome } = useChrome();
  const { width: windowWidth } = useWindowDimensions();

  const dockPad = 12;
  const dockInnerPad = 6;
  const dockWidth = windowWidth - dockPad * 2;
  const tabCount = Math.max(state.routes.length, 1);
  const tabWidth = (dockWidth - dockInnerPad * 2) / tabCount;

  const indicatorX = useSharedValue(state.index * tabWidth);
  const indicatorReady = useSharedValue(0);

  useEffect(() => {
    // First layout: snap without animation so it doesn't fly in from 0.
    if (indicatorReady.value === 0) {
      indicatorX.value = state.index * tabWidth;
      indicatorReady.value = 1;
      return;
    }
    indicatorX.value = reduceMotion
      ? withTiming(state.index * tabWidth, { duration: 240, easing: Easing.out(Easing.cubic) })
      : withSpring(state.index * tabWidth, SLIDE);
  }, [state.index, tabWidth, indicatorX, indicatorReady, reduceMotion]);

  const dockStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(chromeHidden.value, [0, 1], [0, DOCK_TRAVEL]),
      },
    ],
    opacity: interpolate(chromeHidden.value, [0, 1], [1, 0.35]),
  }));

  const indicatorStyle = useAnimatedStyle(() => ({
    width: tabWidth,
    transform: [{ translateX: indicatorX.value }],
  }));

  const goTo = (index: number, route: (typeof state.routes)[number], focused: boolean) => {
    revealChrome();
    // Optimistic slide so the pill moves immediately on tap.
    if (!reduceMotion) {
      indicatorX.value = withSpring(index * tabWidth, SLIDE);
    } else {
      indicatorX.value = withTiming(index * tabWidth, { duration: 180 });
    }
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
    <Animated.View
      style={[
        styles.outer,
        dockStyle,
        { paddingBottom: Math.max(insets.bottom, 10), paddingHorizontal: dockPad },
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
            paddingHorizontal: dockInnerPad,
          },
        ]}
      >
        <View style={[styles.hullGlow, { backgroundColor: colors.accentSoft }]} />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.indicator,
            indicatorStyle,
            { backgroundColor: colors.accentSoft },
          ]}
        />
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key];
          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : options.title ?? route.name.replace('Tab', '');

          return (
            <TabItem
              key={route.key}
              focused={focused}
              label={label}
              routeName={route.name}
              onPress={() => goTo(index, route, focused)}
              accent={colors.accent}
              inactive={colors.tabInactive}
              bodyFont={fonts.body}
              mediumFont={fonts.bodyMedium}
              reduceMotion={reduceMotion}
            />
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
    gap: 8,
  },
  dock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 28,
    borderWidth: 1.5,
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
  indicator: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    left: 6,
    borderRadius: 22,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    zIndex: 1,
  },
  podSlot: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLayer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
