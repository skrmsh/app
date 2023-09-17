import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Platform, UIManager, ScrollView } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Provider,
  Text,
  useTheme,
} from 'react-native-paper';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AxiosResponse } from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import IonIcon from 'react-native-vector-icons/Ionicons';
import {
  BleConnectionScreen,
  GameManager,
  LoginScreen,
  Separator,
  TaskStatusBar,
  WebSocketHandler,
} from './components';
import { AuthHandler } from './components/authHandler';
import {
  getStyles,
  joinGameViaWS,
  startGame,
  getSecureConnectionFromStorage,
  getServerHostFromStorage,
} from './utils';
import { WebsocketPipeline } from './CommunicationPipelines/websocket';
import {
  attachableWebsocketListener,
  genericAttachableWebsocketListener,
} from './CommunicationPipelines/websocket/attachableWebsocketListener';
import { webSocketConnectionSuccessfulMiddleware } from './Middlewares/webSocketConnectionSuccessfulMiddleware';
import SKBLEManager from './utils/bleManager';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const generateUserTabIcon = ({ focused, color, size }) => {
  return (
    <Icon
      name={focused ? 'user-circle' : 'user-circle-o'}
      size={size}
      color={color}
    />
  );
};

const generateGameTabIcon = ({ focused, color, size }) => {
  return (
    <IonIcon
      name={focused ? 'game-controller' : 'game-controller-outline'}
      size={size}
      color={color}
    />
  );
};

