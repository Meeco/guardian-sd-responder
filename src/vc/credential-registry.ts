import { bytesToUtf8, decryptWithKeyDerivedFromString } from '@meeco/cryppo';
import { Logger } from 'winston';
import { RegisterCredentialMessage } from '../hcs/messages.js';
import { GuardianConfig } from '../util/config.js';
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
  private readonly vcPrefix = 'vc_cache';

  constructor(
    private readonly store: KeyValueStorage,
    private readonly ipfsReader: typeof fetchIPFSFile,
    private readonly guardians: GuardianConfig[],
    private readonly logger?: Logger
  ) {}

  /**
   * Register a new encrypted credential with its IPFS CID and passphrase
   * (encrypted with `this.passphraseEncryptionKey`)
   */
  async registerCredential(details: RegisterCredentialMessage) {
    this.logger?.verbose(`Register credential "${details.vc_id}"`);

    // Ensure we can actually decrypt the passphrase before saving
    try {
      await this.decryptPassphrase(details);
    } catch (err) {
      const error = `Failed to decrypt passphrase in register credential message - ignoring`;
      this.logger?.error(error);
      throw new Error(error);
    }

    return this.store.write(`${this.knownPrefix}:${details.vc_id}`, details);
  }

  private async decryptPassphrase(details: RegisterCredentialMessage) {
    const passphrase = this.guardians.find(
      (item) => item.id === details.guardian_id
    )?.master_passphrase;

    if (!passphrase) {
      throw new Error(
        `Could not find a configured passphrase for guardian ${details.guardian_id} - check configuration file`
      );
    }

    const decryptedPassphrase = await decryptWithKeyDerivedFromString({
      passphrase,
      serialized: details.encrypted_passphrase,
    });
    if (!decryptedPassphrase) {
      throw new Error('Unable to register a credential without a passphrase');
    }

    return Buffer.from(decryptedPassphrase).toString('utf-8');
  }

  async canHandleCredential(id: string) {
    const canHandle = await this.store.read(`${this.knownPrefix}:${id}`);
    return !!canHandle;
  }

  public async fetchCredential(id: string): Promise<{
    credential: VerifiableCredential;
    guardian_id: string;
    cached_at?: Date;
  }> {
    this.logger?.debug(`Fetch credential "${id}"`);
    const cacheKey = `${this.vcPrefix}:${id}`;
    const cached = await this.store.read(cacheKey);
    if (cached) {
      this.logger?.debug(`Using cached credential for "${id}"`);
      return cached;
    }

    const registration = await this.store.read<RegisterCredentialMessage>(
      `${this.knownPrefix}:${id}`
    );
    this.logger?.debug(`Decrypt passphrase for credential "${id}"`);
    const passphrase = await this.decryptPassphrase(registration);

    this.logger?.debug(`Fetch "${id}" from IPFS`);
    const encryptedCredential = await this.ipfsReader(registration.ipfs_cid, {
      resultType: ResultType.TEXT,
    });

    this.logger?.debug(`Decrypt credential "${id}"`);
    const decryptedContents = await decryptWithKeyDerivedFromString({
      serialized: encryptedCredential,
      passphrase,
    });

    this.logger?.debug(`Parse decrypted credential "${id}"`);
    const credential: VerifiableCredential = JSON.parse(
      bytesToUtf8(decryptedContents!)
    );

    this.logger?.debug(`Write credential "${id}" to cache`);

    const cached_at = new Date();
    const response = {
      guardian_id: registration.guardian_id,
      credential,
      cached_at,
    };
    await this.store.write(cacheKey, response);

    return response;
  }
}
