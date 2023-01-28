import { Socket } from 'socket.io-client';

export const joinGameViaWS = (gameID: string, socket: Socket) => {
  var joinInfo = JSON.parse(`{"a":[2],"gid":"${gameID}"}`);
  socket.emit('message', joinInfo);
};
