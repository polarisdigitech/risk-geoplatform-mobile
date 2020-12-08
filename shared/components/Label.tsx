import React from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';

interface Label {
  name: string;
  value: string;
  style?: StyleProp<ViewStyle>
}

function Label({ name, value, style }: Label) {
  return (
    <Text style={[styles.item, style]} numberOfLines={1} ellipsizeMode="tail">
      <Text style={styles.bold}>{name}: </Text>
      {value}
    </Text>
  );
}

const styles = StyleSheet.create({
  item: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  bold: {
    fontWeight: 'bold',
  },
});

export default Label