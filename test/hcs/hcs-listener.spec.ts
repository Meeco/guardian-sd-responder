import {
  Timestamp,
  TopicMessage,
  TopicMessageQuery,
  TransactionId,
} from '@hashgraph/sdk';
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import Long from 'long';
import { Logger } from 'winston';
import { Handler } from '../../src/handlers/handler.js';
import { DecodedMessage } from '../../src/hcs/decoded-message.js';
import { HcsListener } from '../../src/hcs/hcs-listener.js';
import { jsonToBase64 } from '../../src/util/encoders.js';
import { createSpyObject } from '../fixtures/create-spy-object.js';

// Mock the dependencies
jest.mock('@hashgraph/sdk');
jest.mock('winston');

describe('HcsListener', () => {
  const client = {} as any;
  const logger = createSpyObject<Logger>();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('listens on the given topics on topics', () => {
    const subscribeMock = jest.fn();
    const setTopicIdMock = jest
      .spyOn(TopicMessageQuery.prototype, 'setTopicId')
      .mockReturnValue({ subscribe: subscribeMock } as any);

    const listener = new HcsListener(client, ['topic1', 'topic2'], logger);
    listener.listen();

    expect(setTopicIdMock).toHaveBeenCalledTimes(2);
    expect(setTopicIdMock).toHaveBeenCalledWith('topic1');
    expect(setTopicIdMock).toHaveBeenCalledWith('topic2');

    expect(subscribeMock).toHaveBeenCalledTimes(2);
    expect(subscribeMock).toHaveBeenCalledWith(
      client,
      null,
      expect.any(Function)
    );

    expect(logger.info).toHaveBeenCalledTimes(2);
    expect(logger.info).toHaveBeenCalledWith('Now listening on topic: topic1');
    expect(logger.info).toHaveBeenCalledWith('Now listening on topic: topic2');
  });

  it('handles incoming messages on topics', () => {
    class MockHandler implements Handler {
      operation = 'mock-operation';
      handle = jest.fn() as any;
    }
    const handler = new MockHandler();
    const consensusTimestamp = Timestamp.fromDate(new Date());
    const sequenceNumber = new Long(100);
    const message = {
      consensusTimestamp,
      contents: Buffer.from(
        jsonToBase64({ operation: 'mock-operation' }),
        'base64'
      ),
      chunks: [],
      initialTransactionId: new TransactionId(null, null),
      runningHash: new Uint8Array(),
      sequenceNumber,
    } as TopicMessage;

    jest.spyOn(TopicMessageQuery.prototype, 'setTopicId').mockReturnThis();

    jest
      .spyOn(TopicMessageQuery.prototype, 'subscribe')
      .mockImplementation((client, errorHandler, listener) => {
        listener(message);
        return {} as any;
      });

    const listener = new HcsListener(client, ['topic1'], logger);
    listener.addHandler(handler).listen();

    expect(handler.handle).toHaveBeenCalledWith(
      DecodedMessage.fromTopicMessage(message, 'topic1')
    );
  });

  it('only passes messages applicable to the handler', () => {
    class MockHandler implements Handler {
      operation = 'unrelated-operation';
      handle = jest.fn() as any;
    }
    const handler = new MockHandler();
    const consensusTimestamp = Timestamp.fromDate(new Date());
    const sequenceNumber = new Long(100);
    const message = {
      consensusTimestamp,
      contents: Buffer.from(
        jsonToBase64({ operation: 'mock-operation' }),
        'base64'
      ),
      chunks: [],
      initialTransactionId: new TransactionId(null, null),
      runningHash: new Uint8Array(),
      sequenceNumber,
    } as TopicMessage;

    jest.spyOn(TopicMessageQuery.prototype, 'setTopicId').mockReturnThis();

    jest
      .spyOn(TopicMessageQuery.prototype, 'subscribe')
      .mockImplementation((client, errorHandler, listener) => {
        listener(message);
        return {} as any;
      });

    const listener = new HcsListener(client, ['topic1'], logger);
    listener.addHandler(handler).listen();

    expect(handler.handle).not.toHaveBeenCalled();
  });
});
