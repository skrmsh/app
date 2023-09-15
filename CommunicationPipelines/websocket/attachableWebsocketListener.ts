import { attachableListener } from '../attachableListener';

export interface attachableWebsocketListener extends attachableListener {
  recv(msg: string): void;
}

export class genericAttachableWebsocketListener
  implements attachableWebsocketListener
{
  callback: (msg: string) => void;
  constructor(callback: (s: string) => void) {
    this.callback = callback;
  }
  recv(msg: string): void {
    this.callback(msg);
  }
  getName(): String {
    return `Generic attachableWebsocketListener ${this.callback.toString()}`;
  }
}
