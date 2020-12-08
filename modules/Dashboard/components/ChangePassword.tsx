import { useService } from '@xstate/react';
import React, { createRef, useCallback, useEffect, useMemo } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import ActionSheet from 'react-native-actions-sheet';
import { Title } from 'react-native-paper';
import Button from '../../../shared/components/Button';
import PasswordInput from '../../../shared/components/PasswordInput';

type ChangePassword = {
  actor: any;
};

export default function ChangePassword({ actor }: ChangePassword) {
  const password = createRef<any>();
  const [current, send] = useService(actor);
  const actionSheetRef = createRef<ActionSheet>();

  console.log(current.context);

  const { error, isFirstTimeLogin } = current.context as any;

  const isSubmitting = useMemo(() => {
    return current.matches('submitting');
  }, [current]);

  let closable = false;

  if (!isFirstTimeLogin && !isSubmitting) {
    closable = true;
  }

  const onSubmit = useCallback(() => {
    send('SUBMIT');
  }, [send]);

  const onChange = useCallback(
    (name: string, value: string) => {
      // @ts-ignore
      send({ type: 'EDIT', name, value });
    },
    [send],
  );

  const next = useCallback(() => {
    password.current.focus();
  }, [password]);

  useEffect(() => {
    actionSheetRef.current?.setModalVisible(true);
  }, [actionSheetRef]);

  useEffect(() => {
    if (current.matches('error')) {
      Alert.alert('Change Password', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  return (
    <ActionSheet
      closable={closable}
      ref={actionSheetRef}
      gestureEnabled={true}
      onClose={() => send('PASSWORD_CHANGED_CANCELED')}>
      <View style={styles.actionSheet}>
        <Title>Change Password</Title>
        <View style={styles.mt}>
          <PasswordInput
            mode="outlined"
            label="Old Password"
            returnKeyType='next'
            onSubmitEditing={next}
            placeholder="Enter old password"
            onChangeText={(value) => onChange('oldPassword', value)}
          />
          <PasswordInput
            ref={password}
            mode="outlined"
            style={styles.mt}
            returnKeyType='go'
            label="New Password"
            onSubmitEditing={onSubmit}
            placeholder="Enter new password"
            onChangeText={(value) => onChange('newPassword', value)}
          />
          <Button
            mode="contained"
            style={styles.mt}
            onPress={onSubmit}
            loading={isSubmitting}>
            change password
        </Button>
        </View>
      </View>
    </ActionSheet>
  );
}

export const styles = StyleSheet.create({
  actionSheet: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 30,
  },
  mt: {
    marginTop: 20,
  },
});
