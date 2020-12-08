import {useService} from '@xstate/react';
import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import {Text} from 'react-native-paper';
import {Interpreter} from 'xstate';
import Info from '../../assets/info.svg';
import {colors} from '../../helpers/theme';
import {
  VerifyAddressContext,
  VerifyAddressEvents,
  VerifyAddressStates,
} from '../machines/verify_address.machine';
import {accuracyThreshold} from '../../utils/utils';

type AccuracyWatcher = {
  service: Interpreter<
    VerifyAddressContext,
    VerifyAddressStates,
    VerifyAddressEvents
  >;
};

export default function AccuracyWatcher({service}: AccuracyWatcher) {
  const [{context}, send] = useService(service);
  const {coords} = context;

  useEffect(() => {
    const watcher = Geolocation.watchPosition(
      // eslint-disable-next-line no-shadow
      ({coords}) => send({type: 'SET_COORDS', coords}),
      () => {},
      {
        interval: 50,
        distanceFilter: 0,
        fastestInterval: 1,
        enableHighAccuracy: true,
        forceRequestLocation: true,
      },
    );
    return () => {
      Geolocation.clearWatch(watcher);
    };
  }, [send]);

  return (
    <View style={styles.container}>
      <Text>
        Location accuracy:{' '}
        {!coords?.accuracy ? 'unknown' : `${coords.accuracy.toFixed(3)}m`}
      </Text>
      <View style={styles.row}>
        <Info color={colors.red} width={20} />
        <Text style={styles.info}>
          Accuracy must be below {accuracyThreshold}meters before you can
          submit.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 3,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  info: {
    fontSize: 13,
    marginLeft: 10,
    color: colors.red,
  },
  row: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
