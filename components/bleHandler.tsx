import React, {useState} from 'react';
import {ActivityIndicator, Platform, StyleSheet, Text} from 'react-native';
import {BleManager, Device} from 'react-native-ble-plx';
import {Button, Card, Text as PaperText} from 'react-native-paper';
import {
  connectUntilSuccess,
  disconnectFromDevice,
  killManager,
  scanUntilPhasorFound,
  sendTimestamp,
  startBluetooth,
} from '../utils';
import {Separator} from './seperator';

type BleHandlerProps = {
  manager: BleManager | undefined;
  setManager: (e: BleManager | undefined) => void;
  connectedDevices: Device[];
  setConnectedDevices: (e: Device[]) => void;
  showError: (e: string) => void;
  setBleEnabled: (e: boolean) => void;
  bleEnabled: boolean;
  setDiscoveredDevices: (e: Device[]) => void;
  discoveredDevices: Device[];
};

export const BleHandler = ({
  manager,
  setManager,
  connectedDevices,
  setConnectedDevices,
  showError,
  setBleEnabled,
  bleEnabled,
  setDiscoveredDevices,
  discoveredDevices,
}: BleHandlerProps) => {
  const [bleIsLoading, setBleIsLoading] = useState(false);

  return (
    <>
      <Button
        mode="contained"
        onPress={() => {
          startBluetooth(setManager);
          setBleEnabled(true);
        }}>
        Start BLE
      </Button>
      <Separator />
      <Button
        mode="contained"
        onPress={() => {
          if (bleEnabled) {
            scanUntilPhasorFound(
              setDiscoveredDevices,
              manager,
              setBleIsLoading,
            );
          } else {
            console.log('Ble not enabled');
            showError('Please start BLE first!');
          }
        }}>
        Scan for Phasors
      </Button>
      <Separator />
      <Button
        mode="contained"
        onPress={() => {
          killManager(manager, setManager);
          setConnectedDevices([]);
          setDiscoveredDevices([]);
          setBleEnabled(false);
        }}>
        Kill BLE
      </Button>
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
                  <PaperText variant="titleLarge" key={'deviceid'}>
                    Device ID: {device.id}
                  </PaperText>
                  <PaperText variant="bodyMedium" key={'devicename'}>
                    {device.name ? device.name : 'no name supplied'}
                  </PaperText>
                  <PaperText variant="bodyMedium" key={'connectionstatus'}>
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
                <Card.Actions key={'connect'}>
                  <Button
                    mode="contained"
                    key={'bruteforceconnect'}
                    onPress={() => {
                      connectUntilSuccess(
                        device,
                        setConnectedDevices,
                        manager,
                        () => {
                          setTimeout(() => sendTimestamp(device), 1500)
                          setBleIsLoading(false);
                        },
                      );
                      setBleIsLoading(true);
                    }}
                    disabled={connectedDevices
                      .map((e: Device) => e.id)
                      .includes(device.id)}>
                    Bruteforce Connect
                  </Button>
                </Card.Actions>
                <Card.Actions key={'disconnect'}>
                  <Button
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
                  </Button>
                </Card.Actions>
                <Card.Actions key={'timestamp'}>
                  <Button
                    key={'timestamp'}
                    onPress={() => {
                      if (
                        connectedDevices
                          .map((e: Device) => e.id)
                          .includes(device.id)
                      ) {
                        sendTimestamp(device);
                      } else {
                        console.log('Not connected to device');
                        showError('Not connected to Device');
                      }
                    }}
                    disabled={
                      !connectedDevices
                        .map((e: Device) => e.id)
                        .includes(device.id)
                    }>
                    Send Timestamp
                  </Button>
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
