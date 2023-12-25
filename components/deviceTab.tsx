import { ScrollView, View } from 'react-native';
import { getStyles } from '../utils';
import { Button, Card, ProgressBar, Text, useTheme } from 'react-native-paper';
import { useCallback, useEffect, useState } from 'react';
import SKBLEManager, { SKBLEDev } from '../utils/bleManager';
import SKConst from '../utils/const';
import ColorPicker from 'react-native-wheel-color-picker';

function DeviceTab() {
  const theme = useTheme();

  const [knownStatus, setKnownStatus] = useState<any>({});
  const [knownDevices, setKnownDevices] = useState<Array<string>>([]);

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
              {__DEV__ ? (
                <Text style={getStyles(theme).mL10}>{device.substring(8)}</Text>
              ) : (
                <></>
              )}
              <Text style={getStyles(theme).mTLR10}>Battery:</Text>
              <ProgressBar
                progress={knownStatus[device].battery}
                style={getStyles(theme).m10}
              />
              <Button
                style={getStyles(theme).mTLR10}
                key={'powerOff'}
                mode="contained"
                onPress={() => {
                  let bleDev = SKBLEManager.Instance.getDeviceByName(device);
                  if (!!bleDev) {
                    SKBLEManager.Instance.sendToConnectedDevice(
                      JSON.stringify({
                        a: [SKConst.ACTION_POWER_OFF],
                      }),
                      bleDev,
                    );
                  }
                }}>
                Power Off!
              </Button>
              <Text style={getStyles(theme).mTLR10}>Set Standby Color:</Text>
              <View style={getStyles(theme).mLR10}>
                <ColorPicker
                  swatchesOnly={false}
                  wheelHidden={true}
                  gapSize={10}
                  discrete={true}
                  palette={[
                    '#000000',
                    '#aa00ff',
                    '#ed1c24',
                    '#e91e62',
                    '#1633e6',
                    '#00aeef',
                    '#00c85d',
                    '#57ff0a',
                    '#ffde17',
                    '#f26522',
                  ]}
                  onColorChange={(color: string) => {
                    // convert color to numbers
                    let r = parseInt(color.substring(1, 3), 16) || 0;
                    let g = parseInt(color.substring(3, 5), 16) || 0;
                    let b = parseInt(color.substring(5, 7), 16) || 0;
                    // find device by name
                    let bleDevice =
                      SKBLEManager.Instance.getDeviceByName(device);
                    // if device discovered, send color information
                    if (!!bleDevice) {
                      SKBLEManager.Instance.sendToConnectedDevice(
                        JSON.stringify({
                          a: [],
                          stb_r: r,
                          stb_g: g,
                          stb_b: b,
                        }),
                        bleDevice,
                      );
                    } else {
                      console.log(
                        'Device not found, but would have sent',
                        JSON.stringify({
                          a: [],
                          stb_r: r,
                          stb_g: g,
                          stb_b: b,
                        }),
                      );
                    }
                  }}
                />
              </View>
              <View style={getStyles(theme).mTLR10}></View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </>
  );
}

export default DeviceTab;
