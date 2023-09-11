import BleManager, {
    BleManagerDidUpdateValueForCharacteristicEvent,
    BleScanCallbackType,
    BleScanMatchMode,
    BleScanMode,
    Peripheral,
} from 'react-native-ble-manager';

import { PERMISSIONS, requestMultiple } from 'react-native-permissions';
import { NativeEventEmitter, NativeModules, PermissionsAndroid, Platform } from 'react-native';

interface DiscoDev {
    _peripheral: Peripheral;
    id: string;
    name: string;
}

interface ConnectedDevice {
    _peripheral: Peripheral;
    id: string;
    name: string;
    state: boolean;
}

class SKBLEManager {
    private static _instance: SKBLEManager;

    private bleServiceId = '2d1837c7-4192-4517-9666-a099b9ec23d9';
    private bleReadCharId = '0bc3eb1e-29d0-4d76-8e95-085b1b20995f';
    private bleWriteCharId = '806e8520-5a10-45af-a8ba-8e794befda95';

    private bleManagerModule = new NativeModules.BleManager;
    private bleManagerEmitter = new NativeEventEmitter(this.bleManagerModule);

    public discoveredDevices: Array<DiscoDev> = [];
    private connectedDevices: Array<ConnectedDevice> = [];

    private discoCallback: (dev: DiscoDev) => void = (dev) => {};
    private recvCallback: (data: string) => void = (data) => {};

    private constructor() {
    }

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    /* "user" functions */
    public start() {
        /* starts the ble stack, requests permissions, etc. */
        SKBLEManager.requestPermissions();
        BleManager.start();
        this.bleManagerEmitter.addListener(
            'BleManagerDiscoverPeripheral',
            this.ble_handleDiscoveredPeripheral
        );
        this.bleManagerEmitter.addListener(
            'BleManagerDidUpdateValueForCharacteristic',
            this.ble_handleNotify
        );
    }

    public startScan() {
        this.discoveredDevices = []; // clearing old discovered devices

        // todo: .scan(seconds=0) ???
        BleManager.scan([], 0, false, {
            matchMode: BleScanMatchMode.Sticky,
            scanMode: BleScanMode.LowLatency,
            callbackType: BleScanCallbackType.AllMatches
        }).then(() => {});
    }

    public stopScan() {
        BleManager.stopScan()
    }

    public connectToDiscoveredDevice(dev: DiscoDev) {
        if (this.connectedDevices.filter(c => c.id === dev.id).length > 0) {
            return;
        }

        var con: ConnectedDevice = {
            _peripheral: dev._peripheral,
            id: dev.id,
            name: dev.name,
            state: false
        };

        BleManager.connect(con.id).then(val => {
            BleManager.isPeripheralConnected(con.id, []).then(val => {
                con.state = val;
                if (con.state) {
                    BleManager.retrieveServices(con.id, [this.bleServiceId]).then(e => {
                        BleManager.requestMTU(con.id, 512);
                        BleManager.startNotification(con.id, this.bleServiceId, this.bleReadCharId);
                    })
                }
            })
        })

        this.connectedDevices.push(con);

        return con;
    }

    public onDeviceDiscovery(callback: (device: DiscoDev) => void) {
        this.discoCallback = callback;
    }

    public onDataReceived(callback: (data: string) => void) {
        this.recvCallback = callback;
    }

    public sendToConnectedDevices(data: string) {
        let databytes: Array<number> = [];
        for (var i = 0; i < data.length; i ++) databytes.push(data.charCodeAt(i));

        if (databytes.length > 512) {
            throw Error("max 512 byte message allowed!");
        }

        this.connectedDevices.forEach(d => {
            if (!d.state) return;
            BleManager.write(d.id, this.bleServiceId, this.bleWriteCharId, databytes);
        })
    }

    /* Actual ble callbacks */
    private ble_handleDiscoveredPeripheral( peripheral: Peripheral ) {
        // Checking if discovered device might be a skirmish device
        if (!peripheral.advertising.localName?.startsWith("skrm")) return;

        // Already discovered
        var alreadyDiscovered = this.discoveredDevices.filter(e => e.id === peripheral.id);
        if (alreadyDiscovered.length > 0) {
            // (updating their peripheral object)
            alreadyDiscovered.forEach(e => e._peripheral = peripheral);
            return;
        }

        // Adding newly discovered device to our list
        var device = {
            _peripheral: peripheral,
            id: peripheral.id,
            name: peripheral.advertising.localName
        }
        alreadyDiscovered.push(device);
        this.discoCallback(device);
    }

    private ble_handleNotify( data: BleManagerDidUpdateValueForCharacteristicEvent ) {

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
                console.log('Location always', statuses[PERMISSIONS.IOS.LOCATION_ALWAYS]);
                console.log(
                'Location when in use',
                statuses[PERMISSIONS.IOS.LOCATION_WHEN_IN_USE],
                );
            });
        }
    }
}

export default SKBLEManager;