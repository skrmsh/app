/**
 * @format
 */

import React from 'react';
// Note: test renderer must be required after react-native.
import 'react-native';
import {
  BleError,
  Characteristic,
  ConnectionOptions,
  ConnectionPriority,
  Descriptor,
  Device,
  Service,
  Subscription,
} from 'react-native-ble-plx';
import renderer from 'react-test-renderer';
import { BleDevice } from '../components/bleDevice';

export const getDummyDevice = ({
  id = 'testMac',
  name = 'TestName',
}: Partial<Device> = {}): Device => {
  return {
    id: id,
    name: name,
    rssi: null,
    mtu: 0,
    manufacturerData: null,
    serviceData: null,
    serviceUUIDs: null,
    localName: null,
    txPowerLevel: null,
    solicitedServiceUUIDs: null,
    isConnectable: null,
    overflowServiceUUIDs: null,
    requestConnectionPriority: function (
      connectionPriority: ConnectionPriority,
      transactionId?: string | undefined,
    ): Promise<Device> {
      throw new Error('Function not implemented.');
    },
    readRSSI: function (transactionId?: string | undefined): Promise<Device> {
      throw new Error('Function not implemented.');
    },
    requestMTU: function (
      mtu: number,
      transactionId?: string | undefined,
    ): Promise<Device> {
      throw new Error('Function not implemented.');
    },
    connect: function (
      options?: ConnectionOptions | undefined,
    ): Promise<Device> {
      throw new Error('Function not implemented.');
    },
    cancelConnection: function (): Promise<Device> {
      throw new Error('Function not implemented.');
    },
    isConnected: function (): Promise<boolean> {
      throw new Error('Function not implemented.');
    },
    onDisconnected: function (
      listener: (error: BleError | null, device: Device) => void,
    ): Subscription {
      throw new Error('Function not implemented.');
    },
    discoverAllServicesAndCharacteristics: function (
      transactionId?: string | undefined,
    ): Promise<Device> {
      throw new Error('Function not implemented.');
    },
    services: function (): Promise<Service[]> {
      throw new Error('Function not implemented.');
    },
    characteristicsForService: function (
      serviceUUID: string,
    ): Promise<Characteristic[]> {
      throw new Error('Function not implemented.');
    },
    descriptorsForService: function (
      serviceUUID: string,
      characteristicUUID: string,
    ): Promise<Descriptor[]> {
      throw new Error('Function not implemented.');
    },
    readCharacteristicForService: function (
      serviceUUID: string,
      characteristicUUID: string,
      transactionId?: string | undefined,
    ): Promise<Characteristic> {
      throw new Error('Function not implemented.');
    },
    writeCharacteristicWithResponseForService: function (
      serviceUUID: string,
      characteristicUUID: string,
      valueBase64: string,
      transactionId?: string | undefined,
    ): Promise<Characteristic> {
      throw new Error('Function not implemented.');
    },
    writeCharacteristicWithoutResponseForService: function (
      serviceUUID: string,
      characteristicUUID: string,
      valueBase64: string,
      transactionId?: string | undefined,
    ): Promise<Characteristic> {
      throw new Error('Function not implemented.');
    },
    monitorCharacteristicForService: function (
      serviceUUID: string,
      characteristicUUID: string,
      listener: (
        error: BleError | null,
        characteristic: Characteristic | null,
      ) => void,
      transactionId?: string | undefined,
    ): Subscription {
      throw new Error('Function not implemented.');
    },
    readDescriptorForService: function (
      serviceUUID: string,
      characteristicUUID: string,
      descriptorUUID: string,
      transactionId?: string | undefined,
    ): Promise<Descriptor> {
      throw new Error('Function not implemented.');
    },
    writeDescriptorForService: function (
      serviceUUID: string,
      characteristicUUID: string,
      descriptorUUID: string,
      valueBase64: string,
      transactionId?: string | undefined,
    ): Promise<Descriptor> {
      throw new Error('Function not implemented.');
    },
  };
};

const defaultProps = {
  isConnected: true,
  device: getDummyDevice(),
  connect: () => {},
  disconnect: () => {},
};

it('renders correctly and matches snapshot', () => {
  const tree = renderer.create(<BleDevice {...defaultProps} />);
  expect(tree).toMatchSnapshot();
});
