import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  CipherStrategy,
  EncryptionKey,
  encryptWithKey,
  encryptWithKeyDerivedFromString,
} from '@meeco/cryppo';
import {
  MessageType,
  RegisterCredentialMessage,
} from '../../src/hcs/messages.js';
import { GuardianConfig } from '../../src/util/config.js';
import { ResultType, fetchIPFSFile } from '../../src/util/ipfs-fetch.js';
import { KeyValueStorage } from '../../src/util/key-value-storage.js';
import { CredentialRegistry } from '../../src/vc/credential-registry.js';
import { SpyObject, createSpyObject } from '../fixtures/create-spy-object.js';

describe('CredentialRegistry', () => {
  let mockStore: SpyObject<KeyValueStorage>;
  let ipfsReader: jest.Mock<typeof fetchIPFSFile>;
  let credentialRegistry: CredentialRegistry;

  const testGuardians: GuardianConfig[] = [
    {
      id: 'guardian_1',
      passphrase_encryption_key:
        '668301721f4f5a31c7eb7d314d4c4c695a73afdf43c3d191db118fa2098c02d7',
      topic_ids: ['0.0.0.1'],
      issued_credentials: [],
    },
  ];

  beforeEach(() => {
    mockStore = createSpyObject<KeyValueStorage>();
    ipfsReader = jest.fn();
    credentialRegistry = new CredentialRegistry(
      mockStore,
      ipfsReader,
      testGuardians
    );
  });

  describe('registerCredential', () => {
    it('writes the ipfs cid and passphrase to the store with the correct key', async () => {
      const vc_id = 'example-id';
      const ipfs_cid = 'Qm12345';
      const key = '3067d3cb9b354a3c998d2e6aa9858de2';
      const encrypted_passphrase = await encryptWithKeyDerivedFromString({
        data: Buffer.from(key, 'utf-8'),
        passphrase: testGuardians[0].passphrase_encryption_key,
        strategy: CipherStrategy.AES_GCM,
      });

      const message: RegisterCredentialMessage = {
        operation: MessageType.REGISTER_CREDENTIAL,
        ipfs_cid,
        vc_id,
        encrypted_passphrase: encrypted_passphrase.serialized!,
        guardian_id: testGuardians[0].id,
      };

      await credentialRegistry.registerCredential(message);

      expect(mockStore.write).toHaveBeenCalledWith(
        `known_credentials:${vc_id}`,
        message
      );
    });

    it('does not write credentials that can not be decrypted', async () => {
      const vc_id = 'example-id';
      const ipfs_cid = 'Qm12345';
      const key = EncryptionKey.generateRandom(32);
      // Incorrect passphrase (modified from above);
      const passphrase =
        '168301721f4f5a31c7eb7d314d4c4c695a73afdf43c3d191db118fa2098c02d7';
      const encrypted_passphrase = await encryptWithKey({
        data: Buffer.from(passphrase, 'utf-8'),
        key: key,
        strategy: CipherStrategy.AES_GCM,
      });

      const message: RegisterCredentialMessage = {
        operation: MessageType.REGISTER_CREDENTIAL,
        ipfs_cid,
        vc_id,
        encrypted_passphrase: encrypted_passphrase.serialized!,
        guardian_id: testGuardians[0].id,
      };

      await expect(() =>
        credentialRegistry.registerCredential(message)
      ).rejects.toBeTruthy();

      expect(mockStore.write).not.toHaveBeenCalled();
    });
  });

  describe('canHandleCredential', () => {
    it('returns true if the store has a value for the given id', async () => {
      const id = 'example-id';
      const storedValue = '0.0.123';
      mockStore.read.mockResolvedValue(storedValue);

      const result = await credentialRegistry.canHandleCredential(id);

      expect(mockStore.read).toHaveBeenCalledWith(`known_credentials:${id}`);
      expect(result).toBe(true);
    });

    it('returns false if the store does not have a value for the given id', async () => {
      const id = 'example-id';
      mockStore.read.mockResolvedValue(null);

      const result = await credentialRegistry.canHandleCredential(id);

      expect(mockStore.read).toHaveBeenCalledWith(`known_credentials:${id}`);
      expect(result).toBe(false);
    });
  });

  describe('fetchCredential', () => {
    it('returns the cached credential if available in the store', async () => {
      const id = 'example-id';
      const credential = {
        id: 'example-id',
        description: 'Cached credential',
      };
      const cached_at = new Date();
      const cachedValue = {
        credential: credential,
        guardian_id: testGuardians[0].id,
        cached_at,
      };
      mockStore.read.mockResolvedValue(cachedValue);

      const result = await credentialRegistry.fetchCredential(id);

      expect(mockStore.read).toHaveBeenCalledWith(`vc_cache:${id}`);
      expect(ipfsReader).not.toHaveBeenCalled();
      expect(result).toEqual(cachedValue);
    });

    it('fetches the credential from the store, caches it and returns it if not available in cache', async () => {
      const id = 'example-id';
      const ipfs_cid = 'Qm1234';
      const credential = {
        id: 'example-id',
        description: 'Fetched credential',
      };
      const passphrase =
        '668301721f4f5a31c7eb7d314d4c4c695a73afdf43c3d191db118fa2098c02d7';

      const encryptedCredential = await encryptWithKeyDerivedFromString({
        data: Buffer.from(JSON.stringify(credential), 'utf-8'),
        passphrase,
        strategy: CipherStrategy.AES_GCM,
      });

      const encrypted_passphrase = await encryptWithKeyDerivedFromString({
        data: Buffer.from(passphrase, 'utf-8'),
        passphrase: testGuardians[0].passphrase_encryption_key,
        strategy: CipherStrategy.AES_GCM,
      });

      // Cached value not available
      mockStore.read.mockResolvedValueOnce(null);
      /// The stored registration message
      mockStore.read.mockResolvedValueOnce({
        guardian_id: testGuardians[0].id,
        operation: MessageType.REGISTER_CREDENTIAL,
        vc_id: id,
        ipfs_cid,
        encrypted_passphrase: encrypted_passphrase.serialized,
      });
      ipfsReader.mockResolvedValue(encryptedCredential.serialized);

      const result = await credentialRegistry.fetchCredential(id);

      expect(mockStore.read).toHaveBeenCalledWith(`vc_cache:${id}`);
      expect(mockStore.read).toHaveBeenCalledWith(`known_credentials:${id}`);
      expect(ipfsReader).toHaveBeenCalledWith(ipfs_cid, {
        resultType: ResultType.TEXT,
      });
      expect(mockStore.write).toHaveBeenCalledWith(`vc_cache:${id}`, {
        credential: credential,
        guardian_id: testGuardians[0].id,
        cached_at: expect.any(Date),
      });

      expect(result).toEqual({
        credential: credential,
        guardian_id: testGuardians[0].id,
        cached_at: expect.any(Date),
      });
    });
  });
});
