import {useNetInfo} from '@react-native-community/netinfo';
import {useMachine} from '@xstate/react';
import React, {useEffect} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {uploadMachine} from '../machines/image_upload.machine';
import {Photo} from '../../../types';
import Loader from '../../../shared/components/Loader';
import Check from '../../../assets/check-circle.svg';

type ImageUploader = Photo & {
  size?: number;
  placeholder?: string;
  onError?: () => void;
  onDone: (uri: string) => void;
};

export default function ImageUploader({
  onDone,
  onError,
  size = 30,
  placeholder,
  ...image
}: ImageUploader) {
  let {isConnected} = useNetInfo();
  const [current, send] = useMachine(uploadMachine);

  const {result} = current.context;

  useEffect(() => {
    if (isConnected) {
      send({type: 'UPLOAD', ...image});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, isConnected]);

  useEffect(() => {
    if (current.matches('error')) {
      onError?.();
    }
  }, [current, onError]);

  useEffect(() => {
    if (current.matches('uploaded')) {
      onDone(result as any);
    }

    if (isConnected && current.matches('error')) {
      send('RETRY');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, isConnected]);

  return (
    <View>
      <Image
        // eslint-disable-next-line react-native/no-inline-styles
        style={{
          width: size,
          height: size,
          borderRadius: 7,
        }}
        source={{uri: image.uri ?? placeholder}}
      />
      <View style={styles.loader}>
        {current.matches('uploading') && <Loader size="small" color="white" />}
        {current.matches('uploaded') && <Check width={20} stroke="#fff" />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loader: {
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000d4',
    ...StyleSheet.absoluteFillObject,
  },
});
