import React, { useEffect, useState } from 'react';
import { BleManager, Device } from 'react-native-ble-plx';
import { Button, Card, Modal, Portal, Text } from 'react-native-paper';
import {
  addDeviceToList,
  addOnDisconnectCallback,
  connectUntilSuccess,
  disconnectFromDevice,
  getStyles,
  killScan,
  removeDeviceFromList,
  scanForPhasors,
  sendKeepAlive,
  sendTimestamp,
} from '../utils';
import { LoadingDialog } from './loadingDialog';
import { Theme } from '@react-navigation/native';
import { View } from 'react-native';

type BleConnectionProps = {
  connectionIsFor: string;
  onConnectCallback: (device: Device) => void;
  onDisconnectCallback: (device: Device) => void;
  manager: BleManager | undefined;
  errorMessageSetter: (e: string) => void;
  messageCallback: (message: string) => void;
  setConnectedDevices: (setter: (devices: Device[]) => Device[]) => void;
  connectedDevices: Device[];
  theme: Theme;
};

export const BleConnection = ({
  connectionIsFor,
  manager,
  onConnectCallback,
  errorMessageSetter,
  messageCallback,
  setConnectedDevices,
  connectedDevices,
  theme,
}: BleConnectionProps): JSX.Element => {
  const [isConnectedTo, setIsConnectedTo] = useState<Device>();
  const [discoveredDevices, setDiscoveredDevices] = useState<Device[]>([]);
  const [connectionPopupVisible, setConnectionPopupVisible] = useState(false);

  const [deviceToConnectTo, setDeviceToConnectTo] = useState<Device>();
  const [currentlyLoading, setCurrentlyLoading] = useState(false);

  useEffect(() => {
    if (connectionPopupVisible) {
      scanForPhasors(
        discoveredDevices,
        (deviceToAdd: Device) =>
          addDeviceToList(setDiscoveredDevices, deviceToAdd),
        manager,
        () => {},
      );
    } else {
      killScan(manager, setCurrentlyLoading);
    }
  }, [connectionPopupVisible]);

  return (
    <>
      <Portal>
        <LoadingDialog showingLoading={currentlyLoading} />
        <Modal
          visible={connectionPopupVisible}
          onDismiss={() => setConnectionPopupVisible(false)}
          contentContainerStyle={getStyles(theme).modalContainer}>
          <Text style={{ marginBottom: 20 }}>Select your Device</Text>
          {discoveredDevices.map((device: Device) => {
            return (
              <>
                <Button
                  theme={theme}
                  icon="pistol"
                  mode={
                    deviceToConnectTo?.id === device.id
                      ? 'contained'
                      : 'outlined'
                  }
                  onPress={() => {
                    if (deviceToConnectTo?.id === device.id) {
                      setDeviceToConnectTo(undefined);
                    } else {
                      setDeviceToConnectTo(device);
                    }
                  }}>
                  {device.name}
                </Button>
              </>
            );
          })}

          <Button
            theme={theme}
            disabled={!deviceToConnectTo}
            onPress={() => {
              if (deviceToConnectTo) {
                const device = deviceToConnectTo;
                setCurrentlyLoading(true);
                connectUntilSuccess(
                  device,
                  () => {
                    addDeviceToList(setConnectedDevices, device);
                    setIsConnectedTo(device);
                  },
                  manager,
                  () => {
                    onConnectCallback(device);
                    setTimeout(() => sendTimestamp(device), 1500);
                    var _keepAliveInterval = setInterval(async () => {
                      if (await device.isConnected()) {
                        sendKeepAlive(device);
                        console.log('Send Keep Alive!');
                      } else {
                        clearInterval(_keepAliveInterval);
                      }
                    }, 5000);
                    addOnDisconnectCallback(manager, device, (e: Device) => {
                      errorMessageSetter(
                        `Lost Connection to Phasor with ID: ${e.id}`,
                      );
                      removeDeviceFromList(setConnectedDevices, device);
                    });
                    setCurrentlyLoading(false);
                  },
                  messageCallback,
                );
                setConnectionPopupVisible(false);
              }
            }}>
            Connect
          </Button>
          <Button
            theme={theme}
            onPress={() => {
              setConnectionPopupVisible(false);
            }}>
            Cancel
          </Button>
        </Modal>
      </Portal>
      <Card theme={theme} style={getStyles(theme).connectionCard}>
        <Card.Title theme={theme} title={`${connectionIsFor} Connection`} />
        <Card.Content>
          {!!isConnectedTo ? (
            <Text>Connected to {isConnectedTo.name}</Text>
          ) : (
            <Text>Not Connected!</Text>
          )}
        </Card.Content>
        <Card.Actions>
          {!!isConnectedTo ? (
            <Button
              theme={theme}
              onPress={() => {
                disconnectFromDevice(
                  isConnectedTo,
                  () => {
                    removeDeviceFromList(setConnectedDevices, isConnectedTo);
                    setIsConnectedTo(undefined);
                  },
                  manager,
                );
              }}>
              Disconnect
            </Button>
          ) : (
            <Button
              theme={theme}
              onPress={() => setConnectionPopupVisible(true)}>
              Connect to {connectionIsFor}
            </Button>
          )}
        </Card.Actions>
      </Card>
    </>
  );
};
