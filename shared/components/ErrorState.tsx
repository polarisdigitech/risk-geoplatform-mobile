import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Text, Title} from 'react-native-paper';

export type ErrorStateType = {
  message: string;
  onRetry?: () => void;
};

function ErrorState({onRetry, message}: ErrorStateType) {
  return (
    <View style={style.wrapper}>
      <Title>Oops! Something is not right</Title>
      <Text style={style.message}>{message}</Text>
      <Button mode="outlined" onPress={onRetry} style={{marginTop: 15}}>
        retry
      </Button>
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

export default ErrorState