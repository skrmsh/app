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

export function getHTTPUrl(serverHost: string, secureConnection: boolean) {
  console.log('Generating HTTP URL with', serverHost, secureConnection);
  return `http${secureConnection ? 's' : ''}://${serverHost}`;
}
export function getWSUrl(serverHost: string, secureConnection: boolean) {
  console.log('Generating WS URL with', serverHost, secureConnection);
  return `ws${secureConnection ? 's' : ''}://${serverHost}`;
}

/**
 * Checks if a given string is a valid server address.
 * For example olel.de:8081 or 192.168.0.75 are valid,
 * https://example.com or 10.0.0.1/foo are not valid!
 * @param serverHost the address to check
 * @returns true when the address is valid
 */
export function isValidHost(serverHost: string): boolean {
  return (
    /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]).){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(:\d+)?$/.test(
      serverHost,
    ) ||
    /^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])(:\d+)?$/.test(
      serverHost,
    )
  );
}
