import { io, Socket } from 'socket.io-client';
import { attachableListener } from '../attachableListener';
import { communicationPipeline } from '../communicationPipeline';
import { attachableWebsocketListener } from './attachableWebsocketListener';

export class WebsocketPipeline implements communicationPipeline {
  isCurrentlyConnectedToSocket: boolean = false;
  attachedMessagingListeners: attachableWebsocketListener[] = [];
  useSecureConnection: boolean = true;
  webSocketHost: string | undefined = undefined;
  serverConnectionString: string | undefined = undefined;
  socket: Socket | undefined;

  public constructor() {
    this.isCurrentlyConnectedToSocket = false;
    this.attachedMessagingListeners = [];
  }
  // tear down the pipeline, needs to be idempotent
  tearDown(): number {
    throw new Error('Method not implemented.');
  }
  // initialize the pipeline, needs to be idempotent
  initialize(): void {
    this.serverConnectionString = `ws://${this.webSocketHost}/blarghfoo`;
  }
  // start the pipeline, needs to be idempotent
  start(): number {
    const connectionEstablishSuccessful = this.establishSocketConnection();
    if (!this.socket || !connectionEstablishSuccessful) {
      console.log(this.socket);
      console.log(connectionEstablishSuccessful);
      throw new Error('Websocket connection unsuccessful!');
    }
    this.socket?.on('message', this.basePipelineEntrypoint);
    return connectionEstablishSuccessful;
  }
  /**
   * Function to attach a listener getting called for each incoming message
   * @param listener
   */
  public attachMessagingListener(listener: attachableWebsocketListener) {
    console.debug(`Attaching listener ${listener.getName()}...`);
    if (this.attachedMessagingListeners.indexOf(listener) === -1) {
      this.attachedMessagingListeners.push(listener);
      console.debug(`Listener ${listener.getName()} attached!`);
      console.log(this.attachedMessagingListeners);
    } else {
      console.warn(
        `Listener ${listener.getName()} already attached, skipping!`,
      );
    }
  }
  /**
   * utility function to set the serverConnectionString
   * this needs to conform to the scheme "ws://blargh/foo"
   * @param updatedServerConnectionString
   */
  private updateServerConnectionString(updatedServerConnectionString: string) {
    console.debug(
      `Setting serverConnectionString to ${updatedServerConnectionString}.`,
    );
    this.serverConnectionString = updatedServerConnectionString;
  }

  /**
   * utility function to set/update the webSocket host (needs to be formatted as hostname)
   * @param updatedWebSocketHost
   */
  public updateWebSocketHost(updatedWebSocketHost: string) {
    console.debug(`Setting webSocketHost to ${updatedWebSocketHost}.`);
    this.webSocketHost = updatedWebSocketHost;
  }

  private establishSocketConnection(): number {
    console.debug(
      `Establishing websocket connection to ${this.serverConnectionString}...`,
    );
    if (this.serverConnectionString) {
      this.socket = io(this.serverConnectionString);
      console.debug(`Successfully established websocket connection!`);
      return 1;
    } else {
      throw new Error('Pipeline is not initialized!');
    }
  }

  /**
   * Callback which gets passed to the websocket library and handles
   * passing messages through attached listeners
   */
  public basePipelineEntrypoint(message: string) {
    console.debug(`[BEGIN] websocketPipeline rcv ${message}`);
    console.log(this.attachedMessagingListeners);
    this.attachedMessagingListeners.forEach(listener => {
      console.debug(
        `[FORWARD] websocketPipeline to ${listener.getName()} msg ${message}`,
      );
      listener.recv(message);
    });
    console.debug(`[END] websocketPipeline rcv ${message}`);
  }
}
