import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Platform, ScrollView, UIManager } from 'react-native';
import { ActivityIndicator, Button } from 'react-native-paper';

import { BleManager, Device } from 'react-native-ble-plx';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { AxiosResponse } from 'axios';
import { Tabs, TabScreen } from 'react-native-paper-tabs';
import { io, Socket } from 'socket.io-client';
import {
  BleHandler,
  ErrorDialog,
  GameManager,
  Separator,
  TaskStatusBar,
  WebSocketHandler,
} from './components';
import { AuthHandler } from './components/authHandler';
import { joinGameViaWS, sendDataToPhasor, startGame } from './utils';
import { DummyComponent } from './components/dummyComponent';

function App(): JSX.Element {
  const [connectedDevices, setConnectedDevices] = useState<Device[]>([]);
  const [manager, setManager] = useState<BleManager>();
  const [authToken, setAuthToken] = useState('');
  const [isConnectedToWebsocket, setIsConnectedToWebsocket] = useState(false);
  const socketRef = useRef<Socket>();
  const [currentGameID, setCurrentGameID] = useState('');
  const [currentlyInGame, setCurrentlyInGame] = useState(false);
  const [bleEnabled, setBleEnabled] = useState(false);
  const [waitingOnGamestart, setWaitingOnGamestart] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [showingError, setShowingError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (Platform.OS === 'android') {
      if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
    }
    if (socketRef.current == null) {
      socketRef.current = io('wss://olel.de', { transports: ['websocket'] });
    }
    return () => {};
  }, []);

  const relayDataFromPhasor = useCallback(
    (e: string) => {
      socketRef.current?.emit('message', JSON.parse(e));
      console.log('Sending to socket: ', e);
    },
    [socketRef.current],
  );

  const relayDataFromServer = useCallback(
    (e: string) => {
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
    },
    [connectedDevices],
  );

  const dummy = <DummyComponent />;
  const ReturnDummyComponent = () => dummy;

  const AuthComponent = (
    <ScrollView style={{ margin: 15 }}>
      <AuthHandler setAuthToken={setAuthToken} authToken={authToken} />
    </ScrollView>
  );
  const ReturnAuthComponent = () => AuthComponent;
  const BLEComponent = (
    <ScrollView style={{ padding: 20, margin: 15 }}>
      <BleHandler
        setBleEnabled={setBleEnabled}
        manager={manager}
        setManager={setManager}
        connectedDevices={connectedDevices}
        setConnectedDevices={setConnectedDevices}
        bleEnabled={bleEnabled}
        messageCallback={relayDataFromPhasor}
      />
    </ScrollView>
  );
  const ReturnBleComponent = () => BLEComponent;
  const WebsocketComponent = (
    <ScrollView style={{ margin: 15 }}>
      <WebSocketHandler
        socketRef={socketRef}
        setIsConnectedToWebsocket={setIsConnectedToWebsocket}
        IsConnectedToWebsocket={isConnectedToWebsocket}
        authenticationToken={authToken}
        callBacksToAdd={[relayDataFromServer]}
      />
    </ScrollView>
  );
  const ReturnWebsocketComponent = () => WebsocketComponent;
  const GameManagerComponent = (
    <ScrollView style={{ margin: 15 }}>
      <GameManager
        authenticationToken={authToken}
        currentGameName={currentGameID}
        setCurrentGameName={setCurrentGameID}
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
                  !!authToken &&
                  !!currentGameID &&
                  connectedDevices.length > 0
                ) {
                  joinGameViaWS(currentGameID, socketRef.current);
                } else {
                  setErrorMsg('Please execute all other steps first.');
                  setShowingError(true);
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
                  !!authToken &&
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
  );
  const ReturnGameManagerComponent = () => GameManagerComponent;
  const Tab = createBottomTabNavigator();

  return (
    <>
      <NavigationContainer>
        <ErrorDialog
          showingError={showingError}
          setShowingError={setShowingError}
          errorMsg={errorMsg}
        />
        <Tab.Navigator>
          <Tab.Screen
            name="auth"
            component={ReturnAuthComponent}
            options={{
              tabBarLabel: 'auth',
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="home" color={color} size={26} />
              ),
            }}
          />
          <Tab.Screen
            name="BLE"
            component={ReturnBleComponent}
            options={{
              tabBarLabel: 'ble',
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons
                  name="bluetooth"
                  color={color}
                  size={26}
                />
              ),
            }}
          />
          <Tab.Screen
            name="WS"
            component={ReturnWebsocketComponent}
            options={{
              tabBarLabel: 'ws',
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="abacus" color={color} size={26} />
              ),
            }}
          />
          <Tab.Screen
            name="DUMMY"
            component={DummyComponent}
            options={{
              tabBarLabel: 'DUMMY',
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="abacus" color={color} size={26} />
              ),
            }}
          />
          <Tab.Screen
            name="GAME"
            component={ReturnGameManagerComponent}
            options={{
              tabBarLabel: 'game',
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons
                  name="basketball"
                  color={color}
                  size={26}
                />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}

export default App;
