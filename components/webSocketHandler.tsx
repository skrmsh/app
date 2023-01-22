import {useEffect, useRef} from 'react';
import {Button, Text} from 'react-native-paper';
import {StyleSheet} from 'react-native';
import io, {Socket} from 'socket.io-client';

type socketHandlerProps = {
  setIsConnectedToWebsocket: (e: boolean) => void;
  IsConnectedToWebsocket: boolean,
  authenticationToken: string;
  socketRef: any;
  callBacksToAdd: ((e:string)=>void)[]
};
export const WebSocketHandler = ({
  setIsConnectedToWebsocket,
  IsConnectedToWebsocket,
  authenticationToken,
  socketRef,
  callBacksToAdd
}: socketHandlerProps) => {
  socketRef.current?.on('message', receive);
  function authenticate() {
    console.log('Attempting to authenticate...');
    connectToSocket();
    console.log(socketRef.current?.connected);
    socketRef.current?.emit('join', {access_token: authenticationToken});
  }
  function connectToSocket() {
    console.log(socketRef);
    if (socketRef.current == null) {
      socketRef.current = io('wss://olel.de', {transports: ['websocket']});
      socketRef.current.on('message', receive);
    } else if (!socketRef.current.connected) {
      socketRef.current.connect();
    }
    callBacksToAdd.forEach((func: (e:string)=>void) => (socketRef.current.on('message',func)))
  }
  function receive(message: string) {
    var parsedMessage = JSON.parse(message);
    var i;
    for (i = 0; i < parsedMessage.a.length; i++) {
      if (parsedMessage.a[i] === 11) {
        setIsConnectedToWebsocket(true);
      }
    }
  }

  return (
    <>
      <Text>
        Websocket Connection Status: {IsConnectedToWebsocket ? 'Yes' : 'No'}
      </Text>
      <Button style={styles.button} mode="contained" onPress={authenticate} disabled={IsConnectedToWebsocket}>
        Connect & Authenticate to WS
      </Button>
      <Button
        style={styles.button}
        mode="contained"
        onPress={() => {
          if (socketRef.current) {
            console.log('Disconnecting from Websocket...');
            console.log(socketRef.current);
            socketRef.current.disconnect();
          }
          setIsConnectedToWebsocket(false);
        }} disabled={!IsConnectedToWebsocket}>
        Disconnect from WS
      </Button>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    margin: 8,
  },
});
