/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';

type Screen = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

function Screen(props: Screen) {
  return <View style={[{flex: 1}, props.style]}>{props.children}</View>;
}

export default Screen;
