import React from 'react';
import { Device } from 'react-native-ble-plx';
import { Button, Card, Text, useTheme } from 'react-native-paper';
import { getStyles } from '../utils';
type BleDeviceProps = {
  device: Device;
  isConnected: boolean;
  connect: (d: Device) => void;
  disconnect: (d: Device) => void;
};
export const BleDevice = ({
  device,
  isConnected,
  connect,
  disconnect,
}: BleDeviceProps) => {
  const theme = useTheme();
  return (
    <>
      <Card key={device.id} style={getStyles(theme).cardcontent}>
        <Card.Content>
          <Text variant="titleLarge" key={'deviceid'}>
            Device ID: {device.id}
          </Text>
          <Text variant="bodyMedium" key={'devicename'}>
            {device.name ? device.name : 'no name supplied'}
          </Text>
          <Text variant="bodyMedium" key={'connectionstatus'}>
            {isConnected ? 'Connected' : 'Not Connected'}
          </Text>
          <Card.Actions key={'connect'}>
            <Button
              mode="contained"
              key={'bruteforceconnect'}
              onPress={() => connect(device)}
              disabled={isConnected}
              testID={'connectButton'}>
              Connect
            </Button>
          </Card.Actions>
          <Card.Actions key={'disconnect'}>
            <Button
              key={'disconnect'}
              onPress={() => disconnect(device)}
              disabled={!isConnected}
              testID={'disconnectButton'}>
              Disconnect
            </Button>
          </Card.Actions>
        </Card.Content>
      </Card>
    </>
  );
};
