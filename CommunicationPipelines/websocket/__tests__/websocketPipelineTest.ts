import { WebsocketPipeline } from '../websocketPipeline';
import { io, Socket } from 'socket.io-client';
import { attachableWebsocketListener } from '../attachableWebsocketListener';

const mockedOnMethod = jest.fn();
const mockedEmitMethod = jest.fn();

jest.mock('socket.io-client', () => ({
  ...jest.requireActual('socket.io-client'),
  io: jest.fn().mockImplementation(() => ({
    on: mockedOnMethod,
    emit: mockedEmitMethod,
  })),
}));

beforeEach(() => {
  mockedOnMethod.mockClear();
  mockedEmitMethod.mockClear;
});

it('should ensure pipeline initialize is idempotent', () => {
  var pipeline: WebsocketPipeline = new WebsocketPipeline();
  pipeline.updateWebSocketHost('coolbeanz.de');
  pipeline.initialize();
  const state_before: string = JSON.stringify(pipeline);
  pipeline.initialize();
  const state_after: string = JSON.stringify(pipeline);
  expect(state_before).toEqual(state_after);
});
it('should initialize a socket at pipeline start', () => {
  var pipeline: WebsocketPipeline = new WebsocketPipeline();
  pipeline.updateWebSocketHost('dummy');

  pipeline.initialize();
  pipeline.authenticate('cool_token');
  pipeline.start();
  expect(io).toHaveBeenCalled();
});
it('should attach a listener successfuly', () => {
  var pipeline: WebsocketPipeline = new WebsocketPipeline();
  pipeline.updateWebSocketHost('dummy');
  pipeline.initialize();
  class dummyListener implements attachableWebsocketListener {
    recv(msg: string): void {
      console.log(`rcvd: ${msg}`);
    }
    getName(): String {
      return 'DummyMcDummyFace';
    }
  }
  const listenerToAttach: dummyListener = new dummyListener();
  pipeline.attachMessagingListener(listenerToAttach);
  pipeline.authenticate('cool_token');
  pipeline.start();
});
it('should relay received messages to a listener successfuly', () => {
  var pipeline: WebsocketPipeline = new WebsocketPipeline();
  pipeline.updateWebSocketHost('coolbeanz.de');
  pipeline.initialize();
  class dummyListener implements attachableWebsocketListener {
    recv(msg: string): void {
      console.log(`rcvd: ${msg}`);
    }
    getName(): String {
      return 'DummyMcDummyFace';
    }
  }
  const listenerToAttach: dummyListener = new dummyListener();
  const mockedRecvFunc = jest.fn();
  listenerToAttach.recv = mockedRecvFunc;
  pipeline.attachMessagingListener(listenerToAttach);
  pipeline.authenticate('cool_token');
  pipeline.start();
  expect(mockedOnMethod).toHaveBeenCalled();
  const specifiedCallBackType = mockedOnMethod.mock.calls[0][0];
  expect(specifiedCallBackType).toEqual('message');
  const passedOnMethod = mockedOnMethod.mock.calls[0][1];

  // basePipelineEntrypoint needs to be public to test this, as the argument captor
  // Will capture the function but without the object reference to the pipeline
  // and therefore cant access the added listeners
  expect(passedOnMethod).toEqual(pipeline.basePipelineEntrypoint);
  pipeline.basePipelineEntrypoint('my very cool message');
  expect(mockedRecvFunc.mock.calls[0][0]).toEqual('my very cool message');
});

it('should fail to start the pipeline if init has not been called', () => {
  var pipeline: WebsocketPipeline = new WebsocketPipeline();
  // anonymous function is needed because initialized object wont get pushed into context
  expect(() => pipeline.start()).toThrow('Pipeline is not initialized!');
});
it('should tearDown pipeline successfuly even if not initialized', () => {
  var pipeline: WebsocketPipeline = new WebsocketPipeline();
  expect(pipeline.tearDown()).toBe(0);
});
it('should throw error if socket couldnt socketio', () => {
  var pipeline: WebsocketPipeline = new WebsocketPipeline();
  (io as jest.Mock).mockImplementation(() => undefined);
  pipeline.updateWebSocketHost('dummy');
  pipeline.initialize();
  expect(() => pipeline.start()).toThrow('Websocket connection unsuccessful!');
  (io as jest.Mock).mockImplementation(() => ({
    on: mockedOnMethod,
    emit: mockedEmitMethod,
  }));
});
it('should not attach a listener twice', () => {
  var pipeline: WebsocketPipeline = new WebsocketPipeline();
  class dummyListener implements attachableWebsocketListener {
    recv(msg: string): void {
      console.log(`rcvd: ${msg}`);
    }
    getName(): String {
      return 'DummyMcDummyFace';
    }
  }
  const listenerToAttach: dummyListener = new dummyListener();
  const mockedRecvFunc = jest.fn();
  listenerToAttach.recv = mockedRecvFunc;
  pipeline.attachMessagingListener(listenerToAttach);
  pipeline.attachMessagingListener(listenerToAttach);
});
it('should connect to the correct websocket', () => {
  var pipeline: WebsocketPipeline = new WebsocketPipeline();
  pipeline.updateWebSocketHost('coolbeanz.de');
  pipeline.initialize();
  pipeline.authenticate('cool_token');
  pipeline.start();
  expect(pipeline.serverConnectionString).toEqual('wss://coolbeanz.de');
});
it('should fail to initialize if no prior WSHost has been set', () => {
  var pipeline: WebsocketPipeline = new WebsocketPipeline();
  expect(() => pipeline.initialize()).toThrow();
});
