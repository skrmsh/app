import BleManager, {
  BleManagerDidUpdateValueForCharacteristicEvent,
  Peripheral,
} from 'react-native-ble-manager';

import { PERMISSIONS, requestMultiple } from 'react-native-permissions';
import {
  NativeEventEmitter,
  NativeModules,
  PermissionsAndroid,
  Platform,
} from 'react-native';

interface SKBLEDev {
  _peripheral: Peripheral | null;
  id: string;
  name: string;

  connectionState: boolean;
  connectedOnce: boolean;
}

class SKBLEManager {
  private static _instance: SKBLEManager;

  private bleServiceId = 'B9F96468-246B-4CAD-A3E2-E4C282280852';
  private bleReadCharId = 'BEB5483F-36E1-4688-B7F5-EA07361B26A8';
  private bleWriteCharId = 'BEB5483E-36E1-4688-B7F5-EA07361B26A8';

  private bleManagerModule = NativeModules.BleManager;
  private bleManagerEmitter = new NativeEventEmitter(this.bleManagerModule);

  public discoveredDevices: Array<SKBLEDev> = [];
  public connectedDevices: Array<SKBLEDev> = [];

  public discoCallback: Array<(dev: SKBLEDev) => void> = [];
  public recvCallback: (data: string) => void = e => {};

  public connectCallback: Array<(dev: SKBLEDev) => void> = [];
  public disconnectCallback: Array<(dev: SKBLEDev) => void> = [];

  public doDebugMock = false;
  private debugMockDevice: SKBLEDev = {
    _peripheral: null,
    id: 'CF509317-3B95-4A7B-A45A-C199C50B1D8D',
    name: 'skrmdebug032493',

    connectionState: false,
    connectedOnce: false,
  };

  private wasStarted = false;

  public constructor() {
    console.log('SKBLEManager: constructed');
    this.discoveredDevices = [];
    this.connectedDevices = [];
  }

  public static get Instance() {
    return this._instance || (this._instance = new SKBLEManager());
  }

  /* "user" functions */
  public start() {
    /* starts the ble stack, requests permissions, etc. */

    console.log('SKBLEManager: Requested start');

    if (this.wasStarted) return;
    this.wasStarted = true;

    SKBLEManager.requestPermissions();
    BleManager.start();
    this.bleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      this.ble_handleDiscoveredPeripheral,
    );
    this.bleManagerEmitter.addListener(
      'BleManagerDidUpdateValueForCharacteristic',
      this.ble_handleNotify,
    );
    this.bleManagerEmitter.addListener(
      'BleManagerConnectPeripheral',
      this.ble_handleConnect,
    );
    this.bleManagerEmitter.addListener(
      'BleManagerDisconnectPeripheral',
      this.ble_handleDisconnect,
    );

