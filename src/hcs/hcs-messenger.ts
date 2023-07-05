import { Client, TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import { Logger } from 'winston';

/**
 * Send messages via HCS using the provided `Client` for authorizing the transactions.
 */
export class HcsMessenger {
  constructor(private client: Client, private logger?: Logger) {}

  async send({ message, topicId }: { message: string; topicId: string }) {
    try {
      const sendResponse = await new TopicMessageSubmitTransaction({
        topicId,
        message,
      }).execute(this.client);

      const getReceipt = await sendResponse.getReceipt(this.client);
      const transactionStatus = getReceipt.status;
      this.logger?.silly(
        'The message transaction status: ' + transactionStatus.toString()
      );
    } catch (error) {
      this.logger?.error(`Message send failed`, error);
    }
  }
}
