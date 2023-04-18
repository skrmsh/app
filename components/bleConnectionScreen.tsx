import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';
import { Button, useTheme } from 'react-native-paper';
import { BleConnection, ErrorDialog } from '.';
import { getStyles, killManager, startBluetooth } from '../utils';

type BleConnectionScreenProps = {
  manager: BleManager | undefined;
  setManager: (manager: BleManager | undefined) => void;
  messageCallback: (message: string) => void;
  connectedDevices: Device[];
  setConnectedDevices: (setter: (devices: Device[]) => Device[]) => void;
  onScreenFinishedCallback: () => void;
};
export const BleConnectionScreen = ({
  manager,
  setManager,
  messageCallback,
  connectedDevices,
  setConnectedDevices,
  onScreenFinishedCallback,
}: BleConnectionScreenProps): JSX.Element => {
  console.log(connectedDevices);
  const [errorMessage, setErrorMessage] = useState('');
  const theme = useTheme();
  useEffect(() => {
    if (!manager) {
      startBluetooth(setManager);
    }
  }, []);
  return (
    <>
      <View
        style={{
          margin: 15,
          height: '100%',
          ...getStyles(theme).centerContainer,
        }}>
        <ErrorDialog
          showingError={!!errorMessage}
          setShowingError={() => setErrorMessage('')}
          errorMsg={errorMessage}
        />
        <BleConnection
          connectionIsFor="Phaser"
          onConnectCallback={device => {}}
          onDisconnectCallback={device => {}}
          manager={manager}
          messageCallback={messageCallback}
          errorMessageSetter={setErrorMessage}
          connectedDevices={connectedDevices}
          setConnectedDevices={setConnectedDevices}
        />
        <BleConnection
          connectionIsFor="Vest"
          onConnectCallback={device => {}}
          onDisconnectCallback={device => {}}
          manager={manager}
          messageCallback={messageCallback}
          errorMessageSetter={setErrorMessage}
          connectedDevices={connectedDevices}
          setConnectedDevices={setConnectedDevices}
        />
        <Button
          onPress={onScreenFinishedCallback}
          mode="contained"
          style={{
            marginRight: 40,
            marginTop: 10,
            alignSelf: 'flex-end',
          }}
          disabled={connectedDevices.length < 1}>
          Continue
        </Button>
      </View>
    </>
  );
};