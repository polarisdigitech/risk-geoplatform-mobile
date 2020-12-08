import React, {forwardRef, ComponentProps, useCallback, useState} from 'react';
import {StyleSheet, TextInput as RNTextInput, View} from 'react-native';
import {IconButton, TextInput, useTheme} from 'react-native-paper';

import EyeOff from '../../assets/eye-off.svg';
import Eye from '../../assets/eye.svg';

type PasswordInput = ComponentProps<typeof TextInput>;

const PasswordInput = forwardRef<any, PasswordInput>((props, ref) => {
  const {colors} = useTheme();
  const [secureTextEntry, setSecureEntry] = useState(true);

  const toggleSecureEntry = useCallback(
    () => setSecureEntry(!secureTextEntry),
    [secureTextEntry],
  );

  return (
    <TextInput
      ref={ref}
      {...props}
      secureTextEntry={secureTextEntry}
      render={(inputProps) => {
        return (
          <View style={style.row}>
            <RNTextInput
              {...inputProps}
              style={[inputProps.style, style.field]}
            />
            <IconButton
              size={25}
              color={colors.primary}
              style={style.revealIcon}
              onPress={toggleSecureEntry}
              icon={(iconProps) => {
                return secureTextEntry ? (
                  <Eye {...iconProps} />
                ) : (
                  <EyeOff {...iconProps} />
                );
              }}
            />
          </View>
        );
      }}
    />
  );
});

const style = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  field: {
    flex: 1,
  },
  revealIcon: {
    marginRight: 10,
    marginVertical: 10,
  },
});

export default PasswordInput;
