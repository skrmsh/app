import React, { useEffect, useState } from 'react';
import { Chip, Text } from 'react-native-paper';
import { WebsocketPipeline } from '../CommunicationPipelines/websocket';
import { getStyles } from '../utils';

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
      <Chip
        icon={connectionSuccessful ? 'network-outline' : 'network-off-outline'}
        style={getStyles().m10}>
        {connectionSuccessful ? 'Connected' : 'Not Connected'}
      </Chip>
    </>
  );
};
