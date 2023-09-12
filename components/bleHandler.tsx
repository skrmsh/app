import React, { useState } from 'react';
import { ActivityIndicator, Button, Text } from 'react-native-paper';

import { sendTimestamp, turnOffAllDevices } from '../utils';
import { BleDevice } from './bleDevice';
import { ErrorDialog } from './errorDialog';
import { Separator } from './seperator';
import SKBLEManager, { SKBLEDev } from '../utils/bleManager';

type BleHandlerProps = {
  setBleEnabled: (e: boolean) => void;
  bleEnabled: boolean;
  messageCallback: (e: string) => void;
  onCompletedCallback: () => void;
};

export const BleHandler = ({
  setBleEnabled,
  bleEnabled,
  messageCallback,
  onCompletedCallback,
}: BleHandlerProps) => {
  const [bleIsLoading, setBleIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  useState(() => {
    SKBLEManager.Instance.start();
    setBleEnabled(true);
  });

  return (
    <>
      <ErrorDialog
        showingError={!!errorMsg}
        setShowingError={(e: boolean) => {
          if (!e) {
            setErrorMsg('');
          }
        }}
        errorMsg={errorMsg}
      />
      <Separator />
      <Button
        mode="contained"
        onPress={() => {
          SKBLEManager.Instance.startScan();
        }}
        disabled={!bleEnabled}>
        Scan for Phasors
      </Button>
      <Separator />
      <Button
        onPress={() => {
          SKBLEManager.Instance.stopScan();
        }}
        disabled={!bleEnabled}
        mode="contained">
        Stop Scanning
      </Button>
      <Separator />
      <Button
        mode="contained"
        onPress={() => {
          setBleEnabled(false);
          SKBLEManager.Instance.stop();
        }}>
        Kill BLE
      </Button>
      <Text style={{ margin: 15 }}>
        Discovered Devices: {SKBLEManager.Instance.discoveredDevices.length}
      </Text>
      {SKBLEManager.Instance.discoveredDevices.length > 0 ? (
        <>
          <Separator />
          <Button
            mode="contained"
            onPress={() => {
              turnOffAllDevices();
            }}>
            Turn off all Devices
          </Button>
        </>
      ) : (
        <></>
      )}
      {bleIsLoading ? <ActivityIndicator size="large" /> : <></>}
      {SKBLEManager.Instance.discoveredDevices.map(device => (
        <>
          {device.name?.includes(
            'skrm',
          ) /* duplicate, checked by skbleman */ ? (
            <>
              <BleDevice
                device={device}
                isConnected={device.connectionState}
                connect={(d: SKBLEDev) => {
                  setBleIsLoading(true);
                  SKBLEManager.Instance.connectToDiscoveredDevice(d);
                  /*
                  connectUntilSuccess(
                    d,
                    addPhasorToConnectedDevices,
                    manager,
                    () => {
                      setTimeout(() => sendTimestamp(device), 1500);
                      addOnDisconnectCallback(manager, device, (e: Device) => {
                        setErrorMsg(
                          `Lost Connection to Phasor with ID: ${e.id}`,
                        );
                        removePhasorFromConnectedDevices(e);
                      });
                      setBleIsLoading(false);
                    },
                    messageCallback,
                  );
                  */
                }}
                disconnect={(d: SKBLEDev) => {
                  SKBLEManager.Instance.disconnectFromDevice(d);
                }}
              />
              <Separator />
            </>
          ) : (
            <></>
          )}
        </>
      ))}
      {SKBLEManager.Instance.connectedDevices.length > 0 && (
        <Button onPress={() => onCompletedCallback()}>Continue</Button>
      )}
    </>
  );
};
