import { Device } from 'react-native-ble-plx';

export const addDeviceToList = (
  setter: (renewer: (olddevices: Device[]) => Device[]) => void,
  device: Device,
) => {
  setter(oldarr =>
    !oldarr.map(device => device.id).includes(device.id)
      ? [device, ...oldarr]
      : [...oldarr],
  );
};
