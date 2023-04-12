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
  sendTimestamp,
} from '../utils';
import { LoadingDialog } from './loadingDialog';

type BleConnectionProps = {
  connectionIsFor: string;
  onConnectCallback: (device: Device) => void;
  onDisconnectCallback: () => void;
  manager: BleManager | undefined;
  errorMessageSetter: (e: string) => void;
  messageCallback: (message: string) => void;
  setConnectedDevices: (setter: (devices: Device[]) => Device[]) => void;
  connectedDevices: Device[];
};

export const BleConnection = ({
  connectionIsFor,
  manager,
  onConnectCallback,
  errorMessageSetter,
  messageCallback,
  setConnectedDevices,
  connectedDevices,
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
  const containerStyle = { backgroundColor: 'white', padding: 20, margin: 50 };

  return (
    <>
      <Portal>
        <LoadingDialog showingLoading={currentlyLoading} />
        <Modal
          visible={connectionPopupVisible}
          onDismiss={() => setConnectionPopupVisible(false)}
          contentContainerStyle={containerStyle}>
          <Text>Choose a device to connect to</Text>
          {discoveredDevices.map((device: Device) => {
            return (
              <>
                <Button
                  icon="camera"
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
                  {device.id}
                </Button>
              </>
            );
          })}
          <Button
            onPress={() => {
              setConnectionPopupVisible(false);
            }}>
            Cancel
          </Button>
          <Button
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
                    onConnectCallback;
                  },
                  manager,
                  () => {
                    setTimeout(() => sendTimestamp(device), 1500);
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
        </Modal>
      </Portal>
      <Card style={getStyles().connectionCard}>
        <Card.Title title={`Connection for ${connectionIsFor}`} />
        {!!isConnectedTo && (
          <Text>Currently connected to {isConnectedTo.id}</Text>
        )}
        <Card.Actions>
          {!!isConnectedTo ? (
            <Button
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
            <Button onPress={() => setConnectionPopupVisible(true)}>
              Connect to {connectionIsFor}
            </Button>
          )}
        </Card.Actions>
      </Card>
    </>
  );
};
