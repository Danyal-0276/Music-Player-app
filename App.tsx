import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import {
  Fraunces_400Regular,
  Fraunces_600SemiBold,
} from '@expo-google-fonts/fraunces';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useLibraryStore } from './src/store/libraryStore';
import { useSettingsStore } from './src/store/settingsStore';
import { setupAudioPlayer } from './src/services/audio/player';
import { PlayerActiveTrackSync } from './src/services/audio/PlayerActiveTrackSync';

function AppContent() {
  const { colors, isDark } = useTheme();
  const init = useLibraryStore((s) => s.init);
  const initialized = useLibraryStore((s) => s.initialized);
  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  const settingsHydrated = useSettingsStore((s) => s.hydrated);
  const [playerReady, setPlayerReady] = useState(false);

  useEffect(() => {
    void (async () => {
      await hydrateSettings();
      try {
        await setupAudioPlayer();
      } catch {
        // Player may fail until native build is installed; UI still loads.
      } finally {
        setPlayerReady(true);
      }
      await init();
    })();
  }, [init, hydrateSettings]);

  if (!initialized || !playerReady || !settingsHydrated) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <PlayerActiveTrackSync />
      <RootNavigator />
    </>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    Fraunces_400Regular,
    Fraunces_600SemiBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0C0A09' }}>
        <ActivityIndicator color="#FF7A6A" size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
