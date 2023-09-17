import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Modal,
  Portal,
  Text,
  useTheme,
} from 'react-native-paper';
import { getStyles } from '../utils';
import { LoadingDialog } from './loadingDialog';
import SKBLEManager, { SKBLEDev } from '../utils/bleManager';

type BleConnectionProps = {
  connectionIsFor: string;
};

export const BleConnection = ({
  connectionIsFor,
}: BleConnectionProps): JSX.Element => {
  const [connectionPopupVisible, setConnectionPopupVisible] = useState(false);

  const [currentlyLoading, setCurrentlyLoading] = useState(false);

  const [selectedDevice, setSelectedDevice] = useState<SKBLEDev>();
  const [connectionState, setConnectionState] = useState<boolean>(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<Array<SKBLEDev>>(
    [],
  );

  const theme = useTheme();

  useEffect(() => {
    SKBLEManager.Instance.onDeviceDiscovery(device => {
      setDiscoveredDevices([...SKBLEManager.Instance.discoveredDevices]);
    });
  }, []);

  useEffect(() => {
    if (!!!selectedDevice) return;
    SKBLEManager.Instance.onDeviceConnected(device => {
      console.log(
        `bleConnection was informed that ${device.name} was connected`,
      );
      if (device.id === selectedDevice.id) {
        setConnectionState(true);
      }
    });
    SKBLEManager.Instance.onDeviceDisconnected(device => {
      console.log(
        `bleConnection was informed that ${device.name} was disconnected`,
      );
      if (device.id === selectedDevice.id) {
        setConnectionState(false);
      }
    });
  }, [selectedDevice]);

  useEffect(() => {
    console.log('currently known devices: ', discoveredDevices);
  }, [discoveredDevices]);

  useEffect(() => {
    if (connectionPopupVisible) {
      setSelectedDevice(undefined);
      SKBLEManager.Instance.startScan();
    } else {
      SKBLEManager.Instance.stopScan();
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
          {discoveredDevices.map(device => (
            <Button
              key={device.id}
              icon="pistol"
              mode={selectedDevice?.id === device.id ? 'contained' : 'outlined'}
              onPress={() => {
                setSelectedDevice(
                  selectedDevice?.id === device.id ? undefined : device,
                );
                setConnectionState(false);
              }}>
              {device.name}
            </Button>
          ))}

          <Button
            disabled={!selectedDevice}
            onPress={() => {
              if (selectedDevice) {
                setCurrentlyLoading(true);
                SKBLEManager.Instance.connectToDiscoveredDevice(selectedDevice);
                setConnectionPopupVisible(false);
                setCurrentlyLoading(false);
              }
            }}>
            Connect
          </Button>
          <Button
            onPress={() => {
              setConnectionPopupVisible(false);
            }}>
            Cancel
          </Button>
        </Modal>
      </Portal>

      <Card style={getStyles(theme).connectionCard}>
        <Card.Title title={`${connectionIsFor} Connection`} />
        <Card.Content>
          {connectionState ? (
            <Text>Connected to {selectedDevice?.name}</Text>
          ) : (
            <Text>Not Connected!</Text>
          )}
        </Card.Content>
        <Card.Actions>
          {connectionState ? (
            <Button
              onPress={() => {
                SKBLEManager.Instance.disconnectFromDevice(selectedDevice!);
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
