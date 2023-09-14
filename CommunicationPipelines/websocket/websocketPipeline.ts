import { io } from 'socket.io-client';

export class WebsocketPipeline {
  isCurrentlyConnectedToSocket: boolean = false;
  attachedMessagingListeners: Array<attachableListener> = [];
  useSecureConnection: boolean = true;
  webSocketHost: String | undefined = undefined;
  serverConnectionString: String | undefined = undefined;

  public constructor() {
    this.isCurrentlyConnectedToSocket = false;
  }
  /**
   * Function to attach a listener getting called for each incoming message
   * @param listener
   */
  public attachMessagingListener(listener: attachableListener) {
    console.debug(`Attaching listener ${listener.getName()}...`);
    if (this.attachedMessagingListeners.indexOf(listener) === -1) {
      this.attachedMessagingListeners.push(listener);
      console.debug(`Listener ${listener.getName()} attached!`);
    } else {
      console.warn(`Listener ${listener.getName()} already attached!`);
    }
  }
  /**
   * utility function to set the serverConnectionString
   * this needs to conform to the scheme "ws://blargh/foo"
   * @param updatedServerConnectionString
   */
  private updateServerConnectionString(updatedServerConnectionString: String) {
    console.debug(
      `Setting serverConnectionString to ${updatedServerConnectionString}.`,
    );
    this.serverConnectionString = updatedServerConnectionString;
  }

  /**
   * utility function to set/update the webSocket host (needs to be formatted as hostname)
   * @param updatedWebSocketHost
   */
  public updateWebSocketHost(updatedWebSocketHost: String) {
    console.debug(`Setting webSocketHost to ${updatedWebSocketHost}.`);
    this.webSocketHost = updatedWebSocketHost;
  }

  private establishSocketConnection() {}
}
