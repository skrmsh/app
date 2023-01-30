import { Buffer } from 'buffer';
import { PermissionsAndroid, Platform } from 'react-native';
import {
  BleError,
  BleManager,
  Characteristic,
  Device,
} from 'react-native-ble-plx';
import { PERMISSIONS, requestMultiple } from 'react-native-permissions';

const SERVICE_UUID = 'b9f96468-246b-4cad-a3e2-e4c282280852';
const WRITE_CHARACTERISTIC_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';
const READ_CHARACTERISTIC_UUID = 'beb5483f-36e1-4688-b7f5-ea07361b26a8';

export async function getBluetoothPermissionsAndroid() {
  if (Platform.OS === 'android') {
    await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ]).then(e => console.log(e));
  } else if (Platform.OS === 'ios') {
    requestMultiple([
      PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL,
      PERMISSIONS.IOS.LOCATION_ALWAYS,
      PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    ]).then(statuses => {
      console.log(
        'BLE Peripheral',
        statuses[PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL],
      );
      console.log('Location always', statuses[PERMISSIONS.IOS.LOCATION_ALWAYS]);
      console.log(
        'Location when in use',
        statuses[PERMISSIONS.IOS.LOCATION_WHEN_IN_USE],
      );
    });
  }
}

export async function scanUntilPhasorFound(
  setDiscoveredPeripherals: (e: Device[]) => void,
  manager: BleManager | undefined,
  setIsLoading: (e: boolean) => void,
) {
  setDiscoveredPeripherals([]);
  if (manager) {
    setIsLoading(true);
    manager.startDeviceScan(
      null,
      null,
      (error: BleError | null, device: Device | null) => {
        if (error) {
          console.log(error);
        } else if (device) {
          console.log(`Found Device: ${device?.id} ${device?.name}`);
          if (device?.name?.includes('skrm')) {
            console.log('Found a phasor!!');
            setDiscoveredPeripherals([device]);
            console.log('killing scan...');
            manager.stopDeviceScan();
            setIsLoading(false);
          }
        }
      },
    );
  } else {
    console.log('Manager has not been initialized yet!');
  }
}

export async function startBluetooth(setManager: (e: BleManager) => void) {
  await getBluetoothPermissionsAndroid();
  setManager(new BleManager());
}

export function disconnectFromDevice(
  device: Device,
  setConnectedDevices: (e: Device[]) => void,
  manager: BleManager | undefined,
) {
  if (!manager) {
    console.log('Manager has not been initialized');
    return;
  }
  console.log(`attempting to disconnect from ${device.id}`);
  manager.cancelDeviceConnection(device.id).then((e: Device) => {
    setConnectedDevices([]);
    console.log('Disconnected from', e.id);
  });
}

export async function connectUntilSuccess(
  device: Device,
  setConnectedDevices: (e: Device[]) => void,
  manager: BleManager | undefined,
  onConnectCallback: () => void,
  onMessageCallback: (e: string) => void,
) {
  if (!manager) {
    console.log('Manager has not been initialized');
    return;
  }
  var success = false;
  while (!success) {
    try {
      await manager.connectToDevice(device.id).then((e: Device) => {
        console.log('connected to', e.id);
        setConnectedDevices([e]);
        console.log('requesting services');
      });
      await device.requestMTU(512);
      await device.discoverAllServicesAndCharacteristics();
      device.monitorCharacteristicForService(
        SERVICE_UUID,
        READ_CHARACTERISTIC_UUID,
        (error: BleError | null, characteristic: Characteristic | null) => {
          characteristic?.read();
          if (characteristic?.value) {
            var data = new Buffer(characteristic?.value, 'base64').toString(
              'ascii',
            );
            onMessageCallback(data);
          }
        },
      );

      success = true;
      console.log('connection successful');
      onConnectCallback();
    } catch (e) {
      console.log('error', e);
    }
  }
}

export function sendTimestamp(device: Device) {
  const timestampData = `{"a":[1], "TS":${Math.floor(Date.now() / 1000)}}`;
  sendDataToPhasor(device, timestampData);
}

export function sendDataToPhasor(device: Device, data: string) {
  console.log(`sending ${data} to phasor ${device.id}`);
  const b64data = new Buffer(data).toString('base64');
  device.writeCharacteristicWithResponseForService(
    SERVICE_UUID,
    WRITE_CHARACTERISTIC_UUID,
    b64data,
  );
}

export function killManager(
  manager: BleManager | undefined,
  setManager: (e: BleManager | undefined) => void,
) {
  console.log('killing blemanager...');
  if (manager) {
    manager.destroy();
    setManager(undefined);
    console.log('kill successful');
  } else {
    console.log('manager not initialized!');
  }
}
