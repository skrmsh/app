import { Device } from 'react-native-ble-plx';

export function removeDeviceFromListOld(list: Device[], device: Device) {
  var filteredArray = list.filter((d: Device) => d.id !== device.id);
  return filteredArray;
}

export function hashString(stringToHash: string) {
  var hash = 0,
    i,
    chr;
  if (stringToHash.length === 0) return hash;
  for (i = 0; i < stringToHash.length; i++) {
    chr = stringToHash.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  console.log(`hashed ${stringToHash} to ${hash}`);
  return hash;
}
