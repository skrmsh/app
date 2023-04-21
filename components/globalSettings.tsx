import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  TextInput,
  useTheme,
  Modal,
  Portal,
  Button,
  Checkbox,
} from 'react-native-paper';
import {
  getStyles,
  storeServerHostInStorage,
  storeSecureConnectionInStorage,
  isValidHost,
} from '../utils';
import { ErrorDialog } from '.';

type SettingsContainerProps = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  serverHost: string;
  setServerHost: (serverHost: string) => void;
  secureConnection: boolean;
  setSecureConnection: (secureConnection: boolean) => void;
};

export const SettingsContainer = ({
  visible,
  setVisible,
  serverHost,
  setServerHost,
  secureConnection,
  setSecureConnection,
}: SettingsContainerProps): JSX.Element => {
  const [errorMsg, setErrorMsg] = useState('');
  const [hostInput, setHostInput] = useState(serverHost);
  const theme = useTheme();
  return (
    <>
      <ErrorDialog
        showingError={!!errorMsg}
        setShowingError={(e: boolean) => !e && setErrorMsg('')}
        errorMsg={errorMsg}
      />
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
            onChangeText={setHostInput}
            value={hostInput}
            mode="outlined"
            accessibilityLabelledBy={undefined}
            accessibilityLanguage={undefined}
          />
          <Text style={styles.textStyle}>Secure Connection</Text>
          <Checkbox
            status={secureConnection ? 'checked' : 'unchecked'}
            onPress={() => {
              setSecureConnection(!secureConnection);
            }}
          />
          <Button
            mode="contained"
            style={{ marginTop: 30 }}
            onPress={() => {
              if (isValidHost(hostInput)) {
                storeServerHostInStorage(hostInput);
                setServerHost(hostInput);
                console.log(`${hostInput} is valid`);
              } else {
                setErrorMsg(
                  `Invalid host ${hostInput}. A valid host should neither contain protocol nor path!`,
                );
                console.log(`${hostInput} is not valid`);
              }
              storeSecureConnectionInStorage(secureConnection);
              setVisible(false);
            }}>
            Save
          </Button>
        </Modal>
      </Portal>
    </>
  );
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
