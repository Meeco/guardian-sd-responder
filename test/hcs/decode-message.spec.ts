import { Timestamp, TopicMessage, TransactionId } from '@hashgraph/sdk';
import { describe, expect, it } from '@jest/globals';
import Long from 'long';
import { Logger } from 'winston';
import { DecodedMessage } from '../../src/hcs/decoded-message.js';
import { jsonToBase64 } from '../../src/util/encoders.js';
import { createSpyObject } from '../fixtures/create-spy-object.js';

describe('decodeMessage', () => {
  it('decodes a TopicMessage', async () => {
    const consensusTimestamp = Timestamp.fromDate(new Date());
    const sequenceNumber = new Long(100);

    const message = {
      consensusTimestamp,
      contents: Buffer.from(jsonToBase64({ hello: 'world' }), 'base64'),
      chunks: [],
      initialTransactionId: new TransactionId(null, null),
      runningHash: new Uint8Array(),
      sequenceNumber,
    } as TopicMessage;

    const decoded = DecodedMessage.fromTopicMessage(message, '0.0.1234');
    if (!decoded) {
      throw new Error('Failed to decode');
    }

    expect(decoded.consensusTimestamp).toEqual(consensusTimestamp);
    expect(decoded.sequenceNumber).toEqual(sequenceNumber);
    expect(decoded.topicId).toEqual('0.0.1234');
    expect(decoded.contents).toEqual({
      hello: 'world',
    });
  });

  it('ignores messages that can not be decoded', async () => {
    const consensusTimestamp = Timestamp.fromDate(new Date());
    const sequenceNumber = new Long(100200);

    const logger = createSpyObject<Logger>();

    const message = {
      consensusTimestamp,
      contents: Buffer.from('asdf', 'utf8'),
      chunks: [],
      initialTransactionId: new TransactionId(null, null),
      runningHash: new Uint8Array(),
      sequenceNumber,
    } as TopicMessage;

    const decoded = DecodedMessage.fromTopicMessage(
      message,
      '0.0.1234',
      logger
    );
    expect(decoded).toBeNull();
    expect(logger.error).toHaveBeenCalledWith(
      `Failed to decode message "${consensusTimestamp.toString()}" as JSON - it will be ignored`,
      expect.anything()
    );
  });
});
