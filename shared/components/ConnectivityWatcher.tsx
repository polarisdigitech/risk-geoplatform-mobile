import { useNetInfo } from '@react-native-community/netinfo';
import { useService } from '@xstate/react';
import { useEffect } from 'react';
import { Interpreter } from 'xstate';
import { VerifyAddressContext, VerifyAddressEvents, VerifyAddressStates } from '../machines/verify_address.machine';

type ConnectivityWatcher = {
  service: Interpreter<
    VerifyAddressContext,
    VerifyAddressStates,
    VerifyAddressEvents
  >;
};

export default function ConnectivityWatcher({service}: ConnectivityWatcher) {
  let {isConnected} = useNetInfo();
  const [, send] = useService(service);

  useEffect(() => {
    send({
      type: 'SET_CONNECTION_STATUS',
      status: isConnected ? 'online' : 'offline',
    });
  }, [send, isConnected]);

  return null;
}
