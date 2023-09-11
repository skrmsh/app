import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { BleConnection, ConfirmationDialogue, ErrorDialog } from '.';
import { getStyles } from '../utils';
import SKBLEManager from '../utils/bleManager';

type BleConnectionScreenProps = {
  messageCallback: (message: string) => void;
  onScreenFinishedCallback: () => void;
};
export const BleConnectionScreen = ({
  messageCallback,
  onScreenFinishedCallback,
}: BleConnectionScreenProps): JSX.Element => {
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmationDialogueShowing, setConfirmationDialogueShowing] =
    useState(false);
  const theme = useTheme();
  useEffect(() => {
    SKBLEManager.Instance.start();
  }, []);
  return (
    <>
      <View
        style={{
          margin: 15,
          height: '100%',
          ...getStyles(theme).centerContainer,
        }}>
        <ConfirmationDialogue
          showing={confirmationDialogueShowing}
          setShowing={setConfirmationDialogueShowing}
          confirmationText={
            'You seem to be using a development build. \
            Continuing wihout a connection to a device may \
             lead to unwanted results. Proceed with caution.'
          }
          action={onScreenFinishedCallback}
        />
        <ErrorDialog
          showingError={!!errorMessage}
          setShowingError={() => setErrorMessage('')}
          errorMsg={errorMessage}
        />
        <BleConnection
          connectionIsFor="Phaser"
          onConnectCallback={device => {}}
          onDisconnectCallback={device => {}}
          messageCallback={messageCallback}
          errorMessageSetter={setErrorMessage}
        />
        <BleConnection
          connectionIsFor="Vest"
          onConnectCallback={device => {}}
          onDisconnectCallback={device => {}}
          messageCallback={messageCallback}
          errorMessageSetter={setErrorMessage}
        />
        <Button
          onPress={() => {
            __DEV__
              ? onScreenFinishedCallback()
              : setConfirmationDialogueShowing(true);
          }}
          mode="contained"
          style={{
            marginRight: 40,
            marginTop: 10,
            alignSelf: 'flex-end',
          }}
          disabled={!__DEV__ && SKBLEManager.Instance.connectedDevices.length < 1}>
          Continue
        </Button>
      </View>
    </>
  );
};
