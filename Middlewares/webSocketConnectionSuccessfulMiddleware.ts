import { attachableWebsocketListener } from '../CommunicationPipelines/websocket/attachableWebsocketListener';

export class webSocketConnectionSuccessfulMiddleware
  implements attachableWebsocketListener
{
  constructor() {}
  recv(msg: string): void {
    var parsedMessage = JSON.parse(msg);
    for (var i = 0; i < parsedMessage.a.length; i++) {
      if (parsedMessage.a[i] === 11) {
        console.debug(
          'Server responded with Action 11, Authentication was succesful',
        );
      }
    }
  }
  getName(): String {
    return 'webSocketTerminationMiddleware';
  }
}
