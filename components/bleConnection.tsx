import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Modal,
  Portal,
  Text,
  useTheme,
} from 'react-native-paper';
import { getStyles, sendKeepAlive, sendTimestamp } from '../utils';
import { LoadingDialog } from './loadingDialog';
import { View } from 'react-native';
import SKBLEManager, { SKBLEDev } from '../utils/bleManager';

type BleConnectionProps = {
  connectionIsFor: string;
  onConnectCallback: (device: SKBLEDev) => void;
  onDisconnectCallback: (device: SKBLEDev) => void;
  errorMessageSetter: (e: string) => void;
  messageCallback: (message: string) => void;
};

export const BleConnection = ({
  connectionIsFor,
  onConnectCallback,
  errorMessageSetter,
  messageCallback,
}: BleConnectionProps): JSX.Element => {
  const [connectionPopupVisible, setConnectionPopupVisible] = useState(false);

  const [selectedDevice, setSelectedDevice] = useState<SKBLEDev>();
  const [currentlyLoading, setCurrentlyLoading] = useState(false);

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
    console.log('currently known devices: ', discoveredDevices);
  }, [discoveredDevices]);

  useEffect(() => {
    if (connectionPopupVisible) {
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
            <>
              <Button
                key={device.id}
                icon="pistol"
                mode={
                  selectedDevice?.id === device.id ? 'contained' : 'outlined'
                }
                onPress={() => {
                  setSelectedDevice(
                    selectedDevice?.id === device.id ? undefined : device,
                  );
                }}>
                {device.name}
              </Button>
            </>
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
      {
        <Card style={getStyles(theme).connectionCard}>
          <Card.Title title={`${connectionIsFor} Connection`} />
          <Card.Content>
            {selectedDevice?.connectionState ? (
              <Text>Connected to {selectedDevice.name}</Text>
            ) : (
              <Text>Not Connected!</Text>
            )}
          </Card.Content>
          <Card.Actions>
            {selectedDevice?.connectionState ? (
              <Button
                onPress={() => {
                  SKBLEManager.Instance.disconnectFromDevice(selectedDevice);
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
      }
    </>
  );
};
