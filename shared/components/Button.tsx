import React, {ComponentProps} from 'react';
import {StyleSheet} from 'react-native';
import {Button as PaperButton} from 'react-native-paper';

type Button = ComponentProps<typeof PaperButton>;

function Button({style, ...props}: Button) {
  return (
    <PaperButton
      {...props}
      theme={{roundness: 7}}
      style={[style, styles.Button]}
    />
  );
}

const styles = StyleSheet.create({
  Button: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
});

export default Button;
