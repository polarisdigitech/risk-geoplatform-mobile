/* eslint-disable react-native/no-inline-styles */
import AsyncStorage from '@react-native-community/async-storage';
import { useNetInfo } from '@react-native-community/netinfo';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useMachine } from '@xstate/react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Platform, StyleSheet, UIManager, View } from 'react-native';
import { Snackbar } from 'react-native-paper';
import Address from './components/Address';
import Emptystate from '../../shared/components/EmptyState';
import Loader from '../../shared/components/Loader';
import Screen from '../../shared/components/Screen';
import { VerifyAddressActionSheet } from '../../shared/components/VerifyAddressActionSheet';
import { colors } from '../../helpers/theme';
import useAsync from '../../shared/hooks/useAsync';
import usePrevious from '../../shared/hooks/usePrevious';
import { addressMachine } from './machines/address.machine';
import ErrorState from '../../shared/components/ErrorState';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function Addresses() {
  const nav = useNavigation();
  const { isInternetReachable } = useNetInfo();
  const [isStale, setIsStale] = useState(false);
  const [address, setAddress] = useState<any>();
  const [current, send] = useMachine(addressMachine);
  const wasReachable = usePrevious(isInternetReachable);

  let { error, addresses, structure = {} } = current.context;

  const { clientExtraFields } = structure;

  const savedAddresses = useAsync(() => {
    return AsyncStorage.getAllKeys();
  }, [addresses, isStale]);

  // Remove addresses that have been saved for later
  // upload from ths list, to prevent multiple submission of the same address.
  const _addresses = useMemo(() => {
    return addresses?.filter(({ id }) => {
      return !savedAddresses?.includes(String(id));
    });
  }, [addresses, savedAddresses]);

  // fetch recent addresses each time this page is opened.
  useFocusEffect(
    useCallback(() => {
      send('FETCH');
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  useEffect(() => {
    // notify the user that the current data that is displayed
    // is not up-to-date. Letting them know that the address
    // currently beign displayed are from the previous fetch
    // when we still had internet access.
    if (addresses && current.matches('error')) {
      setIsStale(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  useEffect(() => {
    // Check if we were in a state where the user did
    // not have internet access. If not, then go ahead and
    // automatically refresh.
    // The users wifi or mobile data might be connected,
    // but the user might not have internet access. To avoid
    // a loop of constant retries due to the fact that
    // the {isInternetReachable} would be true, but we would
    // always be in an error state, we need to hold a
    // reference to the previous connection state and check that
    // against the current connection state.
    // Basically, if we did not have internet access previously,
    // but we have have internet access now and we're in an error
    // state - then go ahead and do a refresh
    if (!wasReachable && isInternetReachable && current.matches('error')) {
      send('FETCH');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, isInternetReachable, wasReachable]);

  return (
    <Screen>
      {/* show error component only when there are no addresses */}
      {!addresses && current.matches('error') && error && (
        <ErrorState message={error.message} onRetry={() => send('FETCH')} />
      )}

      {_addresses && (
        <FlatList
          data={_addresses}
          refreshing={false}
          onRefresh={() => send('FETCH')}
          keyExtractor={({ id }) => id.toString()}
          contentContainerStyle={{ padding: 10, minHeight: '100%' }}
          ListEmptyComponent={
            <Emptystate msg="check back later for addresses or pull down to refresh." />
          }
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item, index }) => {
            return (
              <Address
                index={index}
                address={item}
                onPress={() => {
                  if (!clientExtraFields || clientExtraFields.length <= 0) {
                    return setAddress(item);
                  }

                  nav.navigate('VerifyAddress', {
                    address: item,
                    clientExtraFields,
                  });
                }}
              />
            );
          }}
        />
      )}

      {address && (
        <VerifyAddressActionSheet
          address={address}
          onClose={() => setAddress(undefined)}
          onSubmit={() => {
            send('FETCH');
            setAddress(undefined);
          }}
        />
      )}

      <Snackbar
        duration={3000}
        visible={isStale}
        onDismiss={() => setIsStale(false)}>
        Unable to fetch latest addresses due to a network error. Check your
        connection and refresh.
      </Snackbar>

      {current.matches('loading') && (
        <Loader size="large" color={colors.primary} style={styles.loader} />
      )}
    </Screen>
  );
}

export const styles = StyleSheet.create({
  loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
});

export default Addresses;
