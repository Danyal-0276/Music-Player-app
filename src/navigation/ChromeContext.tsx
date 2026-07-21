import React, { createContext, useContext, useMemo } from 'react';
import {
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import type { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

type ChromeContextValue = {
  chromeHidden: SharedValue<number>;
  /** JS-thread scroll handler — safe with FlashList recycling. */
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  revealChrome: () => void;
};

const ChromeContext = createContext<ChromeContextValue | null>(null);

export function ChromeProvider({ children }: { children: React.ReactNode }) {
  const chromeHidden = useSharedValue(0);
  const lastY = useSharedValue(0);

  const value = useMemo<ChromeContextValue>(() => {
    return {
      chromeHidden,
      onScroll: (event) => {
        const y = event.nativeEvent.contentOffset.y;
        const dy = y - lastY.value;
        lastY.value = y;
        if (y <= 12) {
          chromeHidden.value = withTiming(0, { duration: 220 });
        } else if (dy > 8 && y > 48) {
          chromeHidden.value = withTiming(1, { duration: 220 });
        } else if (dy < -8) {
          chromeHidden.value = withTiming(0, { duration: 220 });
        }
      },
      revealChrome: () => {
        chromeHidden.value = withTiming(0, { duration: 220 });
      },
    };
  }, [chromeHidden, lastY]);

  return <ChromeContext.Provider value={value}>{children}</ChromeContext.Provider>;
}

export function useChrome() {
  const ctx = useContext(ChromeContext);
  if (!ctx) {
    throw new Error('useChrome must be used within ChromeProvider');
  }
  return ctx;
}
