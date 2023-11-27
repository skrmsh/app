import { ActivityIndicator, Button, Text } from 'react-native-paper';
import { getStyles, joinGameViaWS, startGame } from '../utils';
import { useTheme } from 'react-native-paper';
import { WebSocketHandler } from './webSocketHandler';
import { WebsocketPipeline } from '../CommunicationPipelines/websocket';
import { Separator } from './seperator';
import { View } from 'react-native';
import { GameManager } from './gameManager';
import SKBLEManager from '../utils/bleManager';
import { AxiosResponse } from 'axios';
import { useState } from 'react';

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
        />
        <Separator />
        <Button
          onPress={() => {
            if (
              //socketRef.current &&
              //socketRef.current.connected &&
              !!accessToken &&
              !!currentGID &&
              SKBLEManager.Instance.connectedDevices.length > 0
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

        <Button
          onPress={() => {
            console.log(currentGID);
            if (
              //socketRef.current &&
              //socketRef.current.connected &&
              WebsocketPipeline.Instance.socket &&
              !!accessToken &&
              !!currentGID &&
              SKBLEManager.Instance.connectedDevices.length > 0
            ) {
              joinGameViaWS(currentGID, WebsocketPipeline.Instance.socket);
            } else {
              console.error('Please execute all other steps first.');
              console.error(true);
            }
          }}
          mode="contained">
          Join Game
        </Button>
        <Separator />
      </View>
    </>
  );
}

export default GameTab;
