import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Modal,
  Portal,
  Text,
  useTheme,
} from 'react-native-paper';
import {
  getStyles,
  sendKeepAlive,
  sendTimestamp,
} from '../utils';
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

  const [deviceToConnectTo, setDeviceToConnectTo] = useState<SKBLEDev>();
  const [currentlyLoading, setCurrentlyLoading] = useState(false);

  const [discoveredDevices, setDiscoveredDevices] = useState<Array<SKBLEDev>>([]);

  const theme = useTheme();

  useEffect(() => {
    SKBLEManager.Instance.onDeviceDiscovery((device) => {
      setDiscoveredDevices([...SKBLEManager.Instance.discoveredDevices]);
    });
  }, []);

  useEffect(() => {
    console.log("currently known devices: ", discoveredDevices);
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
          {discoveredDevices.map((device) => (
              <>
                <Button
                  key={device.id}
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
            )
          )}

          <Button
            key="connect_button"
            disabled={!deviceToConnectTo}
            onPress={() => {
              if (deviceToConnectTo) {
                setCurrentlyLoading(true);
                SKBLEManager.Instance.connectToDiscoveredDevice(deviceToConnectTo);
                setConnectionPopupVisible(false);
                setCurrentlyLoading(false);
              }
            }}>
            Connect
          </Button>
          <Button
            key="cancel_button"
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
          {/*!!isConnectedTo ? (
            <Text>Connected to {isConnectedTo.name}</Text>
          ) : (*/
            <Text>Not Connected!</Text>
          /*)*/}
        </Card.Content>
        <Card.Actions>
          {/*!!isConnectedTo ? (
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
          ) : (*/
            <Button onPress={() => setConnectionPopupVisible(true)}>
              Connect to {connectionIsFor}
            </Button>
          /*)*/}
        </Card.Actions>
      </Card>
      }
    </>
  );
};
