import { Device } from 'react-native-ble-plx';

export function removeDeviceFromList(list: Device[], device: Device) {
  var filteredArray = list.filter((d: Device) => d.id !== device.id);
  return filteredArray;
}
