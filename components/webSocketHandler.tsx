import React, { useEffect, useState } from 'react';
import { Chip } from 'react-native-paper';
import { WebsocketPipeline } from '../CommunicationPipelines/websocket';
import { getStyles } from '../utils';

type socketHandlerProps = {
  websocketPipeline: WebsocketPipeline;
};
export const WebSocketHandler = ({ websocketPipeline }: socketHandlerProps) => {
  const [connectionSuccessful, setConnectionSuccessful] = useState(false);

  useEffect(() => {
    // Check once on load
    setConnectionSuccessful(websocketPipeline.isCurrentlyHealthy());

    websocketPipeline.onHealthinessChange(e => {
      // Check if changed
      setConnectionSuccessful(websocketPipeline.isCurrentlyHealthy());
    });
  }, []);

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
