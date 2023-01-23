import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer, useFocusEffect} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Platform,
  SafeAreaView,
  ScrollView,
  UIManager,
} from 'react-native';
import {
  ActivityIndicator,
  Button,
  Dialog,
  Portal,
  Text as PaperText,
  TextInput,
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Colors} from 'react-native/Libraries/NewAppScreen';

import {BleManager, Device} from 'react-native-ble-plx';

import {AxiosResponse} from 'axios';
import {io, Socket} from 'socket.io-client';
import {
  BleHandler,
  GameManager,
  Separator,
  TaskStatusBar,
  WebSocketHandler,
} from './components';
import {AuthHandler} from './components/authHandler';
import {joinGameViaWS, sendDataToPhasor, startGame, WARNING_RED} from './utils';

const FadeInView = (props, {navigation}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useFocusEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
    return () => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    };
  });

  return (
    <Animated.View
      style={{
        flex: 1,
        opacity: fadeAnim,
      }}>
      {props.children}
    </Animated.View>
  );
};

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
  const [discoveredDevices, setDiscoveredDevices] = useState<Device[]>([]);
  const [showGameSelectorModal, setShowGameSelectorModal] = useState(false);
  const [temporaryGameName, setTemporaryGameName] = useState('');

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
    <FadeInView>
      <ScrollView style={{margin: 15}}>
        <AuthHandler
          showError={showError}
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
          setAuthToken={setAuthToken}
        />
      </ScrollView>
    </FadeInView>
  );
  const BLEComponent = () => (
    <FadeInView>
      <ScrollView horizontal={false} style={{padding: 20, margin: 15}}>
        <BleHandler
          setBleEnabled={setBleEnabled}
          showError={showError}
          manager={manager}
          setManager={setManager}
          connectedDevices={connectedDevices}
          setConnectedDevices={setConnectedDevices}
          bleEnabled={bleEnabled}
          discoveredDevices={discoveredDevices}
          setDiscoveredDevices={setDiscoveredDevices}
        />
      </ScrollView>
    </FadeInView>
  );
  const WebsocketComponent = () => (
    <FadeInView>
      <ScrollView style={{margin: 15}}>
        <WebSocketHandler
          socketRef={socketRef}
          setIsConnectedToWebsocket={setIsConnectedToWebsocket}
          IsConnectedToWebsocket={isConnectedToWebsocket}
          authenticationToken={authToken}
          callBacksToAdd={[relayDataFromServer]}
          showError={showError}
        />
      </ScrollView>
    </FadeInView>
  );
  const GameManagerComponent = () => (
    <FadeInView>
      <ScrollView style={{margin: 15}}>
        <GameManager
          showError={showError}
          authenticationToken={authToken}
          currentGameName={currentGameID}
          setCurrentGameName={setCurrentGameID}
          requestGameJoinModal={setShowGameSelectorModal}
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
              {waitingOnGamestart ? <ActivityIndicator size="large" /> : <></>}
              <Button
                onPress={() => {
                  if (
                    socketRef.current &&
                    socketRef.current.connected &&
                    isAuthenticated &&
                    !!currentGameID &&
                    connectedDevices.length > 0 &&
                    currentlyInGame
                  ) {
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
                  } else {
                    showError('Please execute all other steps first.');
                  }
                }}
                mode="contained">
                Start Game
              </Button>
            </>
          }
        />
      </ScrollView>
    </FadeInView>
  );

  const Tab = createBottomTabNavigator();

  return (
    <>
      <Portal>
        <Dialog
          visible={showGameSelectorModal}
          onDismiss={() => setShowGameSelectorModal(false)}>
          <Dialog.Icon icon="abacus" size={32} />
          <Dialog.Content>
            <PaperText variant="bodyMedium">Please input a Game Name</PaperText>
            <TextInput
              label={'Game Name'}
              onChangeText={text => setTemporaryGameName(text)}
              value={temporaryGameName}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowGameSelectorModal(false)}>
              Close
            </Button>
            <Button
            key={"dfdsdsdsdfd"}
              onPress={() => {
                setCurrentGameID(temporaryGameName);
                setShowGameSelectorModal(false);
              }}>
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
        <Dialog visible={showModal} onDismiss={() => setShowModal(false)}>
          <Dialog.Icon icon="alert-octagon" size={32} color={WARNING_RED} />
          <Dialog.Content>
            <PaperText variant="bodyMedium">{modalText}</PaperText>
          </Dialog.Content>
          <Dialog.Actions>
            <Button key={"dfdfd"} onPress={() => setShowModal(false)}>Close</Button>
            
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <SafeAreaView style={backgroundStyle}>
        <NavigationContainer>
          <Tab.Navigator>
            <Tab.Screen
              name="Auth"
              component={AuthComponent}
              options={{
                tabBarLabel: 'Auth',
                tabBarIcon: ({color, size}) => (
                  <MaterialCommunityIcons
                    name="account-lock"
                    color={color}
                    size={size}
                  />
                ),
                tabBarBadge: isAuthenticated ? '✓' : 'X',
                tabBarBadgeStyle: {
                  backgroundColor: isAuthenticated ? '#00ff00' : WARNING_RED,
                  color: '#ffffff',
                },
              }}
            />
            <Tab.Screen
              name="BLE"
              component={BLEComponent}
              options={{
                tabBarLabel: 'BLE',
                tabBarIcon: ({color, size}) => (
                  <MaterialCommunityIcons
                    name="bluetooth"
                    color={color}
                    size={size}
                  />
                ),
                tabBarBadge: connectedDevices.length > 0 ? '✓' : 'X',
                tabBarBadgeStyle: {
                  backgroundColor:
                    connectedDevices.length > 0 ? '#00ff00' : WARNING_RED,
                  color: '#ffffff',
                },
              }}
            />
            <Tab.Screen
              name="Websocket"
              component={WebsocketComponent}
              options={{
                tabBarLabel: 'WS',
                tabBarIcon: ({color, size}) => (
                  <MaterialCommunityIcons
                    name="abacus"
                    color={color}
                    size={size}
                  />
                ),
                tabBarBadge: isConnectedToWebsocket ? '✓' : 'X',
                tabBarBadgeStyle: {
                  backgroundColor: isConnectedToWebsocket
                    ? '#00ff00'
                    : WARNING_RED,
                  color: '#ffffff',
                },
              }}
            />
            <Tab.Screen
              name="Game"
              component={GameManagerComponent}
              options={{
                tabBarLabel: 'Game',
                tabBarIcon: ({color, size}) => (
                  <MaterialCommunityIcons
                    name="atom"
                    color={color}
                    size={size}
                  />
                ),
                tabBarBadge: !!currentGameID ? '✓' : 'X',
                tabBarBadgeStyle: {
                  backgroundColor: !!currentGameID ? '#00ff00' : WARNING_RED,
                  color: '#ffffff',
                },
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </>
  );
}

export default App;
