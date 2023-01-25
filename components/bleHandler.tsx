import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';
import {
  ActivityIndicator, Button,
  Card,
  Text
} from 'react-native-paper';
import {
  connectUntilSuccess,
  disconnectFromDevice,
  killManager,
  scanUntilPhasorFound,
  sendTimestamp,
  startBluetooth
} from '../utils';
import { ErrorDialog } from './errorDialog';
import { Separator } from './seperator';

type BleHandlerProps = {
  manager: BleManager | undefined;
  setManager: (e: BleManager | undefined) => void;
  connectedDevices: Device[];
  setConnectedDevices: (e: Device[]) => void;
  setBleEnabled: (e: boolean) => void;
  bleEnabled: boolean;
  setDiscoveredDevices: (e: Device[]) => void;
  discoveredDevices: Device[];
  messageCallback: (e: string) => void;
};

export const BleHandler = ({
  manager,
  setManager,
  connectedDevices,
  setConnectedDevices,
  setBleEnabled,
  bleEnabled,
  setDiscoveredDevices,
  discoveredDevices,
  messageCallback,
}: BleHandlerProps) => {
  const [bleIsLoading, setBleIsLoading] = useState(false);
  const [showingError, setShowingError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  

  return (
    <>
      <ErrorDialog showingError={showingError} setShowingError={setShowingError} errorMsg={errorMsg}/>
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
            setErrorMsg('Please start BLE first!');
            setShowingError(true);
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
                  <Text variant="titleLarge" key={'deviceid'}>
                    Device ID: {device.id}
                  </Text>
                  <Text variant="bodyMedium" key={'devicename'}>
                    {device.name ? device.name : 'no name supplied'}
                  </Text>
                  <Text variant="bodyMedium" key={'connectionstatus'}>
                    {connectedDevices
                      .map((e: Device) => e.id)
                      .includes(device.id)
                      ? 'Connected'
                      : 'Not Connected'}
                  </Text>
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
                          setTimeout(() => sendTimestamp(device), 1500);
                          setBleIsLoading(false);
                        },
                        messageCallback,
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

                        setErrorMsg('Not connected to device!');
                        setShowingError(true);
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
