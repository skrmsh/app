import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';

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
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => {
        setVisible(false);
      }}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Server Host</Text>
          <TextInput
            label={'Server'}
            style={styles.input}
            onChangeText={setServerHost}
            value={serverHost}
            mode="outlined"
          />
          <Pressable
            style={[styles.button, styles.buttonClose]}
            onPress={() => {
              setUrl(serverHost);
              setVisible(false);
            }}>
            <Text style={styles.textStyle}>Save</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
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
