import { Button, Card, Text } from 'react-native-paper';
import { getStyles, joinGameViaWS, startGame } from '../utils';
import { useTheme } from 'react-native-paper';
import { WebSocketHandler } from './webSocketHandler';
import { WebsocketPipeline } from '../CommunicationPipelines/websocket';
import { Separator } from './seperator';
import { ScrollView, View } from 'react-native';
import { GameManager } from './gameManager';
import SKBLEManager from '../utils/bleManager';
import { AxiosResponse } from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { attachableListener } from '../CommunicationPipelines/attachableListener';
import {
  attachableWebsocketListener,
  genericAttachableWebsocketListener,
} from '../CommunicationPipelines/websocket/attachableWebsocketListener';
import { GameStatusCard } from './gameStatusCard';

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
  const [wasGidSetByUser, setWasGidSetByUser] = useState(false);

  const gameStatusListenerCallback = useCallback((e: string) => {
    try {
      let data = JSON.parse(e);
      if (data.a?.includes(3)) {
        // currently joined (g_id is retrieved below)
      }
      if (!!data.g_id) {
        setWasGidSetByUser(false);
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
    if (!!currentGID && wasGidSetByUser) {
      if (
        WebsocketPipeline.Instance.socket &&
        !!accessToken &&
        (SKBLEManager.Instance.connectedDevices.length > 0 || __DEV__)
      ) {
        joinGameViaWS(currentGID, WebsocketPipeline.Instance.socket);
      } else {
        console.error('Not able to join game');
      }
    }
    if (!!wasGidSetByUser) {
      WebsocketPipeline.Instance.ingest('{"a": [12]}');
    }
  }, [currentGID]);

  return (
    <>
      <ScrollView>
        <View style={getStyles(theme).inline}>
          <Card style={getStyles(theme).cardSmall}>
            <Text variant="titleLarge" style={getStyles(theme).heading}>
              Server
            </Text>
            <View>
              <WebSocketHandler
                websocketPipeline={WebsocketPipeline.Instance}
              />
            </View>
          </Card>
          <Card style={getStyles(theme).cardSmall}>
            <Text variant="titleLarge" style={getStyles(theme).heading}>
              Status
            </Text>
            <View>
              <GameStatusCard />
            </View>
          </Card>
        </View>
        <Card style={getStyles(theme).m15}>
          <Text
            style={{
              ...getStyles(theme).marginTop,
              ...getStyles(theme).heading,
            }}
            variant="titleLarge">
            Game
          </Text>
          <View style={getStyles(theme).cardcontent}>
            <GameManager
              authenticationToken={accessToken}
              currentGameName={currentGID}
              setCurrentGameName={e => {
                setWasGidSetByUser(true);
                setCurrentGID(e);
              }}
              serverHost={serverHost}
              secureConnection={secureConnection}
              setWasGameCreated={setWasGameCreated}
              currentlyJoinedGameID={currentlyJoinedGameID}
            />
            <Button
              style={getStyles(theme).marginTop}
              onPress={() => {
                if (
                  !!accessToken &&
                  !!currentGID &&
                  (SKBLEManager.Instance.connectedDevices.length > 0 || __DEV__)
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
          </View>
        </Card>
      </ScrollView>
    </>
  );
}

export default GameTab;
