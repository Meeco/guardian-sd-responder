import { TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { Logger } from 'winston';
import { HcsMessenger } from '../../src/hcs/hcs-messenger.js';
import { createSpyObject } from '../fixtures/create-spy-object.js';

describe('HcsMessenger', () => {
  const client = {} as any;
  const logger = createSpyObject<Logger>();
  const messenger = new HcsMessenger(client, logger);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('sends a message successfully', async () => {
    const executeMock = jest
      .spyOn(TopicMessageSubmitTransaction.prototype, 'execute')
      .mockResolvedValueOnce({
        getReceipt: jest.fn<any>().mockResolvedValueOnce({ status: 0 }),
      } as any);

    const message = 'Hello, world!';
    const topicId = '0.0.123';

    await messenger.send({ message, topicId });

    expect(executeMock).toHaveBeenCalledWith(client);
    expect(logger.silly).toHaveBeenCalledWith(
      'The message transaction status: 0'
    );
  });

  it('handles message send failures', async () => {
    jest
      .spyOn(TopicMessageSubmitTransaction.prototype, 'execute')
      .mockRejectedValueOnce(new Error('Failed to send message'));

    const errorMock = jest.spyOn(logger, 'error');

    const message = 'Hello, world!';
    const topicId = '0.0.123';

    await messenger.send({ message, topicId });

    expect(errorMock).toHaveBeenCalledWith(
      'Message send failed',
      new Error('Failed to send message')
    );
  });
});
