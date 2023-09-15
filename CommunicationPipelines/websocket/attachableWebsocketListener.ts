import { attachableListener } from '../attachableListener';

export interface attachableWebsocketListener extends attachableListener {
  recv(msg: string): void;
}

export class genericAttachableWebsocketListener
  implements attachableWebsocketListener
{
  constructor(callback: (s: string) => void) {
    throw new Error('Method not implemented.');
  }
  recv(): void {
    throw new Error('Method not implemented.');
  }
  getName(): String {
    throw new Error('Method not implemented.');
  }
}
