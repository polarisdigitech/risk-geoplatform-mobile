/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-shadow */
/* eslint-disable curly */
import {useMachine} from '@xstate/react';
import React, {useEffect} from 'react';
import {Image, Platform, StyleSheet, Text, View} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import {useTheme} from 'react-native-paper';
import Check from '../../../assets/check-circle.svg';
import {uploadMachine} from '../machines/image_upload.machine';
import {Photo} from '../../../types';
import Button from '../../../shared/components/Button';
import Loader from '../../../shared/components/Loader';

type ImageView = {
  uri?: string;
  label: string;
  onEnd: (value: Photo) => void;
  onChange: (value: Photo) => void;
};

const size = 100;

export default function ImageView({uri, label, onEnd, onChange}: ImageView) {
  const {colors, roundness} = useTheme();
  let [current, send] = useMachine(uploadMachine);
  let placeholder = 'https://via.placeholder.com/468x60?text=' + label;

  useEffect(() => {
    if (current.matches('uploaded')) {
      const {imgType, result, fileName} = current.context;
      onEnd({uri: result, imgType, fileName});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  const chooseImage = async () => {
    ImagePicker.launchCamera(
      {
        noData: true,
        quality: 0.2,
        allowsEditing: true,
        storageOptions: {
          waitUntilSaved: true,
        },
      },
      (response) => {
        let {uri, type: imgType, fileName} = response as any;

        if (uri) {
          /**
           * We need to massage this uri a bit based on platform to make it work.
           * Essentially, it just boils down to stripping file:// from the uri on iOS.
           */
          uri = Platform.OS === 'android' ? uri : uri.replace('file://', '');

          // Get file name from uri if file name is not available.
          // This is most likely to happen on ios.
          if (!fileName) fileName = uri.split('/').pop();

          onChange({uri, imgType, fileName});
          send({type: 'UPLOAD', uri, imgType, fileName});
        }
      },
    );
  };

  const Matches = (props: {value: string; children: any}) => {
    let {value, children} = props;
    return current.matches(value as any) ? children : null;
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
      }}>
      <View
        style={{
          width: size,
          height: size,
          overflow: 'hidden',
        }}>
        <Image
          style={{
            width: '100%',
            height: '100%',
            borderRadius: roundness,
          }}
          source={{uri: uri || placeholder}}
        />
        <Matches value="uploading">
          <Loader
            color="white"
            style={{
              borderRadius: roundness,
              backgroundColor: '#000000d4',
              ...StyleSheet.absoluteFillObject,
            }}
          />
        </Matches>
      </View>
      <View style={{marginLeft: 20}}>
        <Matches value="uploaded">
          <Check
            width={25}
            stroke={colors.primary}
            style={{marginBottom: 10}}
          />
        </Matches>

        <Matches value="error">
          <View style={{marginBottom: 10, alignItems: 'flex-start'}}>
            <Text>Error uploading image.</Text>
            <Button
              mode="outlined"
              style={{marginTop: 10}}
              onPress={() => send('RETRY')}>
              retry
            </Button>
          </View>
        </Matches>
        <Button mode="outlined" onPress={chooseImage}>
          add image
        </Button>
      </View>
    </View>
  );
}
