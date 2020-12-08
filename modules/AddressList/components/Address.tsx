/* eslint-disable react-native/no-inline-styles */
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {
  Animated,
  Image,
  Linking,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import {Card, Colors, IconButton, useTheme} from 'react-native-paper';
import Navigation from '../../../assets/navigation.svg';

import {formatDistanceToNow} from 'date-fns'
import Label from '../../../shared/components/Label';

interface Address {
  address: any;
  index: number;
  onPress(): void;
}

function Address({
  index,
  onPress,
  address: {state, areaname, latitude, longitude, streetname, uploadedDate},
}: Address) {
  const {
    roundness,
    colors: {primary},
  } = useTheme();

  const addressline = `${streetname}, ${areaname}`;
  let {current: animation} = useRef(new Animated.Value(0));

  const assignedStr = useMemo(() => {
    return `${formatDistanceToNow(new Date(uploadedDate))} ago`
  }, [uploadedDate])

  const openMaps = useCallback(() => {
    const url = Platform.select({
      android: `google.navigation:q=${latitude}+${longitude}`,
      ios: `maps://app?saddr=${latitude}+${longitude}&daddr=${latitude}+${longitude}`,
    });

    Linking.openURL(url as string);
  }, [latitude, longitude]);

  useEffect(() => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 200,
      delay: index * 200,
      useNativeDriver: true,
    }).start();
  }, [animation, index]);

  return (
    <Animated.View
      style={{
        opacity: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        }),
        transform: [
          {
            translateY: animation.interpolate({
              inputRange: [0, 1],
              outputRange: [100, 0],
            }),
          },
        ],
      }}>
      <Card style={{padding: 10, overflow: 'hidden'}} onPress={onPress}>
        <View
          style={{
            zIndex: 0,
            right: -10,
            width: 170,
            bottom: -10,
            height: 170,
            position: 'absolute',
            transform: [{scale: 2}, {rotate: '-70deg'}],
          }}>
          <Image
            source={require('../../../assets/spacial-dots.png')}
            style={{opacity: 0.2, width: '100%', height: '120%'}}
          />
        </View>
        <View style={style.action}>
          <Card.Title title={addressline} style={{flex: 1}} />
          <View
            style={{
              alignItems: 'center',
              borderRadius: roundness,
              backgroundColor: primary,
              justifyContent: 'center',
            }}>
            <IconButton
              onPress={openMaps}
              icon={(props) => {
                return <Navigation {...props} color={Colors.white} />;
              }}
            />
          </View>
        </View>
        <Card.Content>
          <Label name="State" value={state} />
          <Label name="Assigned" value={assignedStr} style={{marginTop: 3}} />
        </Card.Content>
      </Card>
    </Animated.View>
  );
}

export const style = StyleSheet.create({
  bold: {
    fontWeight: 'bold',
  },
  capitalize: {
    textTransform: 'capitalize',
  },
  action: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default Address;