    // Creating interval to send keepalive
    setInterval(() => {
      SKBLEManager.Instance.sendToConnectedDevices(`{"a":[0]}`);
    }, 3000);
  }

  public stop() {
    /* stops the ble stack... todo: implement this */
  }

  public startScan() {
    console.log('SKBLEManager: Started scanning');
    this.discoveredDevices = []; // clearing old discovered devices

    // todo: .scan(seconds=0) ???
    BleManager.scan([], 10, false, {
      matchMode: 2,
      scanMode: 2,
      callbackType: 1,
    }).then(() => {});

    // <-- DEBUG CODE
    if (this.doDebugMock) {
      setTimeout(() => {
        SKBLEManager.Instance.discoveredDevices.push(this.debugMockDevice);
        SKBLEManager.Instance.discoCallback.forEach(cb =>
          cb(this.debugMockDevice),
        );
        console.log(
          'SKBLEManager: Pushed debug mock device to discovered devices',
        );
      }, 750);
    }
    // END OF DEBUG CODE -->
  }

  public stopScan() {
    BleManager.stopScan();
  }

  public connectToDiscoveredDevice(dev: SKBLEDev) {
    // <-- DEBUG CODE
    if (dev.id === this.debugMockDevice.id) {
      dev.connectionState = true;
      dev.connectedOnce = true;
      return;
    }
    // END DEBUG CODE -->

    /* TODO: Check if it is required to prevent re-connect
    if (this.connectedDevices.filter(c => c.id === dev.id).length > 0) {
      return;
    }
    */

    BleManager.connect(dev.id).then(val => {
      BleManager.isPeripheralConnected(dev.id, [this.bleServiceId]).then(
        val => {
          dev.connectionState = val;
          if (dev.connectionState) {
            BleManager.retrieveServices(dev.id, [this.bleServiceId]).then(e => {
              BleManager.startNotification(
                dev.id,
                this.bleServiceId,
                this.bleReadCharId,
              ).then(() => {
                BleManager.requestMTU(dev.id, 512);
              });
            });
            dev.connectedOnce = true;
            this.connectedDevices.push(dev);

            // Sending timestamp
            setTimeout(() => {
              SKBLEManager.Instance.sendToConnectedDevice(
                `{"a":[1], "TS":${Math.floor(Date.now() / 1000)}}`,
                dev,
              );
            }, 1000);
          }
        },
      );
    });

    return dev;
  }

  public disconnectFromDevice(dev: SKBLEDev) {
    console.log(
      `SKBLEManager: Disconnect from device "${dev.id}" was requested!`,
    );
    // <-- DEBUG CODE
    if (dev.id === this.debugMockDevice.id) {
      dev.connectionState = false;
      return;
    }
    // END DEBUG CODE -->

    BleManager.disconnect(dev.id, true).then(() => {
      dev.connectionState = false;
    }); // todo: check if force is required / good
  }

  public sendToConnectedDevices(data: string) {
    this.connectedDevices.forEach(d => {
      if (!d.connectionState) return;
      this.sendToConnectedDevice(data, d);
    });
  }

  public sendToConnectedDevice(data: string, device: SKBLEDev) {
    let databytes: Array<number> = [];
    for (var i = 0; i < data.length; i++) databytes.push(data.charCodeAt(i));

    if (databytes.length > 512) {
      throw Error('max 512 byte message allowed!');
    }

    BleManager.write(
      device.id,
      this.bleServiceId,
      this.bleWriteCharId,
      databytes,
      512,
    );
  }

  // Callback registration

  public onDeviceDiscovery(callback: (device: SKBLEDev) => void) {
    this.discoCallback.push(callback);
  }

  public onDataReceived(callback: (data: string) => void) {
    this.recvCallback = callback;
  }

  public onDeviceConnected(callback: (device: SKBLEDev) => void) {
    this.connectCallback.push(callback);
  }

  public onDeviceDisconnected(callback: (device: SKBLEDev) => void) {
    this.disconnectCallback.push(callback);
  }

  /* Actual ble callbacks */
  private ble_handleDiscoveredPeripheral(peripheral: Peripheral) {
    // Checking if discovered device might be a skirmish device
    if (!peripheral.advertising.localName?.startsWith('skrm')) return;

    // Already discovered
    var alreadyDiscovered = SKBLEManager.Instance.discoveredDevices.filter(
      e => e.id === peripheral.id,
    );
    if (alreadyDiscovered.length > 0) {
      // (updating their peripheral object)
      alreadyDiscovered.forEach(e => (e._peripheral = peripheral));
      return;
    }

    // Adding newly discovered device to our list
    var device: SKBLEDev = {
      _peripheral: peripheral,
      id: peripheral.id,
      name: peripheral.advertising.localName,
      connectionState: false,
      connectedOnce: false,
    };
    SKBLEManager.Instance.discoveredDevices.push(device);
    SKBLEManager.Instance.discoCallback.forEach(cb => cb(device));

    console.log(
      `SKBLEManager: Discovered new device ${device.name} @ ${device.id}`,
    );
  }

  private ble_handleNotify(
    data: BleManagerDidUpdateValueForCharacteristicEvent,
  ) {
    var dataString = [...data.value].map(e => String.fromCharCode(e)).join('');
    if (!!SKBLEManager.Instance.recvCallback)
      SKBLEManager.Instance.recvCallback(dataString);
  }

  private ble_handleConnect(data: any) {
    console.log('connect cb called', data);
    var matching_devices: Array<SKBLEDev> =
      SKBLEManager.Instance.discoveredDevices.filter(
        d => d.id === data.peripheral,
      );
    if (matching_devices.length !== 1) return;

    var matching_device = matching_devices[0];
    matching_device.connectionState = true;

    SKBLEManager.Instance.connectCallback.forEach(cb => cb(matching_device));

    console.log(`SKBLEManager: Connected to "${matching_device.name}"`);
  }

  private ble_handleDisconnect(data: any) {
    var matching_devices: Array<SKBLEDev> =
      SKBLEManager.Instance.discoveredDevices.filter(
        d => d.id === data.peripheral,
      );
    if (matching_devices.length !== 1) return;

    var matching_device = matching_devices[0];
    matching_device.connectionState = false;

    SKBLEManager.Instance.disconnectCallback.forEach(cb => cb(matching_device));

    console.log(`SKBLEManager: Disconnected from "${matching_device.name}"`);
  }

  /* Util functions */
  private static requestPermissions() {
    if (Platform.OS === 'android') {
      PermissionsAndroid.requestMultiple([
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
        console.log(
          'Location always',
          statuses[PERMISSIONS.IOS.LOCATION_ALWAYS],
        );
        console.log(
          'Location when in use',
          statuses[PERMISSIONS.IOS.LOCATION_WHEN_IN_USE],
        );
      });
    }
  }
}

export type { SKBLEDev };

export default SKBLEManager;
