import { Timestamp, TopicMessage } from '@hashgraph/sdk';
import { Logger } from 'winston';
import { decodeBase64Json } from '../util/encoders.js';

/**
 * HCS message with the message contents decoded as JSON.
 */
export class DecodedMessage {
  private constructor(
    public readonly consensusTimestamp: Timestamp,
    public readonly sequenceNumber: Long,
    public readonly topicId: string,
    public readonly contents: { [key: string]: any }
  ) {}

  static fromTopicMessage(
    message: TopicMessage,
    topicId: string,
    logger?: Logger
  ): DecodedMessage | null {
    try {
      const contents = decodeBase64Json(message.contents);

      return new DecodedMessage(
        message.consensusTimestamp,
        message.sequenceNumber,
        topicId,
        contents
      );
    } catch (error) {
      logger?.error(
        `Failed to decode message "${message.sequenceNumber}" as JSON - it will be ignored`,
        error
      );
    }

    return null;
  }
}
