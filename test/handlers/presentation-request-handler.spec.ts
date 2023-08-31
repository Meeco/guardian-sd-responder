import { Timestamp } from '@hashgraph/sdk';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { Logger } from 'winston';
import { PresentationRequestHandler } from '../../src/handlers/presentation-request-handler.js';
import { DecodedMessage } from '../../src/hcs/decoded-message.js';
import { HcsEncryption } from '../../src/hcs/hcs-encryption.js';
import { HcsMessenger } from '../../src/hcs/hcs-messenger.js';
import {
  MessageType,
  PresentationRequestMessage,
} from '../../src/hcs/messages.js';
import { HfsReader } from '../../src/hfs/hfs-reader.js';
import { HfsWriter } from '../../src/hfs/hfs-writer.js';
import { BbsBlsService } from '../../src/vc/bbs-bls-service.js';
import { CredentialRegistry } from '../../src/vc/credential-registry.js';
import { PresentationVerifier } from '../../src/vc/presentation-verifier.js';
import { SpyObject, createSpyObject } from '../fixtures/create-spy-object.js';
import { createTopicMessage } from '../fixtures/create-topic-message.js';
import {
  authorizationDetails,
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
  let verifier: SpyObject<PresentationVerifier>;
  let encryption: SpyObject<HcsEncryption>;

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
    verifier = createSpyObject();
    encryption = createSpyObject();
    handler = new PresentationRequestHandler(
      responderDid,
      reader,
      writer,
      messenger,
      registry,
      bbsBls,
      verifier,
      encryption,
      logger
    );

    encryption.encrypt.mockImplementation(
      (data) => `encrypted:${JSON.stringify(data)}`
    );
    (encryption as any)['publicKey'] = Buffer.from('example-public', 'utf-8');
  });

  function mockDecryptedFileResponse(response: any) {
    reader.readFile.mockResolvedValue(`encrypted:data`);
    encryption.decrypt.mockReturnValue(response);
  }

  it('ignores requests not intended for the given responder did', async () => {
    const message = DecodedMessage.fromTopicMessage<PresentationRequestMessage>(
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
    expect(reader.readFile).not.toHaveBeenCalled();
    expect(registry.fetchCredential).not.toHaveBeenCalled();
    expect(bbsBls.createProof).not.toHaveBeenCalled();
    expect(messenger.send).not.toHaveBeenCalled();
  });

  it('ignores requests that do not have a did in the authorization details', async () => {
    const message = DecodedMessage.fromTopicMessage<PresentationRequestMessage>(
      createTopicMessage({
        ...baseMessage,
        recipient_did: 'did:key:1234',
      }),
      '0.0.1234'
    )!;

    mockDecryptedFileResponse(
      JSON.stringify({
        presentation_definition: {},
      })
    );

    await handler.handle(message);

    expect(reader.readFile).toHaveBeenCalledWith('0.0.1234');
    expect(registry.fetchCredential).not.toHaveBeenCalled();
    expect(bbsBls.createProof).not.toHaveBeenCalled();
    expect(messenger.send).not.toHaveBeenCalled();
  });

  it('send an error if request can not be decrypted', async () => {
    const message = DecodedMessage.fromTopicMessage<PresentationRequestMessage>(
      createTopicMessage({
        ...baseMessage,
        recipient_did: 'did:key:1234',
      }),
      '0.0.1234'
    )!;

    reader.readFile.mockResolvedValue(Buffer.from([0]));
    encryption.decrypt.mockImplementation(() => {
      throw new Error('Decryption failed');
    });

    await handler.handle(message);

    expect(messenger.send).toHaveBeenCalledWith({
      message: JSON.stringify({
        operation: MessageType.PRESENTATION_RESPONSE,
        error: {
          code: 'FILE_DECRYPTION_FAILED',
          message: `Unable to decrypt the request file.`,
        },
      }),
      topicId: '0.0.1234',
    });
  });

  it('send an error if decrypted file can not be parsed', async () => {
    const message = DecodedMessage.fromTopicMessage<PresentationRequestMessage>(
      createTopicMessage({
        ...baseMessage,
        recipient_did: 'did:key:1234',
      }),
      '0.0.1234'
    )!;

    mockDecryptedFileResponse('not valid json');

    await handler.handle(message);

    expect(messenger.send).toHaveBeenCalledWith({
      message: JSON.stringify({
        operation: MessageType.PRESENTATION_RESPONSE,
        error: {
          code: 'FILE_PARSE_FAILED',
          message: `Unable to parse the request file as valid json.`,
        },
      }),
      topicId: '0.0.1234',
    });
  });

  it('send an error if presentation is of a credential from an untrusted issuer', async () => {
    const message = DecodedMessage.fromTopicMessage<PresentationRequestMessage>(
      createTopicMessage({
        ...baseMessage,
        recipient_did: 'did:key:1234',
      }),
      '0.0.1234'
    )!;

    mockDecryptedFileResponse(
      JSON.stringify({
        presentation_definition: presentationDefinition,
        authorization_details: authorizationDetails,
      })
    );
    registry.fetchCredential.mockResolvedValue(credential);
    verifier.verify.mockResolvedValue(true);
    verifier.isTrusted.mockResolvedValue(false);

    await handler.handle(message);

    expect(messenger.send).toHaveBeenCalledWith({
      message: JSON.stringify({
        operation: MessageType.PRESENTATION_RESPONSE,
        recipient_did: authorizationDetails.did,
        error: {
          code: 'UNTRUSTED_ISSUER',
          message: `Issuer "did:key:z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL" is not a trusted issuer for any credential types ${JSON.stringify(
            ['VerifiableCredential', 'AlumniCredential']
          )}.`,
        },
      }),
      topicId: '0.0.1234',
    });
  });

  it('send an error presentations that can not be verified', async () => {
    const message = DecodedMessage.fromTopicMessage<PresentationRequestMessage>(
      createTopicMessage({
        ...baseMessage,
        recipient_did: 'did:key:1234',
      }),
      '0.0.1234'
    )!;

    mockDecryptedFileResponse(
      JSON.stringify({
        presentation_definition: presentationDefinition,
        authorization_details: authorizationDetails,
      })
    );
    verifier.isTrusted.mockResolvedValue(true);
    verifier.verify.mockResolvedValue(false);

    await handler.handle(message);

    expect(messenger.send).toHaveBeenCalledWith({
      message: JSON.stringify({
        operation: MessageType.PRESENTATION_RESPONSE,
        recipient_did: authorizationDetails.did,
        error: {
          code: 'INVALID_PRESENTATION',
          message: `Presentation could not be verified.`,
        },
      }),
      topicId: '0.0.1234',
    });
  });

  it('send an error for requests that do not have a valid credential id', async () => {
    const message = DecodedMessage.fromTopicMessage<PresentationRequestMessage>(
      createTopicMessage({
        ...baseMessage,
        recipient_did: 'did:key:1234',
      }),
      '0.0.1234'
    )!;

    mockDecryptedFileResponse(
      JSON.stringify({
        authorization_details: {
          did: 'did:key:4567',
          presentationDefinition,
          verifiablePresentation: authorizationDetails.verifiablePresentation,
        },
        presentation_definition: {},
      })
    );
    verifier.isTrusted.mockResolvedValue(true);
    verifier.verify.mockResolvedValue(true);

    await handler.handle(message);

    expect(logger.error).toHaveBeenCalledWith(
      `Unable to determine credential ID from request.`
    );
    expect(reader.readFile).toHaveBeenCalledWith('0.0.1234');
    expect(registry.fetchCredential).not.toHaveBeenCalled();
    expect(bbsBls.createProof).not.toHaveBeenCalled();
    expect(messenger.send).toHaveBeenCalledWith({
      message: JSON.stringify({
        operation: MessageType.PRESENTATION_RESPONSE,
        recipient_did: 'did:key:4567',
        error: {
          code: 'MISSING_CREDENTIAL_ID',
          message: `Unable to determine credential ID from request.`,
        },
      }),
      topicId: '0.0.1234',
    });
  });

  it('sends an error for requests for credentials that can not be fetched', async () => {
    const message = DecodedMessage.fromTopicMessage<PresentationRequestMessage>(
      createTopicMessage({
        operation: MessageType.PRESENTATION_REQUEST,
        recipient_did: 'did:key:1234',
        request_file_id: '0.0.111',
        request_file_dek_encrypted_base64: '',
        request_file_public_key_id: '',
      }),
      '0.0.1234'
    )!;

    mockDecryptedFileResponse(
      JSON.stringify({
        authorization_details: {
          did: 'did:key:4567',
          presentationDefinition,
          verifiablePresentation: authorizationDetails.verifiablePresentation,
        },
        presentation_definition: presentationDefinition,
      })
    );
    verifier.isTrusted.mockResolvedValue(true);
    verifier.verify.mockResolvedValue(true);
    registry.fetchCredential.mockRejectedValue(new Error('Test error'));

    await handler.handle(message);

    expect(logger.error).toHaveBeenCalledWith(
      `Unable to fetch the credential "${credentialId}". Request can not be handled`
    );
    expect(reader.readFile).toHaveBeenCalledWith('0.0.111');
    expect(registry.fetchCredential).toHaveBeenCalledWith(credentialId);
    expect(bbsBls.createProof).not.toHaveBeenCalled();
    expect(messenger.send).toHaveBeenCalledWith({
      message: JSON.stringify({
        operation: MessageType.PRESENTATION_RESPONSE,
        recipient_did: 'did:key:4567',
        error: {
          code: 'CREDENTIAL_NOT_FOUND',
          message: `Unable to fetch the credential "${credentialId}". Request can not be handled`,
        },
      }),
      topicId: '0.0.1234',
    });
  });

  it('returns an error if hfs write of presentation does not return an id', async () => {
    const message = DecodedMessage.fromTopicMessage<PresentationRequestMessage>(
      createTopicMessage(
        {
          operation: MessageType.PRESENTATION_REQUEST,
          recipient_did: 'did:key:1234',
          request_file_id: '0.0.111',
          request_file_dek_encrypted_base64: '',
          request_file_public_key_id: '',
        },
        501
      ),
      '0.0.1234'
    )!;
    const presentation = {
      authorization_details: {
        did: 'did:key:request_did',
        presentationDefinition,
        verifiablePresentation: authorizationDetails.verifiablePresentation,
      },
      presentation: selectiveCredential,
    };

    mockDecryptedFileResponse(
      JSON.stringify({
        presentation_definition: presentationDefinition,
        authorization_details: authorizationDetails,
      })
    );
    registry.fetchCredential.mockResolvedValue(credential);
    messenger.send.mockResolvedValue(null);
    writer.writeFile.mockResolvedValue(null);
    bbsBls.createProof.mockResolvedValue(selectiveCredential);
    bbsBls.preparePresentation.mockResolvedValue(presentation);

    verifier.isTrusted.mockResolvedValue(true);
    verifier.verify.mockResolvedValue(true);

    await handler.handle(message);
    expect(logger.error).toHaveBeenCalledWith(
      new Error(
        'Writing file to HFS did not return a file id - can not respond'
      )
    );

    expect(messenger.send).toHaveBeenCalledWith({
      message: JSON.stringify({
        operation: MessageType.PRESENTATION_RESPONSE,
        recipient_did: authorizationDetails.did,
        error: {
          code: 'UNKNOWN_ERROR',
          message: `There was an unexpected problem processing the request`,
        },
      }),
      topicId: '0.0.1234',
    });
  });

  it('returns a generic error response for all other errors', async () => {
    const message = DecodedMessage.fromTopicMessage<PresentationRequestMessage>(
      createTopicMessage(
        {
          operation: MessageType.PRESENTATION_REQUEST,
          recipient_did: 'did:key:1234',
          request_file_id: '0.0.111',
          request_file_dek_encrypted_base64: '',
          request_file_public_key_id: '',
        },
        501
      ),
      '0.0.1234'
    )!;
    const presentation = {
      presentation: selectiveCredential,
      presentationDefinition,
      verifiablePresentation: authorizationDetails.verifiablePresentation,
    };

    mockDecryptedFileResponse(
      JSON.stringify({
        presentation_definition: presentationDefinition,
        authorization_details: {
          did: 'did:key:request_did',
        },
      })
    );
    registry.fetchCredential.mockResolvedValue({
      guardian_id: 'did:key:guardian_1',
      credential,
    });
    messenger.send.mockResolvedValue(null);
    writer.writeFile.mockRejectedValue(new Error('Test error'));
    bbsBls.createProof.mockResolvedValue(selectiveCredential);
    bbsBls.preparePresentation.mockResolvedValue(presentation);

    verifier.isTrusted.mockResolvedValue(true);
    verifier.verify.mockResolvedValue(true);

    await handler.handle(message);

    expect(logger.error).toHaveBeenCalledWith(
      `There was an unexpected problem processing the request`
    );
    expect(logger.error).toHaveBeenCalledWith(new Error('Test error'));

    expect(messenger.send).toHaveBeenCalledWith({
      message: JSON.stringify({
        operation: MessageType.PRESENTATION_RESPONSE,
        recipient_did: 'did:key:request_did',
        error: {
          code: 'UNKNOWN_ERROR',
          message: `There was an unexpected problem processing the request`,
        },
      }),
      topicId: '0.0.1234',
    });
  });

  it('composes a presentation with derived proof, writes it to hfs and responds with hcs message', async () => {
    const timestamp = Timestamp.fromDate(new Date());
    const message = DecodedMessage.fromTopicMessage<PresentationRequestMessage>(
      createTopicMessage(
        {
          operation: MessageType.PRESENTATION_REQUEST,
          recipient_did: 'did:key:1234',
          request_file_id: '0.0.111',
        },
        501,
        timestamp
      ),
      '0.0.1234'
    )!;
    const presentation = {
      presentation: selectiveCredential,
    };

    mockDecryptedFileResponse(
      JSON.stringify({
        presentation_definition: presentationDefinition,
        authorization_details: authorizationDetails,
      })
    );
    registry.fetchCredential.mockResolvedValue({
      guardian_id: 'did:key:guardian_1',
      credential,
    });
    messenger.send.mockResolvedValue(null);
    writer.writeFile.mockResolvedValue({
      toString() {
        return '0.0.5432';
      },
    });
    bbsBls.createProof.mockResolvedValue(selectiveCredential);
    bbsBls.preparePresentation.mockResolvedValue(presentation);

    verifier.isTrusted.mockResolvedValue(true);
    verifier.verify.mockResolvedValue(true);

    await handler.handle(message);

    expect(reader.readFile).toHaveBeenCalledWith('0.0.111');
    expect(registry.fetchCredential).toHaveBeenCalledWith(credentialId);
    expect(bbsBls.createProof).toHaveBeenCalledWith(
      credential,
      presentationDefinition
    );
    expect(bbsBls.preparePresentation).toHaveBeenCalledWith(
      presentationDefinition,
      selectiveCredential,
      timestamp.toString() // consensus timestamp of the message is the challenge
    );
    expect(writer.writeFile).toHaveBeenCalledWith(
      `encrypted:${JSON.stringify(presentation)}`
    );
    expect(messenger.send).toHaveBeenCalledWith({
      message: JSON.stringify({
        operation: MessageType.PRESENTATION_RESPONSE,
        recipient_did: authorizationDetails.did,
        response_file_id: '0.0.5432',
      }),
      topicId: '0.0.1234',
    });
    expect(logger.error).not.toHaveBeenCalled();

    expect(verifier.isTrusted).toHaveBeenCalledWith(
      'did:key:guardian_1',
      'did:key:z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL',
      ['VerifiableCredential', 'AlumniCredential']
    );
    expect(verifier.verify).toHaveBeenCalledWith(
      authorizationDetails.verifiablePresentation
    );
    expect(encryption.decrypt).toHaveBeenCalledWith('encrypted:data');
    expect(encryption.encrypt).toHaveBeenCalledWith(
      expect.objectContaining({
        presentation: expect.anything(),
      }),
      'did:key:1234' // This would be base64 in a real example
    );
  });
});
