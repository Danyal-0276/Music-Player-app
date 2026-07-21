import { Linking, Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { PermissionsAndroid } from 'react-native';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined' | 'blocked';

function mapStatus(status: string, canAskAgain?: boolean): PermissionStatus {
  if (status === 'granted' || status === 'limited') return 'granted';
  if (status === 'denied' && canAskAgain === false) return 'blocked';
  if (status === 'denied') return 'denied';
  return 'undetermined';
}

export async function checkAudioPermission(): Promise<PermissionStatus> {
  const result = await MediaLibrary.getPermissionsAsync(false, ['audio']);
  return mapStatus(result.status, result.canAskAgain);
}

export async function requestAudioPermission(): Promise<PermissionStatus> {
  const result = await MediaLibrary.requestPermissionsAsync(false, ['audio']);
  return mapStatus(result.status, result.canAskAgain);
}

export async function checkNotificationPermission(): Promise<PermissionStatus> {
  if (Platform.OS !== 'android' || Platform.Version < 33) {
    return 'granted';
  }
  const granted = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
  );
  return granted ? 'granted' : 'denied';
}

export async function requestNotificationPermission(): Promise<PermissionStatus> {
  if (Platform.OS !== 'android' || Platform.Version < 33) {
    return 'granted';
  }
  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    {
      title: 'Show playback controls',
      message:
        'Harmonic needs notification access so you can control music from the lock screen and notification shade.',
      buttonPositive: 'Allow',
      buttonNegative: 'Not now',
    }
  );
  return result === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied';
}

export async function openAppSettings() {
  await Linking.openSettings();
}
