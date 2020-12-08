/* eslint-disable curly */
/* eslint-disable react-native/no-inline-styles */
import AsyncStorage from '@react-native-community/async-storage';
import { useNetInfo } from '@react-native-community/netinfo';
import { useMachine } from '@xstate/react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  LayoutAnimation,
  Platform,
  StyleSheet,
  UIManager,
  View,
} from 'react-native';
import { Card } from 'react-native-paper';
import { State } from 'xstate';
import Label from "../../shared/components/Label";
import Emptystate from '../../shared/components/EmptyState';
import Loader from '../../shared/components/Loader';
import Screen from '../../shared/components/Screen';
import { colors } from '../../helpers/theme';
import useAsync from '../../shared/hooks/useAsync';
import {
  VerifyAddressContext,
  VerifyAddressEvents,
  verifyAddressMachine,
  VerifyAddressStates,
} from '../../shared/machines/verify_address.machine';

import Check from '../../assets/check.svg';
import ConnectivityWatcher from '../../shared/components/ConnectivityWatcher';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type VerifyAddressState = State<
  VerifyAddressContext,
  VerifyAddressEvents,
  VerifyAddressStates
>;

interface AddressCard {
  state: VerifyAddressState;
  onDone: (addressId: string) => void;
}

/**
 * Delegates each image upload to AdressImage and then uploads
 * each addresses as soon as all their images have been uploaded
 */
function AddressCard({ state, onDone }: AddressCard) {
  let { isConnected } = useNetInfo();

  const [current, send, service] = useMachine(verifyAddressMachine, {
    state,
    actions: {
      notifySubmitted: () => { },
    },
    services: {
      saveMachineState: () => Promise.resolve(),
    },
  });

  const {
    error,
    texts,
    images,
    address: { id, areaname, streetname },
  } = current.context;

  const addressLine = `${streetname}, ${areaname}`;

  const labels = useMemo(() => {
    return Object.entries(texts).slice(0, 4);
  }, [texts]);

  // pending images to upload
  const pendingImages = useMemo(() => {
    return Object.keys(images).filter((key) => {
      const { cloudUri } = images[key];
      return !!cloudUri;
    });
  }, [images]);

  const isConnectedAndNoPendingIamegs = useMemo(() => {
    return isConnected && pendingImages.length <= 0;
  }, [isConnected, pendingImages]);

  console.log(
    id,
    current.value,
    error,
    isConnected,
    isConnectedAndNoPendingIamegs,
    pendingImages,
  );

  useEffect(() => {
    if (isConnected) {
      send('SUBMIT');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  // useEffect(() => {
  //   if (
  //     isConnectedAndNoPendingIamegs ||
  //     (current.matches('error') && isConnectedAndNoPendingIamegs)
  //   ) {
  //     send('SUBMIT');
  //   }

  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isConnectedAndNoPendingIamegs]);

  useEffect(() => {
    if (current.matches('submitted')) {
      setTimeout(() => {
        onDone(id);
      }, 200);
    }
  }, [current, id, onDone]);

  return (
    <Card>
      <View style={styles.contentWrapper}>
        <Card.Title title={addressLine} style={{ flex: 5 }} />
        {current.matches('submitted') ? (
          <Check width={30} color="green" />
        ) : (
            <Loader size="small" color={colors.primary} />
          )}
      </View>
      <Card.Content>
        <ConnectivityWatcher service={service} />
        <FlatList
          data={labels}
          keyExtractor={([key]) => key}
          renderItem={({ item: [label, value] }) => {
            return <Label name={label} value={value} />;
          }}
        />
      </Card.Content>
    </Card>
  );

  // update each image that is uploaded in the local (AsyncStorage)
  // to its corresponding address.
  // const imageUploadDone = async (key: string) => {
  //   const imageRef = imageRefs[key];

  //   const newImageRef = {
  //     ...imageRefs,
  //     [key]: {
  //       ...imageRef,
  //       uploaded: true,
  //     },
  //   };

  //   const json = JSON.stringify({
  //     data,
  //     latitude,
  //     longitude,
  //     address_id: addressId,
  //     imageRefs: newImageRef,
  //   });

  //   await AsyncStorage.setItem(addressId.toString(), json);

  //   setQueue({...queue, [key]: newImageRef});
  // };

  // useEffect(() => {
  //   if (current.matches('error')) send('RETRY');
  //   if (current.matches('submitted')) onDone(addressId);
  // }, [current]);

  // const noPendingImageUploads = useCallback(() => {
  //   const arr = new Set();

  //   Object.keys(queue).forEach((key) => {
  //     arr.add(queue[key].uploaded);
  //   });

  //   return !arr.has(false);
  // }, [queue]);

  // useEffect(() => {
  //   if (noPendingImageUploads() && isConnected) send('SUBMIT');
  // }, [queue, isConnected]);

  // return (
  //   <Card>
  //     <Card.Content style={{alignItems: 'flex-start', flexDirection: 'row'}}>
  //       <View style={{flex: 5}}>
  //         {keys.map((key) => {
  //           const value = (data[key] as string).split('|').join(', ');
  //           return <KeyValue key={key} name={key} value={value} />;
  //         })}
  //         <View style={{marginTop: 10, flexDirection: 'row'}}>
  //           {queue && (
  //             <FlatList
  //               horizontal={true}
  //               data={Object.keys(queue)}
  //               keyExtractor={(item) => item}
  //               renderItem={({item}) => {
  //                 const value = queue[item];
  //                 const {uploaded, localUri} = value;

  //                 if (uploaded) {
  //                   return <ImageView uri={localUri} />;
  //                 } else {
  //                   return (
  //                     <AddressImage
  //                       data={value}
  //                       isConnected={isConnected}
  //                       onDone={() => imageUploadDone(item)}
  //                     />
  //                   );
  //                 }
  //               }}
  //             />
  //           )}
  //         </View>
  //       </View>
  //       <Loader />
  //     </Card.Content>
  //   </Card>
  // );
}

const msg = 'No pending addresses.';

export default function PendingUploads() {
  const [state, forceUpdate] = useState({});

  const value = useAsync<VerifyAddressState[]>(async () => {
    const addressIds = await AsyncStorage.getAllKeys();
    const machines = await Promise.all(
      addressIds.map((key) => AsyncStorage.getItem(key)),
    );

    return (machines as string[]).map((item) => JSON.parse(item));
  }, [state]);

  const onDone = useCallback(async (id: string) => {
    console.log(id, typeof id, id.toString());
    await AsyncStorage.removeItem(id.toString());
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    forceUpdate({});
  }, []);

  console.log('machines', value);

  return (
    <Screen>
      {value && value.length > 0 && (
        <FlatList
          data={value}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Emptystate msg={msg} />}
          keyExtractor={({ context: { address } }) => address.id.toString()}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => <AddressCard state={item} onDone={onDone} />}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 10,
    minHeight: '100%',
  },
  separator: {
    height: 10,
  },
  contentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
