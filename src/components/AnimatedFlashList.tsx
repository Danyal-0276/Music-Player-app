import Animated from 'react-native-reanimated';
import { FlashList } from '@shopify/flash-list';

// Shared animated list for chrome hide-on-scroll across screens.
export const AnimatedFlashList = Animated.createAnimatedComponent(FlashList) as typeof FlashList;
