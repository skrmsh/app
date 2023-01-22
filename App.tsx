import {Suspense, useEffect, useRef, useState} from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  UIManager,
  View,
} from 'react-native';
import {BottomNavigation} from 'react-native-paper';
import {
  ActivityIndicator,
  Button,
  Snackbar,
  Text as PaperText,
} from 'react-native-paper';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {BleManager, Device} from 'react-native-ble-plx';

import {io, Socket} from 'socket.io-client';
import {
  BleHandler,
  GameManager,
  Separator,
  WebSocketHandler,
} from './components';
import {AuthHandler} from './components/authHandler';
import {TaskStatusBar} from './components/taskStatusBar';
import {joinGameViaWS, sendDataToPhasor, startGame, WARNING_RED} from './utils';
import {AxiosResponse} from 'axios';

function App(): JSX.Element {
  const isDarkMode = true;
  const [connectedDevices, setConnectedDevices] = useState<Device[]>([]);
  const [manager, setManager] = useState<BleManager>();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState('');
  const [isConnectedToWebsocket, setIsConnectedToWebsocket] = useState(false);
  const socketRef = useRef<Socket>();
  const [currentGameID, setCurrentGameID] = useState('');
  const [currentlyInGame, setCurrentlyInGame] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalText, setModalText] = useState('');
  const [bleEnabled, setBleEnabled] = useState(false);
  const [waitingOnGamestart, setWaitingOnGamestart] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);

  function showError(message: string) {
    setModalText(message);
    setShowModal(true);
  }

  useEffect(() => {
    if (socketRef.current == null) {
      socketRef.current = io('wss://olel.de', {transports: ['websocket']});
    }
    return () => {};
  }, []);
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };
  if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }

  const relayDataFromServer = (e: string) => {
    console.log('received data from server:', e);
    var jsondata = JSON.parse(e);
    if (jsondata.a[0] === 3) {
      console.log('detected game joining');
      setCurrentlyInGame(true);
    } else if (jsondata.a[0] === 4) {
      console.log('detected game leaving');
      setCurrentlyInGame(false);
    } else if (jsondata.a[0] === 5) {
      console.log('detected game closing');
      setCurrentlyInGame(false);
    } else if (jsondata.g_start_time) {
      setWaitingOnGamestart(true);
      setTimeout(() => {
        setGameStarted(true);
        setWaitingOnGamestart(false);
      }, (+jsondata.g_start_time - Math.floor(Date.now() / 1000)) * 1000);
    }

    connectedDevices.forEach((phasor: Device) => {
      console.log(`sending ${e} to phasor ${phasor.id}, ${phasor.name}`);
      sendDataToPhasor(phasor, e);
    });
  };


  const AuthComponent = () => (
    <View style={{margin: 15}}>
    <AuthHandler
      showError={showError}
      isAuthenticated={isAuthenticated}
      setIsAuthenticated={setIsAuthenticated}
      setAuthToken={setAuthToken}
    />
    </View>
  );
  const BLEComponent = () => (
    <View style={{margin: 15}}>
    <BleHandler
      setBleEnabled={setBleEnabled}
      showError={showError}
      manager={manager}
      setManager={setManager}
      connectedDevices={connectedDevices}
      setConnectedDevices={setConnectedDevices}
    />
    </View>
  );
  const WebsocketComponent = () => (
    <View style={{margin: 15}}>
    <WebSocketHandler
      socketRef={socketRef}
      setIsConnectedToWebsocket={setIsConnectedToWebsocket}
      IsConnectedToWebsocket={isConnectedToWebsocket}
      authenticationToken={authToken}
      callBacksToAdd={[relayDataFromServer]}
    />
    </View>
  );
  const GameManagerComponent = () => (
    <View style={{margin: 15}}>
    <GameManager
      showError={showError}
      authenticationToken={authToken}
      currentGameName={currentGameID}
      setCurrentGameName={setCurrentGameID}
    />
    </View>
  );

  const Tab = createBottomTabNavigator();

  return (
    <SafeAreaView style={backgroundStyle}>
      <Snackbar
        visible={showModal}
        onDismiss={() => setShowModal(false)}
        action={{
          label: 'OK',
          onPress: () => {},
        }}>
        {modalText}
      </Snackbar>
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen name="Auth" component={AuthComponent} options={{
          tabBarLabel: 'Auth',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-lock" color={color} size={size} />
          ),
          tabBarBadge: isAuthenticated ? "✓" : "X",
          tabBarBadgeStyle: {backgroundColor: isAuthenticated ? "#00ff00": WARNING_RED, color: "#ffffff"}
        }}/>
          <Tab.Screen name="BLE" component={BLEComponent} options={{
          tabBarLabel: 'BLE',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bluetooth" color={color} size={size} />
          ),
          tabBarBadge: connectedDevices.length>0 ? "✓" : "X",
          tabBarBadgeStyle: {backgroundColor: connectedDevices.length>0 ? "#00ff00": WARNING_RED, color: "#ffffff"}
        }} />
          <Tab.Screen name="Websocket" component={WebsocketComponent} options={{
          tabBarLabel: 'WS',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="abacus" color={color} size={size} />
          ),
          tabBarBadge: isConnectedToWebsocket ? "✓" : "X",
          tabBarBadgeStyle: {backgroundColor: isConnectedToWebsocket ? "#00ff00": WARNING_RED, color: "#ffffff"}
        }}/>
          <Tab.Screen name="Game" component={GameManagerComponent} options={{
          tabBarLabel: 'Game',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="atom" color={color} size={size} />
          ),
          tabBarBadge: !!currentGameID ? "✓" : "X",
          tabBarBadgeStyle: {backgroundColor: !!currentGameID ? "#00ff00": WARNING_RED, color: "#ffffff"}
        }}/>
        </Tab.Navigator>
      </NavigationContainer>

      {/*
    <BottomNavigation onIndexChange={setPageIndex} renderScene={renderScene} navigationState={{pageIndex, routes}}/>
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
                  showError={showError}
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
            extraStatus
            extraStatusVariable={bleEnabled}
            text={'BLE Connection to Phasor'}
            element={
              <BleHandler
                setBleEnabled={setBleEnabled}
                showError={showError}
                manager={manager}
                setManager={setManager}
                connectedDevices={connectedDevices}
                setConnectedDevices={setConnectedDevices}
              />
            }
          />
          <Separator />
          <TaskStatusBar
            variable={isConnectedToWebsocket}
            text={'Websocket Connection'}
            element={
              
            }
          />
          <Separator />
          <TaskStatusBar
            variable={!!currentGameID}
            text={'Create / Set Game ID'}
            element={
              <GameManager
                showError={showError}
                authenticationToken={authToken}
                currentGameName={currentGameID}
                setCurrentGameName={setCurrentGameID}
              />
            }
          />
          <Separator />
          <TaskStatusBar
            variable={currentlyInGame}
            text={'Join Game'}
            element={
              <>
                <Button
                  onPress={() => {
                    if (
                      socketRef.current &&
                      socketRef.current.connected &&
                      isAuthenticated &&
                      !!currentGameID &&
                      connectedDevices.length > 0
                    ) {
                      joinGameViaWS(currentGameID, socketRef.current);
                    } else {
                      showError('Please execute all other steps first.');
                    }
                  }}
                  mode="contained">
                  Join Game
                </Button>
              </>
            }
          />
          <Separator />
          <TaskStatusBar
            variable={gameStarted}
            text={'Start Game'}
            extraStatus
            extraStatusVariable={waitingOnGamestart}
            element={
              <>
              {waitingOnGamestart ? <ActivityIndicator size="large"/> : <></>}
                <Button
                  onPress={() => {
                    console.log('ok');
                    startGame(
                      currentGameID,
                      authToken,
                      '10',
                      (e: AxiosResponse | void) => {
                        if (e) {
                          console.log(e.data);
                        }
                      },
                      showError,
                    );
                  }}
                  mode="contained">
                  Start Game
                </Button>
              </>
            }
          />
        </ScrollView>
          </View>*/}
    </SafeAreaView>
  );
}

export default App;
