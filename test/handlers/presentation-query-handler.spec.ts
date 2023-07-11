import { beforeEach, describe, expect, it } from '@jest/globals';
import { Logger } from 'winston';
import { PresentationQueryHandler } from '../../src/handlers/presentation-query-handler.js';
import { DecodedMessage } from '../../src/hcs/decoded-message.js';
import { HcsMessenger } from '../../src/hcs/hcs-messenger.js';
import {
  MessageType,
  PresentationQueryMessage,
} from '../../src/hcs/messages.js';
import { CredentialRegistry } from '../../src/vc/credential-registry.js';
import { SpyObject, createSpyObject } from '../fixtures/create-spy-object.js';
import { createTopicMessage } from '../fixtures/create-topic-message.js';

describe('PresentationQueryHandler', () => {
  let messenger: SpyObject<HcsMessenger>;
  let logger: SpyObject<Logger>;
  let registry: SpyObject<CredentialRegistry>;
  let handler: PresentationQueryHandler;

  beforeEach(() => {
    messenger = createSpyObject();
    logger = createSpyObject();
    registry = createSpyObject();

    handler = new PresentationQueryHandler(
      'did:key:1234',
      messenger as HcsMessenger,
      registry as CredentialRegistry,
      logger as Logger
    );
  });

  it('responds to valid operations that it can handle', async () => {
    registry.canHandleCredential.mockResolvedValue(true);

    const message = DecodedMessage.fromTopicMessage<PresentationQueryMessage>(
      createTopicMessage({
        operation: MessageType.PRESENTATION_QUERY,
        vc_id: 'urn:uuid:955afba1-d4b8-4d39-8fb3-ff77742cb403',
        requester_did: 'did:key:5678',
        limit_hbar: 0,
      }),
      '0.0.1234'
    )!;

    await handler.handle(message);

    expect(registry.canHandleCredential).toHaveBeenCalledWith(
      'urn:uuid:955afba1-d4b8-4d39-8fb3-ff77742cb403'
    );
    expect(messenger.send).toHaveBeenCalledWith({
      message: JSON.stringify({
        operation: MessageType.QUERY_RESPONSE,
        responder_did: 'did:key:1234',
        offer_hbar: 0,
      }),
      topicId: '0.0.1234',
    });
  });

  it('does not respond to messages that are missing required parameters', async () => {
    registry.canHandleCredential.mockResolvedValue(false);

    const messageA = DecodedMessage.fromTopicMessage<PresentationQueryMessage>(
      createTopicMessage({
        operation: MessageType.PRESENTATION_QUERY,
        vc_id: 'urn:uuid:18b8e91b-381c-4686-a096-4c66c153bb69',
        limit_hbar: 0,
      }),
      '0.0.1234'
    )!;
    const messageB = DecodedMessage.fromTopicMessage<PresentationQueryMessage>(
      createTopicMessage({
        operation: MessageType.PRESENTATION_QUERY,
        responder_did: 'did:key:1234',
        limit_hbar: 0,
      }),
      '0.0.1234'
    )!;

    await handler.handle(messageA);
    await handler.handle(messageB);

    expect(registry.canHandleCredential).not.toHaveBeenCalled();
    expect(messenger.send).not.toHaveBeenCalled();

    expect(logger.error).toHaveBeenCalledTimes(2);
    expect(logger.error).toHaveBeenCalledWith(
      'Message "100" did not contain the required parameters for "presentation-query"'
    );
  });

  it('does not respond to messages for credentials that are not registered', async () => {
    registry.canHandleCredential.mockResolvedValue(false);

    const message = DecodedMessage.fromTopicMessage<PresentationQueryMessage>(
      createTopicMessage({
        operation: MessageType.PRESENTATION_QUERY,
        vc_id: 'urn:uuid:18b8e91b-381c-4686-a096-4c66c153bb69',
        requester_did: 'did:key:5678',
        limit_hbar: 0,
      }),
      '0.0.1234'
    )!;

    await handler.handle(message);

    expect(registry.canHandleCredential).toHaveBeenCalledWith(
      'urn:uuid:18b8e91b-381c-4686-a096-4c66c153bb69'
    );
    expect(messenger.send).not.toHaveBeenCalled();
  });
});
