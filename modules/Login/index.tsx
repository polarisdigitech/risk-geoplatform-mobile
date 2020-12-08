/* eslint-disable react-native/no-inline-styles */
import { useActor, useService } from '@xstate/react';
import React, { createRef, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
// @ts-ignore
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview';
import {
  Caption,
  Snackbar,
  Subheading,
  Text,
  TextInput,
} from 'react-native-paper';
import Logo from '../../assets/logo.svg';
import Screen from '../../shared/components/Screen';
import Button from '../../shared/components/Button';
import SpacialDotsBg from '../../shared/components/SpacialDotsBg';
import authService from '../../shared/machines/auth.machine';

import { displayName } from '../../app.json';
import PasswordInput from '../../shared/components/PasswordInput';

function Login() {
  const password = createRef<any>();

  const [{ context }] = useService(authService);

  const [current, send] = useActor(context.loginRef) as any

  const { error, errors } = current.context ?? {};

  const onFocus = useCallback(() => send('EDIT'), [send])

  const onSubmit = useCallback(() => send('AUTHENTICATE'), [send])

  const onChange = useCallback((name: string, value: string) => {
    send({ type: 'EDIT.field', name, value });
  }, [send])

  const gotoNext = useCallback(() => {
    password.current.focus();
  }, [password]);

  return (
    <>
      <Screen>
        <SpacialDotsBg opacity={0.1} />
        <KeyboardAwareScrollView
          style={style.container}
          contentContainerStyle={{ flex: 1 }}>
          <View style={style.hero}>
            <Logo width={150} height={150} />
            <Subheading style={[style.captionBold, { marginTop: 10 }]}>
              {displayName}
            </Subheading>
          </View>
          <View>
            <TextInput
              mode="outlined"
              label="Username"
              onFocus={onFocus}
              returnKeyType="next"
              placeholder="Username"
              onSubmitEditing={gotoNext}
              error={errors?.has('username')}
              onChangeText={(value) => onChange('username', value)}
            />

            <PasswordInput
              ref={password}
              mode="outlined"
              label="Password"
              onFocus={onFocus}
              returnKeyType="go"
              style={style.gapTop}
              placeholder="Password"
              onSubmitEditing={onSubmit}
              error={errors?.has('password')}
              onChangeText={(value) => onChange('password', value)}
            />

            <Button
              mode="contained"
              onPress={onSubmit}
              style={style.gapTop}
              loading={current.matches('authenticating')}>
              {current.matches('authenticating')
                ? 'Hold on a minute'
                : 'Login'}
            </Button>

            <Caption style={style.caption}>
              Powered by{' '}
              <Text style={style.captionBold}>POLARIS DIGITECH LIMITED</Text>
            </Caption>
          </View>
        </KeyboardAwareScrollView>
      </Screen>
      <Snackbar
        onDismiss={() => { }}
        visible={current.matches('error')}>
        {error}
      </Snackbar>
    </>
  );
}

const style = StyleSheet.create({
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gapTop: {
    marginTop: 30,
  },
  container: {
    padding: 30,
  },
  caption: {
    marginTop: 20,
    alignSelf: 'center',
  },
  captionBold: {
    color: 'black',
    fontWeight: 'bold',
  },
});

export default Login;
