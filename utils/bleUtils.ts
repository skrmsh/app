import {PermissionsAndroid} from 'react-native';
import {BleError, BleManager, Device} from 'react-native-ble-plx';
import {Buffer} from 'buffer';

export async function getBluetoothPermissionsAndroid() {
  await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
  ]).then(e => console.log(e));
}
/* decode b64:

const buffer = new Buffer(characteristic.value, 'base64');
const bufStr = buffer.toString();
*/

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

export function connectToDevice(
  device: Device,
  connectedDeviceIDs: string[],
  setConnectedDeviceIDs: (e: string[]) => void,
  connectedDevice: Device,
  setConnectedDevice: (e: Device) => void,
  manager: BleManager | undefined,
) {
  if (!manager) {
    console.log('Manager has not bee initialized');
    return;
  }
  console.log(`attempting to connect to ${device.id}`);
  manager
    .connectToDevice(device.id)
    .then((e: Device) => {
      console.log('connected to', e.id);
      setConnectedDeviceIDs([e.id, ...connectedDeviceIDs]);
      setConnectedDevice(e);
    })
    .catch(e => console.log('ERR', e));
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
  callback: () => void,
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
        e.discoverAllServicesAndCharacteristics();
      });
      success = true;
      console.log('connection successful');
      callback();
    } catch (e) {
      console.log('errror', e);
    }
  }
}

export function sendTimestamp(device: Device) {
  const timestampData = `{"a":[1], "TS":${Math.floor(Date.now() / 1000)}}`;
  const b64timestamp = new Buffer(timestampData).toString('base64');
  device.writeCharacteristicWithResponseForService(
    'b9f96468-246b-4cad-a3e2-e4c282280852',
    'beb5483e-36e1-4688-b7f5-ea07361b26a8',
    b64timestamp,
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
