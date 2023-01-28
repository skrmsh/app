import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Platform, ScrollView, UIManager } from 'react-native';
import { ActivityIndicator, Button } from 'react-native-paper';

import { BleManager, Device } from 'react-native-ble-plx';

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
  const [discoveredDevices, setDiscoveredDevices] = useState<Device[]>([]);
  const [showingError, setShowingError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (socketRef.current == null) {
      socketRef.current = io('wss://olel.de', { transports: ['websocket'] });
    }
    return () => {};
  }, []);
  if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }

  const relayDataFromPhasor = (e: string) => {
    socketRef.current?.emit('message', JSON.parse(e));
    console.log('Sending to socket: ', e);
  };

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

  const AuthComponent = (
    <ScrollView style={{ margin: 15 }}>
      <AuthHandler setAuthToken={setAuthToken} authToken={authToken} />
    </ScrollView>
  );
  const BLEComponent = (
    <ScrollView style={{ padding: 20, margin: 15 }}>
      <BleHandler
        setBleEnabled={setBleEnabled}
        manager={manager}
        setManager={setManager}
        connectedDevices={connectedDevices}
        setConnectedDevices={setConnectedDevices}
        bleEnabled={bleEnabled}
        discoveredDevices={discoveredDevices}
        setDiscoveredDevices={setDiscoveredDevices}
        messageCallback={relayDataFromPhasor}
      />
    </ScrollView>
  );
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

  return (
    <>
      <ErrorDialog
        showingError={showingError}
        setShowingError={setShowingError}
        errorMsg={errorMsg}
      />
      <Tabs>
        <TabScreen
          label="Auth"
          icon={!!authToken ? 'account' : 'account-cancel'}>
          {AuthComponent}
        </TabScreen>
        <TabScreen
          label="ble"
          icon={connectedDevices.length > 0 ? 'bluetooth' : 'bluetooth-off'}>
          {BLEComponent}
        </TabScreen>
        <TabScreen
          label="ws"
          icon={isConnectedToWebsocket ? 'phone-classic' : 'phone-classic-off'}>
          {WebsocketComponent}
        </TabScreen>
        <TabScreen label="game" icon="basketball">
          {GameManagerComponent}
        </TabScreen>
      </Tabs>
    </>
  );
}

export default App;
