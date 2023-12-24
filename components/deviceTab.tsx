import { ScrollView, View } from 'react-native';
import { getStyles } from '../utils';
import { Card, Text, useTheme } from 'react-native-paper';
import { useCallback, useEffect, useState } from 'react';
import SKBLEManager from '../utils/bleManager';
import SKConst from '../utils/const';

function DeviceTab() {
  const theme = useTheme();

  const [knownStatus, setKnownStatus] = useState<any>({});
  const [knownDevices, setKnownDevices] = useState<Array<String>>([]);

  const onBleDataReceived = useCallback((e: string) => {
    console.log('ble recv', e);
    try {
      let data = JSON.parse(e);
      if (
        data.a?.includes(SKConst.ACTION_HW_STATUS) &&
        !!data.d_id &&
        !!data.battery
      ) {
        let device = data.d_id;
        let battery = data.battery;
        let newStatus = knownStatus;
        newStatus[device] = {
          battery: battery,
        };
        setKnownStatus(newStatus);
        setKnownDevices(Object.keys(newStatus));
      }
    } catch (error) {
      console.log('errore', error);
    }
  }, []);

  useEffect(() => {
    SKBLEManager.Instance.onDataReceived(onBleDataReceived);
    /*TEST / DEV Code*/
    setTimeout(() => {
      onBleDataReceived(
        `{"a": [${SKConst.ACTION_HW_STATUS}], "battery": 0.9, "d_id": "skrmphsr00a59948"}`,
      );
    }, 500);
    setTimeout(() => {
      onBleDataReceived(
        `{"a": [${SKConst.ACTION_HW_STATUS}], "battery": 0.3, "d_id": "skrmvest00a59948"}`,
      );
    }, 1000);
    setTimeout(() => {
      onBleDataReceived(
        `{"a": [${SKConst.ACTION_HW_STATUS}], "battery": 0.4, "d_id": "skrmvest00a59948"}`,
      );
    }, 5000);
  }, []);

  useEffect(() => {
    console.log('known status!', knownStatus);
  }, [knownStatus]);

  return (
    <>
      <ScrollView>
        <View style={getStyles(theme).mT10}>
          {knownDevices.map(device => (
            <Card
              key={knownDevices.indexOf(device)}
              style={{
                ...getStyles(theme).cardLarge,
                ...getStyles(theme).mT10,
              }}>
              <Text variant="titleLarge" style={getStyles(theme).heading}>
                {
                  { skrmphsr: 'Phaser', skrmvest: 'Vest' }[
                    device.substring(0, 8)
                  ]
                }
              </Text>
              <View style={getStyles(theme).mL10}>
                <Text>({device.substring(8)})</Text>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </>
  );
}

export default DeviceTab;
