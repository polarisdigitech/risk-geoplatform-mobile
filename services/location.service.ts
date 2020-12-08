import {Platform} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import {
  check,
  Permission,
  PERMISSIONS,
  request,
  RESULTS,
} from 'react-native-permissions';

const permissionsRationale = {
  buttonPositive: 'OK',
  buttonNegative: 'Cancel',
  title: 'Amp Location Permission',
  message: `Location permission is required for address collection.`,
};

export async function requestLocationPermission() {
  const permission = Platform.select({
    ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  }) as Permission;

  const status = await check(permission);

  switch (status) {
    case RESULTS.DENIED:
      const result = await request(permission, permissionsRationale);

      return result;

    case RESULTS.GRANTED:
      return status;

    case RESULTS.BLOCKED:
      return status;

    default:
      return status;
  }
}

export function requestLocation(): Promise<Geolocation.GeoCoordinates> {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      ({coords}) => resolve(coords),
      error => reject(error),
      {distanceFilter: 15},
    );
  });
}