const BottomTabs = (
  scrollViewRef,
  theme,
  authToken,
  currentGameID,
  setCurrentGameID,
  serverHost,
  secureConnection,
) => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Game"
        options={{
          tabBarIcon: generateGameTabIcon,
        }}>
        {_props => (
          <ScrollView
            ref={scrollViewRef}
            onContentSizeChange={() => {
              scrollViewRef?.current?.scrollToEnd({ animated: true });
            }}>
            <Text variant="titleLarge" style={getStyles(theme).heading}>
              Websocket Management
            </Text>
            <WebSocketHandler websocketPipeline={WebsocketPipeline.Instance} />
            <Separator />
            <Text variant="titleLarge" style={getStyles(theme).heading}>
              Game Management
            </Text>
            <GameManager
              authenticationToken={authToken}
              currentGameName={currentGameID}
              setCurrentGameName={setCurrentGameID}
              serverHost={serverHost}
              secureConnection={secureConnection}
            />
            <Separator />

            <TaskStatusBar
              variable={false}
              text={'Join Game'}
              element={
                <>
                  <Button
                    onPress={() => {
                      if (
                        //socketRef.current &&
                        //socketRef.current.connected &&
                        WebsocketPipeline.Instance.socket &&
                        !!authToken &&
                        !!currentGameID &&
                        SKBLEManager.Instance.connectedDevices.length > 0
                      ) {
                        joinGameViaWS(
                          currentGameID,
                          WebsocketPipeline.Instance.socket,
                        );
                      } else {
                        console.error('Please execute all other steps first.');
                        console.error(true);
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
              variable={false}
              text={'Start Game'}
              extraStatus
              extraStatusVariable={false}
              element={
                <>
                  {false ? <ActivityIndicator size="large" /> : <></>}
                  <Button
                    onPress={() => {
                      if (
                        //socketRef.current &&
                        //socketRef.current.connected &&
                        !!authToken &&
                        !!currentGameID &&
                        SKBLEManager.Instance.connectedDevices.length > 0
                      ) {
                        startGame(
                          currentGameID,
                          authToken,
                          '10',
                          serverHost,
                          secureConnection,
                          (e: AxiosResponse | void) => {
                            console.log(
                              'got response from game join endpoint:',
                              e,
                            );
                            if (e) {
                              console.log(e.data);
                            }
                          },
                          (e: string) => {
                            console.error(e);
                            console.warn('No error handler configured'); // TODO
                          },
                        );
                      } else {
                        console.debug(
                          !!authToken,
                          !!currentGameID,
                          SKBLEManager.Instance.connectedDevices.length > 0,
                        );
                        console.error('Please execute all other steps first.');
                      }
                    }}
                    mode="contained">
                    Start Game
                  </Button>
                </>
              }
            />
          </ScrollView>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="User"
        options={{
          tabBarIcon: generateUserTabIcon,
        }}>
        {props => (
          <>
            <AuthHandler
              {...props}
              authToken={authToken}
              serverHost={serverHost}
              secureConnection={secureConnection}
            />
          </>
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

function App(): JSX.Element {
  const [authToken, setAuthToken] = useState('');
  const [currentGameID, setCurrentGameID] = useState('');
  // const [currentlyInGame, setCurrentlyInGame] = useState(false);
  // const [waitingOnGamestart, setWaitingOnGamestart] = useState(false);
  // const [gameStarted, setGameStarted] = useState(false);
  const [serverHost, setServerHost] = useState('');
  const [secureConnection, setSecureConnection] = useState(false);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const theme = useTheme();

  useEffect(() => {
    getServerHostFromStorage(e => {
      setServerHost(e ? e : 'olel.de');
    });
    getSecureConnectionFromStorage(e => setSecureConnection(!!e));
  }, []);

  useEffect(() => {
    if (Platform.OS === 'android') {
      if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
    }
    return () => {};
  }, []);

  useEffect(() => {
    SKBLEManager.Instance.onDataReceived(WebsocketPipeline.Instance.ingest);
  }, []);

  const relayDataFromServer = useCallback((e: string) => {
    console.log('received data from server:', e);
    var jsondata = JSON.parse(e);
    if (jsondata.a[0] === 3) {
      console.log('detected game joining');
      //setCurrentlyInGame(true);
    } else if (jsondata.a[0] === 4) {
      console.log('detected game leaving');
      //setCurrentlyInGame(false);
    } else if (jsondata.a[0] === 5) {
      console.log('detected game closing');
      //setCurrentlyInGame(false);
    } else if (jsondata.g_st) {
      /*setWaitingOnGamestart(true);
        setTimeout(() => {
          setGameStarted(true);
          setWaitingOnGamestart(false);
        }, (+jsondata.g_st - Math.floor(Date.now() / 1000)) * 1000);*/
    }
    console.log(
      `sending data to ${SKBLEManager.Instance.connectedDevices.length} phasors`,
    );
    SKBLEManager.Instance.sendToConnectedDevices(e);
  }, []);

  // NEW STUFF BEGINNING
  // const websocketPipeline = new WebsocketPipeline();

  const middleWare01 = new webSocketConnectionSuccessfulMiddleware();

  const phasorForwarder: attachableWebsocketListener =
    new genericAttachableWebsocketListener(relayDataFromServer);

  const finishedAuthentication = () => {
    console.debug(`Finishing up authentication with token ${authToken}...`);
    WebsocketPipeline.Instance.updateWebSocketHost(
      serverHost,
      secureConnection,
    );
    WebsocketPipeline.Instance.initialize();
    WebsocketPipeline.Instance.attachMessagingListener(phasorForwarder);
    WebsocketPipeline.Instance.attachMessagingListener(middleWare01);
    WebsocketPipeline.Instance.authenticate(authToken);
    WebsocketPipeline.Instance.start();
  };

  // NEW STUFF END

  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        ...theme,
        colors: {
          ...DefaultTheme.colors,
          ...theme.colors,
          text: theme.colors.onPrimary,
          card: theme.colors.background,
          border: theme.colors.primary,
        },
      }}>
      <Provider theme={theme}>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerBackVisible: true,
            headerBackTitleVisible: false,
            headerStyle: getStyles(theme).stackNavHeader,
          }}>
          <Stack.Screen
            name="Login"
            options={{ headerTintColor: theme.colors.onPrimary }}>
            {props => (
              <>
                <LoginScreen
                  {...props}
                  accessToken={authToken}
                  setAccessToken={setAuthToken}
                  serverHost={serverHost}
                  setServerHost={setServerHost}
                  secureConnection={secureConnection}
                  setSecureConnection={setSecureConnection}
                  callback={() => {
                    finishedAuthentication();
                    props.navigation.navigate('Bluetooth');
                  }}
                />
              </>
            )}
          </Stack.Screen>
          <Stack.Screen name="Bluetooth">
            {props => (
              <>
                <BleConnectionScreen
                  messageCallback={WebsocketPipeline.Instance.ingest}
                  onScreenFinishedCallback={() => {
                    props.navigation.navigate('Home');
                  }}
                />
                {/*
              <Text variant="titleLarge" style={getStyles(theme).heading}>
                Please connect to at least one Bluetooth Deivce
              </Text>
              <BleHandler
                setBleEnabled={setBleEnabled}
                manager={manager}
                setManager={setManager}
                connectedDevices={connectedDevices}
                setConnectedDevices={setConnectedDevices}
                bleEnabled={bleEnabled}
                messageCallback={relayDataFromPhasor}
                onCompletedCallback={() => {
                  props.navigation.navigate('Home');
                }}
              />*/}
              </>
            )}
          </Stack.Screen>
          <Stack.Screen name="Home" options={{ headerShown: true }}>
            {() =>
              BottomTabs(
                scrollViewRef,
                theme,
                authToken,
                currentGameID,
                setCurrentGameID,
                serverHost,
                secureConnection,
              )
            }
          </Stack.Screen>
        </Stack.Navigator>
      </Provider>
    </NavigationContainer>
  );
}
App.whyDidYouRender = true;

export default App;
