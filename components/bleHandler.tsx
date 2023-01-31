import React, { useState } from 'react';
import { BleManager, Device } from 'react-native-ble-plx';
import { ActivityIndicator, Button, Text, useTheme } from 'react-native-paper';

import {
  connectUntilSuccess,
  disconnectFromDevice,
  killManager,
  killScan,
  scanForPhasors,
  scanUntilPhasorFound,
  sendTimestamp,
  startBluetooth,
} from '../utils';
import { BleDevice } from './bleDevice';
import { ErrorDialog } from './errorDialog';
import { Separator } from './seperator';

type BleHandlerProps = {
  manager: BleManager | undefined;
  setManager: (e: BleManager | undefined) => void;
  connectedDevices: Device[];
  setConnectedDevices: React.Dispatch<React.SetStateAction<Device[]>>;
  setBleEnabled: (e: boolean) => void;
  bleEnabled: boolean;
  messageCallback: (e: string) => void;
};

export const BleHandler = ({
  manager,
  setManager,
  connectedDevices,
  setConnectedDevices,
  setBleEnabled,
  bleEnabled,
  messageCallback,
}: BleHandlerProps) => {
  const [bleIsLoading, setBleIsLoading] = useState(false);
  const [showingError, setShowingError] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<Device[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  const addPhasorToDiscoveredDevices = (newdevice: Device) => {
    setDiscoveredDevices(oldarr =>
      !oldarr.map(device => device.id).includes(newdevice.id)
        ? [newdevice, ...oldarr]
        : [...oldarr],
    );
  };

  const addPhasorToConnectedDevices = (newdevice: Device) => {
    setConnectedDevices(olddevices =>
      !olddevices.map(device => device.id).includes(newdevice.id)
        ? [newdevice, ...olddevices]
        : [...olddevices],
    );
  };

  const removePhasorFromConnectedDevices = (deviceToBeRemoved: Device) => {
    console.log('not implemented!');
  };

  /*const finishScan =  () => {

  }*/

  return (
    <>
      <ErrorDialog
        showingError={showingError}
        setShowingError={setShowingError}
        errorMsg={errorMsg}
      />
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
          scanForPhasors(
            discoveredDevices,
            addPhasorToDiscoveredDevices,
            manager,
            setBleIsLoading,
          );
        }}
        disabled={!bleEnabled}>
        Scan for Phasors
      </Button>
      <Separator />
      <Button
        onPress={() => {
          killScan(manager, setBleIsLoading);
        }}
        disabled={!bleEnabled}>
        Stop Scanning
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
      <Text style={{ margin: 15 }}>
        Discovered Devices: {discoveredDevices.length}
      </Text>
      {bleIsLoading ? <ActivityIndicator size="large" /> : <></>}
      {discoveredDevices.map(device => (
        <>
          {device.name?.includes('skrm') ? (
            <>
              <BleDevice
                device={device}
                isConnected={connectedDevices
                  .map((e: Device) => e.id)
                  .includes(device.id)}
                connect={(d: Device) => {
                  setBleIsLoading(true);
                  connectUntilSuccess(
                    d,
                    addPhasorToConnectedDevices,
                    manager,
                    () => {
                      setTimeout(() => sendTimestamp(device), 1500);
                      setBleIsLoading(false);
                    },
                    messageCallback,
                  );
                }}
                disconnect={(d: Device) => {
                  disconnectFromDevice(d, setConnectedDevices, manager);
                }}
              />
              <Separator />
            </>
          ) : (
            <></>
          )}
        </>
      ))}
    </>
  );
};
