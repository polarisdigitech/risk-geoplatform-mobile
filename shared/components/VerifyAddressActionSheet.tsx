import AsyncStorage from '@react-native-community/async-storage';
import {useMachine} from '@xstate/react';
import React, {createRef, useEffect, useMemo} from 'react';
import {StyleSheet} from 'react-native';
import ActionSheet from 'react-native-actions-sheet';
import {Title} from 'react-native-paper';
import AccuracyWatcher from './AccuracyWatcher';
import ConnectivityWatcher from '../components/ConnectivityWatcher';
import VerifyAddressButton from './VerifyAddressButton';
import {verifyAddressMachine} from '../machines/verify_address.machine';

export type VerifyAddressActionSheet = {
  address: any;
  onClose(): void;
  onSubmit(): void;
};

export function VerifyAddressActionSheet({
  address,
  onClose,
  onSubmit,
}: VerifyAddressActionSheet) {
  const {id, areaname, streetname} = address;
  const actionSheetRef = createRef<ActionSheet>();
  const addressLine = `${streetname}, ${areaname}`;

  const [current, send, service] = useMachine(
    verifyAddressMachine.withContext({address} as any),
    {
      actions: {
        notifySubmitted: () => onSubmit(),
      },
      services: {
        saveMachineState(): Promise<void> {
          return AsyncStorage.setItem(id.toString(), JSON.stringify(current));
        },
      },
    },
  );

  const isSubmitting = useMemo(() => {
    return current.matches('saving') || current.matches('uploading');
  }, [current]);

  useEffect(() => {
    send('EDIT');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    actionSheetRef.current?.setModalVisible(true);
  }, [actionSheetRef]);

  return (
    <ActionSheet
      onClose={onClose}
      ref={actionSheetRef}
      gestureEnabled={true}
      closable={!isSubmitting}
      containerStyle={styles.actionSheet}>
      <Title style={styles.address}>{addressLine}</Title>
      <AccuracyWatcher service={service} />
      <ConnectivityWatcher service={service} />
      <VerifyAddressButton service={service} style={styles.submitBtn} />
    </ActionSheet>
  );
}

export const styles = StyleSheet.create({
  submitBtn: {
    alignSelf: 'flex-end',
  },
  actionSheet: {
    paddingVertical: 20,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  address: {
    marginBottom: 10,
  },
});
