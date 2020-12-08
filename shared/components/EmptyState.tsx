import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text, Title} from 'react-native-paper';

function EmptyState({msg}: {msg?: string}) {
  return (
    <View style={style.wrapper}>
      <Title>It feels empty here</Title>
      <Text style={style.message}>{msg}</Text>
    </View>
  );
}

let style = StyleSheet.create({
  wrapper: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    marginTop: 10,
    textAlign: 'center',
  },
});

export default EmptyState