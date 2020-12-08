import {Platform} from 'react-native';
import {
  Permission,
  PERMISSIONS,
  requestMultiple,
  RESULTS,
} from 'react-native-permissions';

export default async function requestPermissions() {
  const cameraPermission = Platform.select({
    ios: PERMISSIONS.IOS.CAMERA,
    android: PERMISSIONS.ANDROID.CAMERA,
  }) as Permission;

  const locationPermission = Platform.select({
    ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  }) as Permission;

  const statuses = await requestMultiple([
    cameraPermission,
    locationPermission,
  ]);

  const cameraStatus = statuses[cameraPermission];
  const locationStatus = statuses[locationPermission];

  if (cameraStatus === RESULTS.GRANTED && locationStatus === RESULTS.GRANTED) {
    return Promise.resolve(true);
  }

  return Promise.resolve(false);
}
