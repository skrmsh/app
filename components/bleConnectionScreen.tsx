import React, { useState } from 'react';
import { View } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';
import { Button } from 'react-native-paper';
import { BleConnection, ErrorDialog } from '.';
import { getStyles } from '../utils';

type BleConnectionScreenProps = {
  manager: BleManager | undefined;
  messageCallback: (message: string) => void;
  connectedDevices: Device[];
  setConnectedDevices: (setter: (devices: Device[]) => Device[]) => void;
  onScreenFinishedCallback: () => void;
};
export const BleConnectionScreen = ({
  manager,
  messageCallback,
  connectedDevices,
  setConnectedDevices,
  onScreenFinishedCallback,
}: BleConnectionScreenProps): JSX.Element => {
  const [errorMessage, setErrorMessage] = useState('');
  return (
    <>
      <View
        style={{
          margin: 15,
          height: '100%',
          ...getStyles().centerContainer,
        }}>
        <ErrorDialog
          showingError={!!setErrorMessage}
          setShowingError={() => setErrorMessage('')}
          errorMsg={errorMessage}
        />
        <BleConnection
          connectionIsFor="Phasor"
          onConnectCallback={() => {}}
          onDisconnectCallback={() => {}}
          manager={manager}
          messageCallback={messageCallback}
          errorMessageSetter={setErrorMessage}
          connectedDevices={connectedDevices}
          setConnectedDevices={setConnectedDevices}
        />
        <BleConnection
          connectionIsFor="Vest"
          onConnectCallback={() => {}}
          onDisconnectCallback={() => {}}
          manager={manager}
          messageCallback={messageCallback}
          errorMessageSetter={setErrorMessage}
          connectedDevices={connectedDevices}
          setConnectedDevices={setConnectedDevices}
        />
        <Button
          onPress={onScreenFinishedCallback}
          disabled={connectedDevices.length === 0}>
          Continue
        </Button>
      </View>
    </>
  );
};
