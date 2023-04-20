import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TextInput, useTheme, Modal, Portal, Button } from 'react-native-paper';
import { getStyles } from '../utils';

type SettingsContainerProps = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  serverHost: string;
  setServerHost: (serverHost: string) => void;
};

export const SettingsContainer = ({
  visible,
  setVisible,
  serverHost,
  setServerHost,
}: SettingsContainerProps): JSX.Element => {
  const theme = useTheme();
  return (
    <Portal>
      <Modal
        visible={visible}
        contentContainerStyle={getStyles(theme).modalContainer}
        onDismiss={() => {
          setVisible(false);
        }}>
        <Text style={styles.textStyle}>Server Host</Text>
        <TextInput
          label={'Server'}
          style={styles.input}
          onChangeText={setServerHost}
          value={serverHost}
          mode="outlined"
          accessibilityLabelledBy={undefined}
          accessibilityLanguage={undefined}
        />
        <Button
          mode="contained"
          onPress={() => {
            setUrl(serverHost);
            setVisible(false);
          }}>
          Save
        </Button>
      </Modal>
    </Portal>
  );
};

export const getUrl = (callback: (e: string | null) => void) => {
  console.log('attempting ro retrieve server url from asyncStorage');
  AsyncStorage.getItem('@serverHost').then(foo => callback(foo));
};
export const setUrl = (url: string) => {
  AsyncStorage.setItem('@serverHost', url)
    .then(() => {
      if (url) {
        console.log('successfully saved server url');
      }
    })
    .catch(e => {
      console.log('error:', e);
    });
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    height: 40,
    marginBottom: 8,
    padding: 12,
    width: 200,
  },
});
