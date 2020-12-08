import React from 'react';
import {StyleProp, StyleSheet, ViewStyle} from 'react-native';
import {Text} from 'react-native-paper';

type Badge = {
  size?: number;
  count: number;
  style?: StyleProp<ViewStyle>;
};

function Badge({style, count, size = 25}: Badge) {
  const borderRadius = size / 2;

  return (
    <Text
      style={[
        styles.badge,
        {
          height: size,
          borderRadius,
          minWidth: size,
          lineHeight: size,
          fontSize: size * 0.5,
        },
        style,
      ]}>
      {count}
    </Text>
  );
}

const styles = StyleSheet.create({
  badge: {
    color: '#fff',
    overflow: 'hidden',
    textAlign: 'center',
    backgroundColor: 'red',
    textAlignVertical: 'center',
  },
});

export default Badge;
