import React from 'react';
import {View, StyleSheet, Image} from 'react-native';

export default function SpacialDotsBg({opacity = 0.04}: {opacity?: number}) {
  return (
    <View style={StyleSheet.absoluteFill}>
      <Image
        style={[styles.spacialDots, {opacity}]}
        source={require('../../assets/spacial-dots.png')}
      />
    </View>
  );
}

export const styles = StyleSheet.create({
  spacialDots: {
    width: '100%',
    height: '120%',
  },
});
