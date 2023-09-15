import { useEffect, useState } from 'react';
import { Text } from 'react-native-paper';
import { WebsocketPipeline } from '../CommunicationPipelines/websocket';

type socketHandlerProps = {
  websocketPipeline: WebsocketPipeline;
};
export const WebSocketHandler = ({ websocketPipeline }: socketHandlerProps) => {
  const [connectionSuccessful, setConnectionSuccessful] = useState(false);

  useEffect(() => {
    setConnectionSuccessful(websocketPipeline.isCurrentlyHealthy());
  }, [websocketPipeline]);

  return (
    <>
      <Text style={{ paddingLeft: 15 }}>
        Websocket Connection Status:{' '}
        {connectionSuccessful ? 'Connected' : 'Disconnected'}
      </Text>
    </>
  );
};
