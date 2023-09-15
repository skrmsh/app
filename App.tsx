import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Platform, UIManager, StatusBar, ScrollView } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Portal,
  Provider,
  Text,
  useTheme,
} from 'react-native-paper';

import { BleManager, Device } from 'react-native-ble-plx';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AxiosResponse } from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  BleConnectionScreen,
  BleHandler,
  GameManager,
  LoginScreen,
  Separator,
  TaskStatusBar,
  WebSocketHandler,
} from './components';
import { AuthHandler } from './components/authHandler';
import {
  getStyles,
  getWSUrl,
  joinGameViaWS,
  sendDataToPhasor,
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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function App(): JSX.Element {
  const [connectedDevices, setConnectedDevices] = useState<Device[]>([]);
  const [manager, setManager] = useState<BleManager>();
  const [authToken, setAuthToken] = useState('');
  const [currentGameID, setCurrentGameID] = useState('');
  const [currentlyInGame, setCurrentlyInGame] = useState(false);
  const [waitingOnGamestart, setWaitingOnGamestart] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [serverHost, setServerHost] = useState('');
  const [secureConnection, setSecureConnection] = useState(false);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const theme = useTheme();
  console.warn('Render!');

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

  const relayDataFromServer = useCallback(
    (e: string) => {
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

      console.log(`sending data to ${connectedDevices.length} phasors`);
      connectedDevices.forEach((phasor: Device) => {
        sendDataToPhasor(phasor, e);
      });
    },
    [connectedDevices],
  );

  // NEW STUFF BEGINNING
  // const websocketPipeline = new WebsocketPipeline();

  const middleWare01 = new webSocketConnectionSuccessfulMiddleware();

  const phasorForwarder: attachableWebsocketListener =
    new genericAttachableWebsocketListener(relayDataFromServer);

  const finishedAuthentication = () => {
    console.debug(`Finishing up authentication with token ${authToken}...`);
    WebsocketPipeline.Instance.updateWebSocketHost(serverHost);
    WebsocketPipeline.Instance.initialize();
    WebsocketPipeline.Instance.attachMessagingListener(phasorForwarder);
    WebsocketPipeline.Instance.attachMessagingListener(middleWare01);
    WebsocketPipeline.Instance.authenticate(authToken);
    WebsocketPipeline.Instance.start();
  };

  // NEW STUFF END

  const BottomTabs = () => {
    return (
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen
          name="Game"
          options={{
            tabBarIcon: ({ focused, color, size }) => {
              return <Icon name="rocket" size={size} color={color} />;
            },
          }}>
          {props => (
            <ScrollView
              ref={scrollViewRef}
              onContentSizeChange={() => {
                scrollViewRef?.current?.scrollToEnd({ animated: true });
              }}>
              <Text variant="titleLarge" style={getStyles(theme).heading}>
                Websocket Management
              </Text>
              <WebSocketHandler
                websocketPipeline={WebsocketPipeline.Instance}
              />
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
                variable={currentlyInGame}
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
                          connectedDevices.length > 0
                        ) {
                          joinGameViaWS(
                            currentGameID,
                            WebsocketPipeline.Instance.socket,
                          );
                          //console.warn('joinGameViaWS (NOT IMPLEMENTED)');
                        } else {
                          console.error(
                            'Please execute all other steps first.',
                          );
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
                variable={gameStarted}
                text={'Start Game'}
                extraStatus
                extraStatusVariable={waitingOnGamestart}
                element={
                  <>
                    {waitingOnGamestart ? (
                      <ActivityIndicator size="large" />
                    ) : (
                      <></>
                    )}
                    <Button
                      onPress={() => {
                        if (
                          //socketRef.current &&
                          //socketRef.current.connected &&
                          !!authToken &&
                          !!currentGameID &&
                          connectedDevices.length > 0 &&
                          currentlyInGame
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
                              setErrorMsg(e);
                              setShowingError(true);
                            },
                          );
                        } else {
                          setErrorMsg('Please execute all other steps first.');
                          setShowingError(true);
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
            tabBarIcon: ({ focused, color, size }) => {
              return <Icon name="user" size={size} color={color} />;
            },
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
                  manager={manager}
                  setManager={setManager}
                  messageCallback={WebsocketPipeline.Instance.ingest}
                  connectedDevices={connectedDevices}
                  setConnectedDevices={setConnectedDevices}
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
          <Stack.Screen
            name="Home"
            component={BottomTabs}
            options={{ headerShown: true }}
          />
        </Stack.Navigator>
      </Provider>
    </NavigationContainer>
  );
}
App.whyDidYouRender = true;

export default App;
