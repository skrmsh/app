import React, { useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';
import {
    Button as PaperButton,
    Card,
    Text as PaperText
} from 'react-native-paper';
import {
    connectUntilSuccess,
    disconnectFromDevice,
    killManager,
    scanUntilPhasorFound,
    sendTimestamp,
    startBluetooth
} from '../utils';
import { Separator } from './seperator';

type BleHandlerProps = {
  manager: BleManager | undefined;
  setManager: (e: BleManager | undefined) => void;
  connectedDevices: Device[];
  setConnectedDevices: (e: Device[]) => void;
};

export const BleHandler = ({
  manager,
  setManager,
  connectedDevices,
  setConnectedDevices,
}: BleHandlerProps) => {
  const [bleIsLoading, setBleIsLoading] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<Device[]>([]);

  return (
    <>
      <Button onPress={() => startBluetooth(setManager)} title={'Start BLE'} />
      <Separator />
      <Button
        title="Scan in Sync"
        onPress={() =>
          scanUntilPhasorFound(setDiscoveredDevices, manager, setBleIsLoading)
        }
      />
      <Separator />
      <Button
        title="Kill BLE PLX"
        onPress={() => killManager(manager, setManager)}
      />
      <Text style={{margin: 15}}>
        Discovered Devices: {discoveredDevices.length}
      </Text>
      {bleIsLoading ? <ActivityIndicator size="large" /> : <></>}
      {discoveredDevices.map(device => (
        <>
          {device.name?.includes('skrm') ? (
            <>
              <Separator />
              <Card key={device.id} style={styles.cardcontent}>
                <Card.Content>
                  <PaperText variant="titleLarge">
                    Device ID: {device.id}
                  </PaperText>
                  <PaperText variant="bodyMedium">
                    {device.name ? device.name : 'no name supplied'}
                  </PaperText>
                  <PaperText variant="bodyMedium">
                    {connectedDevices
                      .map((e: Device) => e.id)
                      .includes(device.id)
                      ? 'Connected'
                      : 'Not Connected'}
                  </PaperText>
                </Card.Content>
                <Card.Cover
                  style={styles.image}
                  source={{
                    uri: 'https://github.com/skrmsh/skirmish-assets/raw/main/logo/Logo_PhaserBlackOnBackground.png',
                  }}
                />
                <Card.Actions>
                  <PaperButton
                    key={'bruteforceconnect'}
                    onPress={() => {
                      connectUntilSuccess(
                        device,
                        setConnectedDevices,
                        manager,
                        () => {
                          setBleIsLoading(false);
                        },
                      );
                      setBleIsLoading(true);
                    }}
                    disabled={connectedDevices
                      .map((e: Device) => e.id)
                      .includes(device.id)}>
                    Bruteforce Connect
                  </PaperButton>
                  <PaperButton
                    key={'disconnect'}
                    onPress={() => {
                      disconnectFromDevice(
                        device,
                        setConnectedDevices,
                        manager,
                      );
                    }}
                    disabled={
                      !connectedDevices
                        .map((e: Device) => e.id)
                        .includes(device.id)
                    }>
                    Disconnect
                  </PaperButton>
                </Card.Actions>
                <Card.Actions>
                  <PaperButton
                    key={'timestamp'}
                    onPress={() => {
                      if (
                        connectedDevices
                          .map((e: Device) => e.id)
                          .includes(device.id)
                      ) {
                        sendTimestamp(device);
                      } else {
                        console.log('Not connected');
                      }
                    }}
                    disabled={
                      !connectedDevices
                        .map((e: Device) => e.id)
                        .includes(device.id)
                    }>
                    Send Timestamp
                  </PaperButton>
                </Card.Actions>
              </Card>
            </>
          ) : (
            <></>
          )}
        </>
      ))}
    </>
  );
};
const styles = StyleSheet.create({
  cardcontent: {
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  image: {
    margin: 6,
  },
});
