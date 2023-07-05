import {
  Client,
  SubscriptionHandle,
  TopicMessage,
  TopicMessageQuery,
} from '@hashgraph/sdk';
import { Logger } from 'winston';
import { Handler } from '../handlers/handler.js';
import { DecodedMessage } from './decoded-message.js';

/**
 * The main listener that monitors for messages on the given HCS topic and
 * processed those that have handlers registered via `addHandler()`.
 */
export class HcsListener {
  private subscriptions: SubscriptionHandle[] = [];
  private handlers: Handler[] = [];

  constructor(
    private client: Client,
    private topicIs: string[],
    private logger?: Logger
  ) {}

  listen() {
    for (const topicId of this.topicIs) {
      this.subscriptions.push(
        new TopicMessageQuery()
          .setTopicId(topicId)
          .subscribe(this.client, null, (message) =>
            this.handleMessage(message, topicId)
          )
      );

      this.logger?.info(`Now listening on topic: ${topicId}`);
    }

    return this;
  }

  addHandler(handler: Handler) {
    this.handlers.push(handler);
    this.logger?.verbose(`Now listening for "${handler.operation}" messages`);
    return this;
  }

  close() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.logger?.info(`Closed all listeners`);
  }

  private handleMessage(message: TopicMessage, topicId: string) {
    const decoded = DecodedMessage.fromTopicMessage(message, topicId);
    if (!decoded) {
      return;
    }

    for (const handler of this.handlers) {
      if (handler.operation == decoded.contents.operation) {
        handler.handle(decoded);
      }
    }
  }
}
