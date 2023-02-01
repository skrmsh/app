import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Platform, ScrollView, UIManager } from 'react-native';
import { ActivityIndicator, Text, Appbar, Button } from 'react-native-paper';

import { BleManager, Device } from 'react-native-ble-plx';

import { AxiosResponse } from 'axios';
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
import { getStyles, joinGameViaWS, sendDataToPhasor, startGame } from './utils';

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
      console.log(`sending data to ${connectedDevices.length} phasors`);
      connectedDevices.forEach((phasor: Device) => {
        sendDataToPhasor(phasor, e);
      });
    },
    [connectedDevices],
  );

  return (
    <>
      <ErrorDialog
        showingError={showingError}
        setShowingError={(e: boolean) => !e && setShowingError(false)}
        errorMsg={errorMsg}
      />
      <Appbar.Header>
        <Appbar.Content title="SKIRMISH" />
        <Appbar.Action icon="forklift" onPress={() => {}} />
      </Appbar.Header>
      <ScrollView style={{ margin: 15 }}>
        <Text variant="titleLarge" style={getStyles().heading}>
          User Management
        </Text>
        <AuthHandler setAuthToken={setAuthToken} authToken={authToken} />
        <Separator />
        <Text variant="titleLarge" style={getStyles().heading}>
          Bluetooth Management
        </Text>
        <BleHandler
          setBleEnabled={setBleEnabled}
          manager={manager}
          setManager={setManager}
          connectedDevices={connectedDevices}
          setConnectedDevices={setConnectedDevices}
          bleEnabled={bleEnabled}
          messageCallback={relayDataFromPhasor}
        />
        <Separator />
        <Text variant="titleLarge" style={getStyles().heading}>
          Websocket Management
        </Text>
        <WebSocketHandler
          socketRef={socketRef}
          setIsConnectedToWebsocket={setIsConnectedToWebsocket}
          IsConnectedToWebsocket={isConnectedToWebsocket}
          authenticationToken={authToken}
          callBacksToAdd={[relayDataFromServer]}
        />
        <Separator />
        <Text variant="titleLarge" style={getStyles().heading}>
          Game Management
        </Text>
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
                        console.log('got response from game join endpoint:', e);
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
    </>
  );
}

export default App;
