import { FlashList } from '@shopify/flash-list';

/** Plain FlashList — avoids Animated.createAnimatedComponent recycle glitches. */
export const AnimatedFlashList = FlashList;
