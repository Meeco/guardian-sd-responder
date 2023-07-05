import { beforeEach, describe, expect, it } from '@jest/globals';
import { HfsReader } from '../../src/hfs/hfs-reader.js';
import { KeyValueStorage } from '../../src/util/key-value-storage.js';
import { CredentialRegistry } from '../../src/vc/credential-registry.js';
import { SpyObject, createSpyObject } from '../fixtures/create-spy-object.js';

describe('CredentialRegistry', () => {
  let mockStore: SpyObject<KeyValueStorage>;
  let mockHfsReader: SpyObject<HfsReader>;
  let credentialRegistry: CredentialRegistry;

  beforeEach(() => {
    mockStore = createSpyObject<KeyValueStorage>();
    mockHfsReader = createSpyObject<HfsReader>();
    credentialRegistry = new CredentialRegistry(mockStore, mockHfsReader);
  });

  describe('registerCredential', () => {
    it('writes the hederaFileId to the store with the correct key', () => {
      const id = 'example-id';
      const hederaFileId = '0.0.123';

      credentialRegistry.registerCredential(id, hederaFileId);

      expect(mockStore.write).toHaveBeenCalledWith(
        `known_credentials:${id}`,
        hederaFileId
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
      expect(mockHfsReader.readFileAsJson).not.toHaveBeenCalled();
      expect(result).toBe(credential);
    });

    it('fetches the credential from the store, caches it and returns it if not available in cache', async () => {
      const id = 'example-id';
      const credentialFileId = 'example-credential-file-id';
      const credential = {
        id: 'example-id',
        description: 'Fetched credential',
      };

      // Cached value not available
      mockStore.read.mockResolvedValueOnce(null);
      mockStore.read.mockResolvedValueOnce(credentialFileId);
      mockHfsReader.readFileAsJson.mockResolvedValue(credential);

      const result = await credentialRegistry.fetchCredential(id);

      expect(mockStore.read).toHaveBeenCalledWith(`vc:${id}`);
      expect(mockStore.read).toHaveBeenCalledWith(`known_credentials:${id}`);
      expect(mockHfsReader.readFileAsJson).toHaveBeenCalledWith(
        credentialFileId
      );
      expect(mockStore.write).toHaveBeenCalledWith(`vc:${id}`, {
        credential,
        cachedAt: expect.any(Date),
      });

      expect(result).toBe(credential);
    });
  });
});
