import React from 'react';
import { Device } from 'react-native-ble-plx';
import { Button, Card, Text } from 'react-native-paper';

type BleConnectionProps = {
  connectionIsFor: string;
  onConnectCallback: (device: Device) => void;
  onDisconnectCallback: () => void;
};

export const BleConnection = ({
  connectionIsFor,
}: BleConnectionProps): JSX.Element => {
  return (
    <>
      <Card>
        <Card.Title title={`${connectionIsFor}`} />
        <Card.Cover source={{ uri: 'https://picsum.photos/700' }} />
        <Card.Actions>
          <Button>Cancel</Button>
          <Button>Ok</Button>
        </Card.Actions>
      </Card>
    </>
  );
};
