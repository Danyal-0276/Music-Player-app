import React, { createContext, useContext, useMemo } from 'react';
import {
  useSharedValue,
  useAnimatedScrollHandler,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

type ChromeContextValue = {
  chromeHidden: SharedValue<number>;
  onScroll: ReturnType<typeof useAnimatedScrollHandler>;
  revealChrome: () => void;
};

const ChromeContext = createContext<ChromeContextValue | null>(null);

export function ChromeProvider({ children }: { children: React.ReactNode }) {
  const chromeHidden = useSharedValue(0);
  const lastY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      const y = event.contentOffset.y;
      const dy = y - lastY.value;
      if (y <= 12) {
        chromeHidden.value = withTiming(0, { duration: 220 });
      } else if (dy > 6 && y > 40) {
        chromeHidden.value = withTiming(1, { duration: 220 });
      } else if (dy < -6) {
        chromeHidden.value = withTiming(0, { duration: 220 });
      }
      lastY.value = y;
    },
  });

  const value = useMemo(
    () => ({
      chromeHidden,
      onScroll,
      revealChrome: () => {
        chromeHidden.value = withTiming(0, { duration: 220 });
      },
    }),
    [chromeHidden, onScroll]
  );

  return <ChromeContext.Provider value={value}>{children}</ChromeContext.Provider>;
}

export function useChrome() {
  const ctx = useContext(ChromeContext);
  if (!ctx) {
    throw new Error('useChrome must be used within ChromeProvider');
  }
  return ctx;
}
