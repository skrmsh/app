import { io, Socket } from 'socket.io-client';
import { communicationPipeline } from '../communicationPipeline';
import { attachableWebsocketListener } from './attachableWebsocketListener';

export class WebsocketPipeline implements communicationPipeline {
  private static _instance: WebsocketPipeline | null;
  isCurrentlyConnectedToSocket: boolean = false;
  attachedMessagingListeners: attachableWebsocketListener[] = [];
  onHealthinessChangedCallbacks: ((e: boolean) => void)[] = [];
  webSocketHost: string | undefined = undefined;
  serverConnectionString: string | undefined = undefined;
  useSecureConnection: boolean | undefined = undefined;
  socket: Socket | undefined;
  accessToken: string | undefined = undefined;

  public constructor() {}
  public static cleanup() {
    this._instance = null;
  }

  public static get Instance() {
    return this._instance || (this._instance = new WebsocketPipeline());
  }

  ingest(msg: string) {
    console.debug(
      `[BEGIN INGESTION] ${msg}@${WebsocketPipeline.Instance.socket?.id}`,
    );
    if (!WebsocketPipeline.Instance.socket) {
      throw new Error('Socket is not initialized!');
    }
    WebsocketPipeline.Instance.socket.emit('message', JSON.parse(msg), val => {
      console.debug(`[ACK FROM SERVER] ${val} for ${msg}`);
    });
    console.debug(`[END INGESTION] ${msg}`);
  }

  isCurrentlyHealthy(): boolean {
    if (!WebsocketPipeline.Instance.socket) {
      return false;
    }
    return WebsocketPipeline.Instance.socket?.connected;
  }
  authenticate(authToken: string): void {
    this.accessToken = authToken;
  }
  // tear down the pipeline, needs to be idempotent
  tearDown(): number {
    //TODO
    return 0;
  }
  // initialize the pipeline, needs to be idempotent
  initialize(): void {
    this.setConnectionString();
  }
  // start the pipeline, needs to be idempotent
  start(): number {
    const connectionEstablishUnsuccessful = this.establishSocketConnection();
    if (!this.socket || connectionEstablishUnsuccessful) {
      console.log(this.socket);
      throw new Error('Websocket connection unsuccessful!');
    }
    this.socket.on(
      'message',
      WebsocketPipeline.Instance.basePipelineEntrypoint,
    );
    this.socket.on('connect', () => {
      console.debug('Connect callback fired!');
      this.onHealthinessChangedCallbacks.forEach(cb => cb(true));
    });
    this.socket.on('disconnect', () => {
      console.debug('Disconnect callback fired!');
      WebsocketPipeline.Instance.onDisconnectCallback();
      this.onHealthinessChangedCallbacks.forEach(cb => cb(false));
    });
    this.authenticateAgainstWebSocket();
    return connectionEstablishUnsuccessful;
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
   * Function to get called back on healthiness change
   */

  public onHealthinessChange(callback: (e: boolean) => void) {
    this.onHealthinessChangedCallbacks.push(callback);
  }

  /**
   * utility function to set/update the webSocket host (needs to be formatted as hostname)
   * @param updatedWebSocketHost
   */
  public updateWebSocketHost(
    updatedWebSocketHost: string,
    useSecureConnection: boolean,
  ) {
    console.debug(
      `Setting webSocketHost to ${updatedWebSocketHost} and useSecureConnection to ${useSecureConnection}.`,
    );
    this.webSocketHost = updatedWebSocketHost;
    this.useSecureConnection = useSecureConnection;
    this.setConnectionString();
  }

  private establishSocketConnection(): number {
    console.debug(
      `Establishing websocket connection to ${this.serverConnectionString}...`,
    );
    if (this.serverConnectionString) {
      this.socket = io(this.serverConnectionString);
      console.debug('Successfully established websocket connection!');
      return 0;
    } else {
      throw new Error('Pipeline is not initialized!');
    }
  }

  // Join and authenticate to the websocket server
  private authenticateAgainstWebSocket() {
    if (!this.socket) {
      throw new Error(
        'Unable to authenticate, socket missing, did you call initialize?',
      );
    }
    if (!this.accessToken) {
      throw new Error(
        'Unable to authenticate, accessToken was not set, did you call pipeline.authenticate()?',
      );
    }
    this.socket.emit('join', { access_token: this.accessToken });
  }

  /**
   * Callback which gets passed to the websocket library and handles
   * passing messages through attached listeners
   */
  public basePipelineEntrypoint(message: string) {
    console.debug(`[BEGIN] websocketPipeline rcv ${message}`);
    WebsocketPipeline.Instance.attachedMessagingListeners.forEach(listener => {
      console.debug(
        `[FORWARD] websocketPipeline to ${listener.getName()} msg ${message}`,
      );
      listener.recv(message);
    });
    console.debug(`[END] websocketPipeline rcv ${message}`);
  }

  private setConnectionString() {
    if (
      !this.webSocketHost ||
      typeof this.useSecureConnection === 'undefined'
    ) {
      throw new Error(
        'Error generating WS URL: webSocketHost or useSecureConnection not set!',
      );
    }
    console.debug(
      `Generating WS URL with host ${this.webSocketHost}, secure: ${this.useSecureConnection}`,
    );
    this.serverConnectionString = `ws${this.useSecureConnection ? 's' : ''}://${
      this.webSocketHost
    }`;
  }

  private onDisconnectCallback() {
    WebsocketPipeline.Instance.socket?.disconnect();
    WebsocketPipeline.Instance.initialize();
    WebsocketPipeline.Instance.authenticateAgainstWebSocket();
    WebsocketPipeline.Instance.start();
  }
}
