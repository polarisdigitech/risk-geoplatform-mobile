/* eslint-disable curly */
import { useNetInfo } from '@react-native-community/netinfo';
import { useService } from '@xstate/react';
import React, { useMemo } from 'react';
import { Interpreter } from 'xstate';
import { colors } from '../../helpers/theme';
import {
  VerifyAddressContext,
  VerifyAddressEvents,
  VerifyAddressStates,
} from '../machines/verify_address.machine';
import { accuracyThreshold } from '../../utils/utils';
import Button from './Button';

type SubmitAddressButton = Omit<Button, 'children'> & {
  service: Interpreter<
    VerifyAddressContext,
    VerifyAddressStates,
    VerifyAddressEvents
  >;
};

export default function VerifyAddressButton({
  service,
  ...props
}: SubmitAddressButton) {
  const { black, primary } = colors;
  let { isConnected } = useNetInfo();
  const [current, send] = useService(service);

  const { coords } = current.context;

  const isSubmitting = useMemo(() => {
    return current.matches('saving') || current.matches('uploading');
  }, [current]);

  const submitButtonLabel = useMemo(() => {
    let label = 'submit';
    if (!isConnected) label = 'save';
    if (current.matches('saving')) label = 'saving';
    if (current.matches('submitting')) label = 'uploading';
    if (current.matches('submitted')) label = 'submitted';

    return label;
  }, [current, isConnected]);

  return (
    <Button
      {...props}
      loading={isSubmitting}
      onPress={() => send('SUBMIT')}
      color={isConnected ? primary : black}
      disabled={!coords || coords.accuracy > accuracyThreshold}
    >
      {submitButtonLabel}
    </Button>
  );
}
