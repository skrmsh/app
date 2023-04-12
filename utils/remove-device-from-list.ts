import { Device } from 'react-native-ble-plx';
import { removeDeviceFromListOld } from './helperFunctions';

export const removeDeviceFromList = (
  setter: (renewer: (olddevices: Device[]) => Device[]) => void,
  device: Device,
) => {
  setter((olddevices: Device[]) => removeDeviceFromListOld(olddevices, device));
};
