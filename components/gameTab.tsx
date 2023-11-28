import { Button, Text } from 'react-native-paper';
import { getStyles, joinGameViaWS, startGame } from '../utils';
import { useTheme } from 'react-native-paper';
import { WebSocketHandler } from './webSocketHandler';
import { WebsocketPipeline } from '../CommunicationPipelines/websocket';
import { Separator } from './seperator';
import { View } from 'react-native';
import { GameManager } from './gameManager';
import SKBLEManager from '../utils/bleManager';
import { AxiosResponse } from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { attachableListener } from '../CommunicationPipelines/attachableListener';
import {
  attachableWebsocketListener,
  genericAttachableWebsocketListener,
} from '../CommunicationPipelines/websocket/attachableWebsocketListener';

interface GameTabProps {
  accessToken: string;
  currentGID: string;
  setCurrentGID: (e: string) => void;
  serverHost: string;
  secureConnection: boolean;
}

function GameTab({
  accessToken,
  currentGID,
  setCurrentGID,
  serverHost,
  secureConnection,
}: GameTabProps) {
  const theme = useTheme();

  const [wasGameCreated, setWasGameCreated] = useState(false);
  const [currentlyJoinedGameID, setCurrentlyJoinedGameID] = useState('');

  const gameStatusListenerCallback = useCallback((e: string) => {
    try {
      let data = JSON.parse(e);
      if (data.a?.includes(3)) {
        // currently joined (g_id is retrieved below)
      }
      if (!!data.g_id) {
        setCurrentlyJoinedGameID(data.g_id);
      }
    } catch (error) {}
  }, []);
  const gameStatusListener: attachableWebsocketListener =
    new genericAttachableWebsocketListener(gameStatusListenerCallback);

  useEffect(() => {
    WebsocketPipeline.Instance.attachMessagingListener(gameStatusListener);
  }, []);

  // join on changed gid
  useEffect(() => {
    if (!!currentGID) {
      if (WebsocketPipeline.Instance.socket && !!accessToken) {
        joinGameViaWS(currentGID, WebsocketPipeline.Instance.socket);
      } else {
        console.error('Not able to join game');
      }
    }
  }, [currentGID]);

  return (
    <>
      <Text variant="titleLarge" style={getStyles(theme).heading}>
        Server Connection:
      </Text>
      <View>
        <WebSocketHandler websocketPipeline={WebsocketPipeline.Instance} />
      </View>
      <Text
        style={{ ...getStyles(theme).marginTop, ...getStyles(theme).heading }}
        variant="titleLarge">
        Game Management:
      </Text>
      <View style={getStyles(theme).cardcontent}>
        <GameManager
          authenticationToken={accessToken}
          currentGameName={currentGID}
          setCurrentGameName={setCurrentGID}
          serverHost={serverHost}
          secureConnection={secureConnection}
          setWasGameCreated={setWasGameCreated}
          currentlyJoinedGameID={currentlyJoinedGameID}
        />
        <Separator />
        <Button
          onPress={() => {
            if (
              //socketRef.current &&
              //socketRef.current.connected &&
              !!accessToken &&
              !!currentGID
              //SKBLEManager.Instance.connectedDevices.length > 0
            ) {
              startGame(
                currentGID,
                accessToken,
                '10',
                serverHost,
                secureConnection,
                (e: AxiosResponse | void) => {
                  console.log('got response from game join endpoint:', e);
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
                !!accessToken,
                !!currentGID,
                SKBLEManager.Instance.connectedDevices.length > 0,
              );
              console.error('Please execute all other steps first.');
            }
          }}
          mode="contained"
          disabled={!wasGameCreated}>
          Start Game {wasGameCreated ? '' : '(only if you created it)'}
        </Button>
        <Separator />
      </View>
    </>
  );
}

export default GameTab;
