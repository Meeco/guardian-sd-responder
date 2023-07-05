import { beforeEach, describe, expect, it } from '@jest/globals';
import { Logger } from 'winston';
import { PresentationRequestHandler } from '../../src/handlers/presentation-request-handler.js';
import { DecodedMessage } from '../../src/hcs/decoded-message.js';
import { HcsMessenger } from '../../src/hcs/hcs-messenger.js';
import { MessageType } from '../../src/hcs/messages.js';
import { HfsReader } from '../../src/hfs/hfs-reader.js';
import { HfsWriter } from '../../src/hfs/hfs-writer.js';
import { BbsBlsService } from '../../src/vc/bbs-bls-service.js';
import { CredentialRegistry } from '../../src/vc/credential-registry.js';
import { SpyObject, createSpyObject } from '../fixtures/create-spy-object.js';
import { createTopicMessage } from '../fixtures/create-topic-message.js';
import {
  credential,
  credentialId,
  presentationDefinition,
  selectiveCredential,
} from '../fixtures/data.js';

describe('PresentationRequestHandler', () => {
  let handler: PresentationRequestHandler;
  let reader: SpyObject<HfsReader>;
  let writer: SpyObject<HfsWriter>;
  let messenger: SpyObject<HcsMessenger>;
  let registry: SpyObject<CredentialRegistry>;
  let bbsBls: SpyObject<BbsBlsService>;
  let logger: SpyObject<Logger>;

  const responderDid = 'did:key:1234';

  const baseMessage = {
    operation: MessageType.PRESENTATION_REQUEST,
    recipient_did: 'did:key:1234',
    request_file_id: '0.0.1234',
    request_file_dek_encrypted_base64: '',
    request_file_public_key_id: '',
  };

  beforeEach(() => {
    handler = createSpyObject();
    reader = createSpyObject();
    writer = createSpyObject();
    messenger = createSpyObject();
    registry = createSpyObject();
    bbsBls = createSpyObject();
    logger = createSpyObject();
    handler = new PresentationRequestHandler(
      responderDid,
      reader,
      writer,
      messenger,
      registry,
      bbsBls,
      logger
    );
  });

  it('ignores requests not intended for the given responder did', async () => {
    const message = DecodedMessage.fromTopicMessage(
      createTopicMessage({
        ...baseMessage,
        recipient_did: 'did:key:4567',
      }),
      '0.0.1234'
    )!;

    await handler.handle(message);
    expect(logger.verbose).toHaveBeenCalledWith(
      `Request is not intended for this responder - skipping`,
      {
        recipient_did: 'did:key:4567',
        responder_did: 'did:key:1234',
      }
    );
    expect(reader.readFileAsJson).not.toHaveBeenCalled();
    expect(registry.fetchCredential).not.toHaveBeenCalled();
    expect(bbsBls.createProof).not.toHaveBeenCalled();
    expect(messenger.send).not.toHaveBeenCalled();
  });

  it('ignores requests that do not have a valid credential id', async () => {
    const message = DecodedMessage.fromTopicMessage(
      createTopicMessage({
        ...baseMessage,
        recipient_did: 'did:key:1234',
      }),
      '0.0.1234'
    )!;

    reader.readFileAsJson.mockResolvedValue({
      presentation_definition: {},
    });

    await handler.handle(message);

    expect(logger.info).toHaveBeenCalledWith(
      `Unable to determine credential ID from request. It will be ignored`
    );
    expect(reader.readFileAsJson).toHaveBeenCalledWith('0.0.1234');
    expect(registry.fetchCredential).not.toHaveBeenCalled();
    expect(bbsBls.createProof).not.toHaveBeenCalled();
    expect(messenger.send).not.toHaveBeenCalled();
  });

  it('ignores requests for credentials that can not be fetched', async () => {
    const message = DecodedMessage.fromTopicMessage(
      createTopicMessage({
        operation: MessageType.PRESENTATION_REQUEST,
        recipient_did: 'did:key:1234',
        request_file_id: '0.0.111',
        request_file_dek_encrypted_base64: '',
        request_file_public_key_id: '',
      }),
      '0.0.1234'
    )!;

    reader.readFileAsJson.mockResolvedValue({
      presentation_definition: presentationDefinition,
    });

    await handler.handle(message);

    expect(logger.info).toHaveBeenCalledWith(
      `Unable to fetch the credential "${credentialId}". Request can not be handled`
    );
    expect(reader.readFileAsJson).toHaveBeenCalledWith('0.0.111');
    expect(registry.fetchCredential).toHaveBeenCalledWith(credentialId);
    expect(bbsBls.createProof).not.toHaveBeenCalled();
    expect(messenger.send).not.toHaveBeenCalled();
  });

  it('composes a presentation with derived proof, writes it to hfs and responds with hcs message', async () => {
    const message = DecodedMessage.fromTopicMessage(
      createTopicMessage({
        operation: MessageType.PRESENTATION_REQUEST,
        recipient_did: 'did:key:1234',
        request_file_id: '0.0.111',
        request_file_dek_encrypted_base64: '',
        request_file_public_key_id: '',
      }),
      '0.0.1234'
    )!;
    const presentation = {
      presentation: selectiveCredential,
    };

    reader.readFileAsJson.mockResolvedValue({
      presentation_definition: presentationDefinition,
      authorization_details: {
        did: 'did:key:request_did',
      },
    });
    registry.fetchCredential.mockResolvedValue(credential);
    messenger.send.mockResolvedValue(null);
    writer.writeFile.mockResolvedValue({
      toString() {
        return '0.0.5432';
      },
    });
    bbsBls.createProof.mockResolvedValue(selectiveCredential);
    bbsBls.preparePresentation.mockResolvedValue(presentation);

    await handler.handle(message);

    expect(reader.readFileAsJson).toHaveBeenCalledWith('0.0.111');
    expect(registry.fetchCredential).toHaveBeenCalledWith(credentialId);
    expect(bbsBls.createProof).toHaveBeenCalledWith(
      credential,
      presentationDefinition
    );
    expect(bbsBls.preparePresentation).toHaveBeenCalledWith(
      presentationDefinition,
      selectiveCredential
    );
    expect(writer.writeFile).toHaveBeenCalledWith(JSON.stringify(presentation));
    expect(messenger.send).toHaveBeenCalledWith({
      message: JSON.stringify({
        operation: MessageType.PRESENTATION_RESPONSE,
        recipient_did: 'did:key:request_did',
        response_file_dek_encrypted_base64: '',
        response_file_id: '0.0.5432',
      }),
      topicId: '0.0.1234',
    });
    expect(logger.error).not.toHaveBeenCalled();
  });
});
