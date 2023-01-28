import React from 'react';
import { Device } from 'react-native-ble-plx';
import { Button, Card, Text } from 'react-native-paper';
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
  return (
    <>
      <Card key={device.id} style={getStyles().cardcontent}>
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
        </Card.Content>
        <Card.Cover
          style={getStyles().image}
          source={{
            uri: 'https://github.com/skrmsh/skirmish-assets/raw/main/logo/Logo_PhaserBlackOnBackground.png',
          }}
        />
        <Card.Actions key={'connect'}>
          <Button
            mode="contained"
            key={'bruteforceconnect'}
            onPress={() => connect(device)}
            disabled={isConnected}>
            Bruteforce Connect
          </Button>
        </Card.Actions>
        <Card.Actions key={'disconnect'}>
          <Button
            key={'disconnect'}
            onPress={() => disconnect(device)}
            disabled={!isConnected}>
            Disconnect
          </Button>
        </Card.Actions>
      </Card>
    </>
  );
};
