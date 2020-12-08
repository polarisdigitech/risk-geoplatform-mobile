/* eslint-disable no-shadow */
/* eslint-disable react-native/no-inline-styles */
import AsyncStorage from '@react-native-community/async-storage';
import { useNetInfo } from '@react-native-community/netinfo';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useMachine } from '@xstate/react';
import React, { useCallback, useEffect } from 'react';
import { FlatList, Picker, StyleSheet, View } from 'react-native';
import { Checkbox, RadioButton, Snackbar, TextInput } from 'react-native-paper';
import { FlatGrid } from 'react-native-super-grid';
import AccuracyWatcher from '../../shared/components/AccuracyWatcher';
import ConnectivityWatcher from '../../shared/components/ConnectivityWatcher';
import Screen from '../../shared/components/Screen';
import VerifyAddressButton from '../../shared/components/VerifyAddressButton';
import { verifyAddressMachine } from '../../shared/machines/verify_address.machine';
import DatePicker from './components/DatePicker';
import Field from './components/Field';
import ImagePicker from './components/ImagePicker';

// eslint-disable-next-line react/self-closing-comp
const Spacer = () => <View style={{ height: 10 }}></View>;

function VerifyAddress() {
  const nav = useNavigation();
  const { params } = useRoute();
  let { isConnected } = useNetInfo();

  let { address, clientExtraFields } = params as any;

  const [current, send, service] = useMachine(
    verifyAddressMachine.withContext({
      address,
      texts: {},
      errors: {},
      images: {},
      checkboxes: {},
      structure: clientExtraFields,
      status: isConnected ? 'online' : 'offline',
    }),
    {
      services: {
        saveMachineState({ address: { id } }): Promise<void> {
          return AsyncStorage.setItem(id.toString(), JSON.stringify(current));
        },
      },
    },
  );

  const {
    context: { images, texts, error, errors, checkboxes },
  } = current;

  const isChecked = useCallback(
    (label: string, value: string) => {
      const checkbox = checkboxes[label] ?? new Set();
      return checkbox.has(value);
    },
    [checkboxes],
  );

  const toggle = useCallback(
    (label: string, value: string) => {
      send({ label, value, type: 'TOGGLE_CHECKBOX' });
    },
    [send],
  );

  useEffect(() => {
    send('EDIT');
  }, [send]);

  return (
    <>
      <Screen>
        <>
          <FlatList
            keyExtractor={({ id }) => id}
            ItemSeparatorComponent={Spacer}
            data={clientExtraFields as any[]}
            contentContainerStyle={{ padding: 10 }}
            renderItem={({
              item: { fieldType, fieldName: label, options = [], required },
            }) => {
              const error = errors?.[label];

              return (
                <Field
                  error={error}
                  title={label}
                  required={required}
                  style={styles.field}>
                  {(fieldType === 'text' || fieldType === 'number') && (
                    <TextInput
                      mode="outlined"
                      placeholder={label}
                      keyboardType={
                        fieldType === 'number' ? 'numeric' : 'default'
                      }
                      onChangeText={(value) => {
                        send({ type: 'EDIT_TEXT', label, value });
                      }}
                    />
                  )}
                  {fieldType === 'image' && (
                    <ImagePicker
                      label={label}
                      uri={images[label]?.uri}
                      onChange={(image) => {
                        send({ type: 'SET_LOCAL_IMAGE', label, ...image });
                      }}
                      onEnd={({ uri: value }) => {
                        send({ type: 'SET_UPLOADED_IMAGE', label, value });
                      }}
                    />
                  )}
                  {fieldType === 'date' && (
                    <DatePicker
                      date={texts[label]}
                      onChange={(value) => {
                        send({ type: 'EDIT_TEXT', label, value });
                      }}
                    />
                  )}
                  {fieldType === 'radio' && (
                    <RadioButton.Group
                      value={texts[label]}
                      onValueChange={(value: any) => {
                        send({ type: 'EDIT_TEXT', label, value });
                      }}>
                      <FlatGrid
                        spacing={10}
                        data={options as any[]}
                        keyExtractor={({ id }) => id.toString()}
                        ItemSeparatorComponent={() => <Spacer />}
                        renderItem={({ item: { value } }) => (
                          <RadioButton.Item
                            color="black"
                            label={value}
                            value={value}
                          />
                        )}
                      />
                    </RadioButton.Group>
                  )}
                  {fieldType === 'select' && (
                    <Picker
                      selectedValue={texts[label]}
                      onValueChange={(value) => {
                        send({ type: 'EDIT_TEXT', label, value });
                      }}>
                      <Picker.Item label="Select option" value={null} />
                      {options.map(({ id, value }: any) => (
                        <Picker.Item key={id} label={value} value={value} />
                      ))}
                    </Picker>
                  )}
                  {fieldType === 'check' && (
                    <FlatGrid
                      spacing={10}
                      data={options as any[]}
                      keyExtractor={({ id }) => id.toString()}
                      ItemSeparatorComponent={() => <Spacer />}
                      renderItem={({ item: { value } }) => {
                        return (
                          <Checkbox.Item
                            label={value}
                            onPress={() => toggle(label, value)}
                            status={
                              isChecked(label, value) ? 'checked' : 'unchecked'
                            }
                          />
                        );
                      }}
                    />
                  )}
                </Field>
              );
            }}
          />
          <View key="2" style={{ margin: 15 }}>
            <AccuracyWatcher service={service} />
            <ConnectivityWatcher service={service} />
            <VerifyAddressButton
              mode="contained"
              service={service}
              style={styles.btn}
            />
          </View>
        </>
      </Screen>

      <Snackbar
        duration={2000}
        onDismiss={() => nav.goBack()}
        visible={current.matches('saved') || current.matches('submitted')}>
        Address {isConnected ? 'submitted' : 'saved'}
      </Snackbar>

      <Snackbar onDismiss={() => { }} visible={current.matches('error')}>
        {error?.message}
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    flex: 1,
    padding: 10,
  },
  btn: {
    marginTop: 10,
  },
  checkbox: {
    padding: 10,
  },
});

export default VerifyAddress;
