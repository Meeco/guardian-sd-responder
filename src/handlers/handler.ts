import { DecodedMessage } from '../hcs/decoded-message.js';

/**
 * Handler for a specific `operation` in a HCS message
 */
export abstract class Handler<T extends { operation: string } = any> {
  abstract readonly operation: T['operation'];

  abstract handle(message: DecodedMessage<T>): Promise<void>;
}
