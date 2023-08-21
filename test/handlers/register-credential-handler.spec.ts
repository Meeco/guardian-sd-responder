import { beforeEach, describe, expect, it } from '@jest/globals';
import { CipherStrategy, EncryptionKey, encryptWithKey } from '@meeco/cryppo';
import { Logger } from 'winston';
import { RegisterCredentialHandler } from '../../src/handlers/register-credential-hander.js';
import { DecodedMessage } from '../../src/hcs/decoded-message.js';
import {
  MessageType,
  RegisterCredentialMessage,
} from '../../src/hcs/messages.js';
import { CredentialRegistry } from '../../src/vc/credential-registry.js';
import { SpyObject, createSpyObject } from '../fixtures/create-spy-object.js';
import { createTopicMessage } from '../fixtures/create-topic-message.js';

describe('RegisterCredentialHandler', () => {
  let handler: RegisterCredentialHandler;
  let registry: SpyObject<CredentialRegistry>;
  let logger: SpyObject<Logger>;
  const key = EncryptionKey.generateRandom(32);
  const passphrase = EncryptionKey.generateRandom(32);
  let encrypted_passphrase: string;

  beforeEach(async () => {
    registry = createSpyObject();
    logger = createSpyObject();
    handler = new RegisterCredentialHandler(registry, logger);
    const encrypted = await encryptWithKey({
      data: passphrase.bytes,
      key,
      strategy: CipherStrategy.AES_GCM,
    });
    encrypted_passphrase = encrypted.serialized!;
  });

  it('requires a guardian_id', async () => {
    const message = DecodedMessage.fromTopicMessage<RegisterCredentialMessage>(
      createTopicMessage({
        operation: MessageType.PRESENTATION_QUERY,
        vc_id: 'urn:uuid:4fd6b06c-e27b-4726-b6a0-00e6211a8f81',
        ipfs_cid: 'Qm1234',
        encrypted_passphrase,
      }),
      '0.0.1234'
    )!;

    await handler.handle(message);

    expect(registry.registerCredential).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith(
      'Skipping credential due to missing parameter on "register-credential" message: guardian_id'
    );
  });

  it('requires a vc_id', async () => {
    const message = DecodedMessage.fromTopicMessage<RegisterCredentialMessage>(
      createTopicMessage({
        guardian_id: 'guardian_1',
        operation: MessageType.PRESENTATION_QUERY,
        ipfs_cid: 'Qm1234',
        encrypted_passphrase,
      }),
      '0.0.1234'
    )!;

    await handler.handle(message);

    expect(registry.registerCredential).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith(
      'Skipping credential due to missing parameter on "register-credential" message: vc_id'
    );
  });

  it('requires a ipfs_cid', async () => {
    const message = DecodedMessage.fromTopicMessage<RegisterCredentialMessage>(
      createTopicMessage({
        guardian_id: 'guardian_1',
        operation: MessageType.PRESENTATION_QUERY,
        vc_id: 'urn:uuid:4fd6b06c-e27b-4726-b6a0-00e6211a8f81',
        encrypted_passphrase,
      }),
      '0.0.1234'
    )!;

    await handler.handle(message);

    expect(registry.registerCredential).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith(
      'Skipping credential due to missing parameter on "register-credential" message: ipfs_cid'
    );
  });

  it('requires a encrypted_passphrase', async () => {
    const message = DecodedMessage.fromTopicMessage<RegisterCredentialMessage>(
      createTopicMessage({
        guardian_id: 'guardian_1',
        operation: MessageType.PRESENTATION_QUERY,
        vc_id: 'urn:uuid:4fd6b06c-e27b-4726-b6a0-00e6211a8f81',
        ipfs_cid: 'Qm1234',
      }),
      '0.0.1234'
    )!;

    await handler.handle(message);

    expect(registry.registerCredential).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith(
      'Skipping credential due to missing parameter on "register-credential" message: encrypted_passphrase'
    );
  });

  it('registers new credentials that are able to be decrypted', async () => {
    const message = DecodedMessage.fromTopicMessage<RegisterCredentialMessage>(
      createTopicMessage({
        guardian_id: 'guardian_1',
        operation: MessageType.PRESENTATION_QUERY,
        vc_id: 'urn:uuid:4fd6b06c-e27b-4726-b6a0-00e6211a8f81',
        ipfs_cid: 'Qm1234',
        encrypted_passphrase,
      }),
      '0.0.1234'
    )!;

    await handler.handle(message);

    expect(registry.registerCredential).toHaveBeenCalledWith({
      guardian_id: 'guardian_1',
      operation: MessageType.PRESENTATION_QUERY,
      vc_id: 'urn:uuid:4fd6b06c-e27b-4726-b6a0-00e6211a8f81',
      ipfs_cid: 'Qm1234',
      encrypted_passphrase,
    });
  });
});
