import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  CipherStrategy,
  EncryptionKey,
  encryptWithKey,
  encryptWithKeyDerivedFromString,
  utf8ToBytes,
} from '@meeco/cryppo';
import { MessageType } from '../../src/hcs/messages.js';
import { ResultType, fetchIPFSFile } from '../../src/util/ipfs-fetch.js';
import { KeyValueStorage } from '../../src/util/key-value-storage.js';
import { CredentialRegistry } from '../../src/vc/credential-registry.js';
import { SpyObject, createSpyObject } from '../fixtures/create-spy-object.js';

describe('CredentialRegistry', () => {
  let mockStore: SpyObject<KeyValueStorage>;
  let ipfsReader: jest.Mock<typeof fetchIPFSFile>;
  let credentialRegistry: CredentialRegistry;

  beforeEach(() => {
    mockStore = createSpyObject<KeyValueStorage>();
    ipfsReader = jest.fn();
    credentialRegistry = new CredentialRegistry(mockStore, ipfsReader);
  });

  describe('registerCredential', () => {
    it('writes the ipfs cid and passphrase to the store with the correct key', async () => {
      const vc_id = 'example-id';
      const ipfs_cid = 'Qm12345';
      const key = EncryptionKey.generateRandom(32);
      const passphrase =
        '668301721f4f5a31c7eb7d314d4c4c695a73afdf43c3d191db118fa2098c02d7';
      const encrypted_passphrase = await encryptWithKey({
        data: Buffer.from(passphrase, 'utf-8'),
        key: key,
        strategy: CipherStrategy.AES_GCM,
      });

      await credentialRegistry.registerCredential(
        {
          operation: MessageType.REGISTER_CREDENTIAL,
          ipfs_cid,
          vc_id,
          encrypted_passphrase: encrypted_passphrase.serialized!,
        },
        key
      );

      expect(mockStore.write).toHaveBeenCalledWith(
        `known_credentials:${vc_id}`,
        {
          ipfs_cid,
          passphrase,
        }
      );
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
      const cachedValue = { credential: credential };
      mockStore.read.mockResolvedValue(cachedValue);

      const result = await credentialRegistry.fetchCredential(id);

      expect(mockStore.read).toHaveBeenCalledWith(`vc:${id}`);
      expect(ipfsReader).not.toHaveBeenCalled();
      expect(result).toBe(credential);
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
        data: utf8ToBytes(JSON.stringify(credential)),
        passphrase,
        strategy: CipherStrategy.AES_GCM,
      });

      // Cached value not available
      mockStore.read.mockResolvedValueOnce(null);
      mockStore.read.mockResolvedValueOnce({
        ipfs_cid,
        passphrase,
      });
      ipfsReader.mockResolvedValue(encryptedCredential.serialized);

      const result = await credentialRegistry.fetchCredential(id);

      expect(mockStore.read).toHaveBeenCalledWith(`vc:${id}`);
      expect(mockStore.read).toHaveBeenCalledWith(`known_credentials:${id}`);
      expect(ipfsReader).toHaveBeenCalledWith(ipfs_cid, {
        resultType: ResultType.TEXT,
      });
      expect(mockStore.write).toHaveBeenCalledWith(`vc:${id}`, {
        credential,
        cachedAt: expect.any(Date),
      });

      expect(result).toEqual(credential);
    });
  });
});
