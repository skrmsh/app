/**
 * @format
 */

import React from 'react';
// Note: test renderer must be required after react-native.
import 'react-native';
import renderer from 'react-test-renderer';
import { BleDevice } from '../components/bleDevice';
import { render, fireEvent } from '@testing-library/react-native';

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
      _connectionPriority: ConnectionPriority,
      _transactionId?: string | undefined,
    ): Promise<Device> {
      throw new Error('Function not implemented.');
    },
    readRSSI: function (_transactionId?: string | undefined): Promise<Device> {
      throw new Error('Function not implemented.');
    },
    requestMTU: function (
      _mtu: number,
      _transactionId?: string | undefined,
    ): Promise<Device> {
      throw new Error('Function not implemented.');
    },
    connect: function (
      _options?: ConnectionOptions | undefined,
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
      _listener: (error: BleError | null, device: Device) => void,
    ): Subscription {
      throw new Error('Function not implemented.');
    },
    discoverAllServicesAndCharacteristics: function (
      _transactionId?: string | undefined,
    ): Promise<Device> {
      throw new Error('Function not implemented.');
    },
    services: function (): Promise<Service[]> {
      throw new Error('Function not implemented.');
    },
    characteristicsForService: function (
      _serviceUUID: string,
    ): Promise<Characteristic[]> {
      throw new Error('Function not implemented.');
    },
    descriptorsForService: function (
      _serviceUUID: string,
      _characteristicUUID: string,
    ): Promise<Descriptor[]> {
      throw new Error('Function not implemented.');
    },
    readCharacteristicForService: function (
      _serviceUUID: string,
      _characteristicUUID: string,
      _transactionId?: string | undefined,
    ): Promise<Characteristic> {
      throw new Error('Function not implemented.');
    },
    writeCharacteristicWithResponseForService: function (
      _serviceUUID: string,
      _characteristicUUID: string,
      _valueBase64: string,
      _transactionId?: string | undefined,
    ): Promise<Characteristic> {
      throw new Error('Function not implemented.');
    },
    writeCharacteristicWithoutResponseForService: function (
      _serviceUUID: string,
      _characteristicUUID: string,
      _valueBase64: string,
      _transactionId?: string | undefined,
    ): Promise<Characteristic> {
      throw new Error('Function not implemented.');
    },
    monitorCharacteristicForService: function (
      _serviceUUID: string,
      _characteristicUUID: string,
      _listener: (
        error: BleError | null,
        characteristic: Characteristic | null,
      ) => void,
      _transactionId?: string | undefined,
    ): Subscription {
      throw new Error('Function not implemented.');
    },
    readDescriptorForService: function (
      _serviceUUID: string,
      _characteristicUUID: string,
      _descriptorUUID: string,
      _transactionId?: string | undefined,
    ): Promise<Descriptor> {
      throw new Error('Function not implemented.');
    },
    writeDescriptorForService: function (
      _serviceUUID: string,
      _characteristicUUID: string,
      _descriptorUUID: string,
      _valueBase64: string,
      _transactionId?: string | undefined,
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

it('calls disconnect when button is pressed', () => {
  const disconnectMock = jest.fn();
  const tree = render(
    <BleDevice {...defaultProps} disconnect={disconnectMock} />,
  );
  const disconnectButton = tree.getByTestId('disconnectButton');
  fireEvent.press(disconnectButton);
  expect(disconnectMock.mock.calls).toHaveLength(1);
  expect(disconnectMock.mock.calls[0][0]).toBe(defaultProps.device);
});

it('calls connect when button is pressed', () => {
  const connectMock = jest.fn();
  const tree = render(
    <BleDevice {...defaultProps} isConnected={false} connect={connectMock} />,
  );
  const connectButton = tree.getByTestId('connectButton');
  fireEvent.press(connectButton);
  expect(connectMock.mock.calls).toHaveLength(1);
  expect(connectMock.mock.calls[0][0]).toBe(defaultProps.device);
});

it('doesnt attempt to connect if already connected', () => {
  const fmock = jest.fn();
  const tree = render(<BleDevice {...defaultProps} connect={fmock} />);
  const connectButton = tree.getByTestId('connectButton');
  fireEvent.press(connectButton);
  expect(fmock).not.toHaveBeenCalled();
});
it('doesnt attempt to disconnect if already disconnected', () => {
  const fmock = jest.fn();
  const tree = render(
    <BleDevice {...defaultProps} isConnected={false} disconnect={fmock} />,
  );
  const disconnectButton = tree.getByTestId('disconnectButton');
  fireEvent.press(disconnectButton);
  expect(fmock).not.toHaveBeenCalled();
});
