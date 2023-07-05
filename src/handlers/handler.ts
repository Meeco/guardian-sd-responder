import { DecodedMessage } from '../hcs/decoded-message.js';

/**
 * Handler for a specific `operation` in a HCS message
 */
export abstract class Handler {
  abstract readonly operation: string;

  abstract handle(message: DecodedMessage): Promise<void>;
}
