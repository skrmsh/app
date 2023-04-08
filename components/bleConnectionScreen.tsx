import React from 'react';
import { View } from 'react-native';
import { BleConnection } from '.';

type BleConnectionScreenProps = {};
export const BleConnectionScreen =
  ({}: BleConnectionScreenProps): JSX.Element => {
    return (
      <>
        <View style={{ margin: 15, height: '100%' }}>
          <BleConnection
            connectionIsFor="Phasor"
            onConnectCallback={() => {}}
            onDisconnectCallback={() => {}}
          />
        </View>
      </>
    );
  };
