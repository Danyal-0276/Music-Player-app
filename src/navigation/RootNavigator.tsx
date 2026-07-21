import React from 'react';
import { View } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeProvider';
import { LibraryHomeScreen } from '../screens/library/LibraryHomeScreen';
import { ArtistsScreen } from '../screens/library/ArtistsScreen';
import { ArtistDetailScreen } from '../screens/library/ArtistDetailScreen';
import { AlbumsScreen } from '../screens/library/AlbumsScreen';
import { AlbumDetailScreen } from '../screens/library/AlbumDetailScreen';
import { PlaylistsScreen } from '../screens/library/PlaylistsScreen';
import { PlaylistDetailScreen } from '../screens/library/PlaylistDetailScreen';
import { SettingsHomeScreen } from '../screens/settings/SettingsHomeScreen';
import { SpaceshipTabBar } from '../components/SpaceshipTabBar';
import { NowPlayingModal } from '../screens/player/NowPlayingModal';
import { SongContextSheet } from '../components/SongContextSheet';
import { PlaylistPickerSheet } from '../components/PlaylistPickerSheet';
import { ChromeProvider } from './ChromeContext';
import type {
  LibraryStackParamList,
  RootTabParamList,
  SettingsStackParamList,
} from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const LibraryStack = createNativeStackNavigator<LibraryStackParamList>();
const ArtistsStack = createNativeStackNavigator<LibraryStackParamList>();
const AlbumsStack = createNativeStackNavigator<LibraryStackParamList>();
const PlaylistsStack = createNativeStackNavigator<LibraryStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

function LibraryStackNavigator() {
  return (
    <LibraryStack.Navigator screenOptions={{ headerShown: false }}>
      <LibraryStack.Screen name="LibraryHome" component={LibraryHomeScreen} />
    </LibraryStack.Navigator>
  );
}

function ArtistsStackNavigator() {
  return (
    <ArtistsStack.Navigator
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
      }}
    >
      <ArtistsStack.Screen
        name="Artists"
        component={ArtistsScreen}
        options={{ headerShown: false }}
      />
      <ArtistsStack.Screen
        name="ArtistDetail"
        component={ArtistDetailScreen}
        options={({ route }) => ({ title: route.params.artistName, headerShown: true })}
      />
    </ArtistsStack.Navigator>
  );
}

function AlbumsStackNavigator() {
  return (
    <AlbumsStack.Navigator screenOptions={{ headerShown: true, headerShadowVisible: false }}>
      <AlbumsStack.Screen name="Albums" component={AlbumsScreen} options={{ headerShown: false }} />
      <AlbumsStack.Screen
        name="AlbumDetail"
        component={AlbumDetailScreen}
        options={({ route }) => ({ title: route.params.albumName, headerShown: true })}
      />
    </AlbumsStack.Navigator>
  );
}

function PlaylistsStackNavigator() {
  return (
    <PlaylistsStack.Navigator screenOptions={{ headerShown: true, headerShadowVisible: false }}>
      <PlaylistsStack.Screen
        name="Playlists"
        component={PlaylistsScreen}
        options={{ headerShown: false }}
      />
      <PlaylistsStack.Screen
        name="PlaylistDetail"
        component={PlaylistDetailScreen}
        options={({ route }) => ({ title: route.params.playlistName, headerShown: true })}
      />
    </PlaylistsStack.Navigator>
  );
}

function SettingsStackNavigator() {
  return (
    <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
      <SettingsStack.Screen name="SettingsHome" component={SettingsHomeScreen} />
    </SettingsStack.Navigator>
  );
}

export function RootNavigator() {
  const { colors, isDark } = useTheme();

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.accent,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <ChromeProvider>
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <Tab.Navigator
            tabBar={(props) => <SpaceshipTabBar {...props} />}
            screenOptions={{
              headerShown: false,
              tabBarStyle: { position: 'absolute' },
            }}
          >
            <Tab.Screen
              name="LibraryTab"
              component={LibraryStackNavigator}
              options={{ title: 'Library' }}
            />
            <Tab.Screen
              name="ArtistsTab"
              component={ArtistsStackNavigator}
              options={{ title: 'Artists' }}
            />
            <Tab.Screen
              name="AlbumsTab"
              component={AlbumsStackNavigator}
              options={{ title: 'Albums' }}
            />
            <Tab.Screen
              name="PlaylistsTab"
              component={PlaylistsStackNavigator}
              options={{ title: 'Playlists' }}
            />
            <Tab.Screen
              name="SettingsTab"
              component={SettingsStackNavigator}
              options={{ title: 'Settings' }}
            />
          </Tab.Navigator>
          <NowPlayingModal />
          <SongContextSheet />
          <PlaylistPickerSheet />
        </View>
      </ChromeProvider>
    </NavigationContainer>
  );
}
