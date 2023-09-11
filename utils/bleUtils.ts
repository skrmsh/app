
/*
export function disconnectFromDevice(
  device: Device,
  removeDeviceFromConnectedDevices: (e: Device) => void,
  manager: BleManager | undefined,
) {
  if (!manager) {
    console.log('Manager has not been initialized');
    return;
  }
  console.log(`attempting to disconnect from ${device.id}`);
  manager.cancelDeviceConnection(device.id).then((e: Device) => {
    removeDeviceFromConnectedDevices(device);
    console.log('Disconnected from', e.id);
  });
}
*/

import SKBLEManager from "./bleManager";

export function sendTimestamp() {
  const timestampData = `{"a":[1], "TS":${Math.floor(Date.now() / 1000)}}`;
  SKBLEManager.Instance.sendToConnectedDevices(timestampData);
}

export function sendKeepAlive() {
  SKBLEManager.Instance.sendToConnectedDevices(`{"a":[0]}`);
}

export function turnOffAllDevices() {
  SKBLEManager.Instance.sendToConnectedDevices(`{"a":[15]}`);
}
