import React from 'react';
import {ActivityIndicator, StyleSheet, View, ViewStyle} from 'react-native';

type Loader = {
  color?: string;
  style?: ViewStyle;
  size?: 'small' | 'large';
};

export default function Loader({size, style, color = 'white'}: Loader) {
  return (
    <View style={[loaderStyle.loader, style]}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

const loaderStyle = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
