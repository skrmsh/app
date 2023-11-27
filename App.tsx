import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Platform, UIManager, ScrollView, View } from 'react-native';
import { Provider, useTheme } from 'react-native-paper';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AxiosResponse } from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { BleConnectionScreen, LoginScreen } from './components';
import { AuthHandler } from './components/authHandler';
import {
  getStyles,
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
import GameTab from './components/gameTab';

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
  currentlyJoinedGameID,
) => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Game"
        options={{
          tabBarIcon: generateGameTabIcon,
        }}>
        {_props => (
          <GameTab
            accessToken={authToken}
            currentGID={currentGameID}
            setCurrentGID={setCurrentGameID}
            serverHost={serverHost}
            secureConnection={secureConnection}
            currentlyJoinedGameID={currentlyJoinedGameID}
          />
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
  const [currentlyJoinedGameID, setCurrentlyJoinedGameID] = useState('');
  // const [currentlyInGame, setCurrentlyInGame] = useState(false);
  // const [waitingOnGamestart, setWaitingOnGamestart] = useState(false);
  // const [gameStarted, setGameStarted] = useState(false);
  const [serverHost, setServerHost] = useState('');
  const [secureConnection, setSecureConnection] = useState(false);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const theme = useTheme();

  useEffect(() => {
    console.log(`current game id is: ${currentGameID}`);
  }, [currentGameID]);

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
    if (jsondata.a.includes(3)) {
      console.log('detected game joining');
      setCurrentlyJoinedGameID(jsondata.g_id);
    } else if (jsondata.a.includes(4)) {
      console.log('detected game leaving');
    } else if (jsondata.a.includes(5)) {
      console.log('detected game closing');
      setCurrentlyJoinedGameID('');
    } else if (jsondata.g_st) {
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
                currentlyJoinedGameID,
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
