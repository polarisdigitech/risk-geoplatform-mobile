import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RadioButton as Radio, TouchableRipple, useTheme } from 'react-native-paper';

type RadioButton = {
  value: string;
  onPress: () => void;
};

function RadioButton({value, onPress}: RadioButton) {
  let {
    colors: {primary},
  } = useTheme();

  return (
    <View style={style.wrapper}>
      <TouchableRipple onPress={onPress}>
        <View style={style.container}>
          <Radio value={value} color={primary} />
          <Text style={{marginRight: 10}}>{value}</Text>
        </View>
      </TouchableRipple>
    </View>
  );
}

let style = StyleSheet.create({
  container: {
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  wrapper: {
    borderRadius: 7,
    overflow: 'hidden',
    borderColor: '#11cdcd',
    borderWidth: StyleSheet.hairlineWidth,
  },
});

export default RadioButton;
