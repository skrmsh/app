import React, {useState} from 'react';
import {SafeAreaView, ScrollView, View} from 'react-native';
import {Text as PaperText} from 'react-native-paper';
import {Colors} from 'react-native/Libraries/NewAppScreen';

import {BleManager, Device} from 'react-native-ble-plx';

import {BleHandler, Separator} from './components';
import {AuthHandler} from './components/authHandler';
import {StatusInfo} from './components/statusInfo';
import {TaskStatusBar} from './components/taskStatusBar';

function App(): JSX.Element {
  const isDarkMode = false;
  const [connectedDevices, setConnectedDevices] = useState<Device[]>([]);
  const [manager, setManager] = useState<BleManager>();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState('');

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <View
        style={{
          backgroundColor: isDarkMode ? Colors.black : Colors.white,
        }}>
        <ScrollView horizontal={false} style={{padding: 20}}>
          <TaskStatusBar
            variable={isAuthenticated}
            text={'Authentication Status'}
            element={
              <>
                <PaperText>
                  Authentication Status:{' '}
                  {isAuthenticated ? 'Logged in' : 'Not Logged in'}
                </PaperText>
                <AuthHandler
                  isAuthenticated={isAuthenticated}
                  setIsAuthenticated={setIsAuthenticated}
                  setAuthToken={setAuthToken}
                />
                <PaperText>{isAuthenticated ? authToken : ''}</PaperText>
              </>
            }
          />
          <Separator />
          <TaskStatusBar
            variable={connectedDevices.length > 0}
            text={'BLE Connection to Phasor'}
            element={
              <BleHandler
                manager={manager}
                setManager={setManager}
                connectedDevices={connectedDevices}
                setConnectedDevices={setConnectedDevices}
              />
            }
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

export default App;
