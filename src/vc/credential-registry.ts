import {
  EncryptionKey,
  bytesToUtf8,
  decryptWithKey,
  decryptWithKeyDerivedFromString,
} from '@meeco/cryppo';
import { Logger } from 'winston';
import { RegisterCredentialMessage } from '../hcs/messages.js';
import { ResultType, fetchIPFSFile } from '../util/ipfs-fetch.js';
import { KeyValueStorage } from '../util/key-value-storage.js';
import { VerifiableCredential } from './types.js';

/**
 * Cache of known credentials that can be handled by this resolver.
 * Credentials that can have presentations fulfilled for them by this resolver
 * should be registered via `registerCredential` using the id of the credential
 * stored in HFS.
 */
export class CredentialRegistry {
  private readonly knownPrefix = 'known_credentials';
  private readonly vcPrefix = 'vc';

  constructor(
    private readonly store: KeyValueStorage,
    private readonly ipfsReader: typeof fetchIPFSFile,
    private readonly logger?: Logger
  ) {}

  /**
   * Register a new encrypted credential with its IPFS CID and passphrase
   * (encrypted with `this.passphraseEncryptionKey`)
   */
  async registerCredential(
    details: RegisterCredentialMessage,
    passphraseEncryptionKey: EncryptionKey
  ) {
    this.logger?.verbose(`Register credential "${details.vc_id}"`);

    // Ensure we can actually decrypt the passphrase
    const decryptedPassphrase = await decryptWithKey({
      key: passphraseEncryptionKey,
      serialized: details.encrypted_passphrase,
    });
    if (!decryptedPassphrase) {
      throw new Error('Unable to register a credential without a passphrase');
    }

    const passphrase = Buffer.from(decryptedPassphrase).toString('utf-8');

    return this.store.write(`${this.knownPrefix}:${details.vc_id}`, {
      ipfs_cid: details.ipfs_cid,
      passphrase,
    });
  }

  async canHandleCredential(id: string) {
    const canHandle = await this.store.read(`${this.knownPrefix}:${id}`);
    return !!canHandle;
  }

  public async fetchCredential(id: string): Promise<VerifiableCredential> {
    this.logger?.debug(`Fetch credential "${id}"`);
    const cacheKey = `${this.vcPrefix}:${id}`;
    const cached = await this.store.read(cacheKey);
    if (cached) {
      this.logger?.debug(`Using cached credential for "${id}"`);
      return cached.credential;
    }

    const { ipfs_cid, passphrase } = await this.store.read(
      `${this.knownPrefix}:${id}`
    );

    this.logger?.debug(`Fetch "${id}" from IPFS`);
    const encryptedCredential = await this.ipfsReader(ipfs_cid, {
      resultType: ResultType.TEXT,
    });

    this.logger?.debug(`Decrypt credential "${id}"`);

    const decryptedContents = await decryptWithKeyDerivedFromString({
      serialized: encryptedCredential,
      passphrase,
    });

    this.logger?.debug(`Parse decrypted credential "${id}"`);
    const credential = JSON.parse(bytesToUtf8(decryptedContents!));

    this.logger?.debug(`Write credential "${id}" to cache`);
    await this.store.write(cacheKey, {
      credential,
      cachedAt: new Date(),
    });

    return credential;
  }
}
