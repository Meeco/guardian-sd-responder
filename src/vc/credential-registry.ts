import { HfsReader } from '../hfs/hfs-reader.js';
import { KeyValueStorage } from '../util/key-value-storage.js';
import { VerifiableCredential } from './bbs-bls-service.js';

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
    private readonly hfsReader: HfsReader
  ) {}

  registerCredential(id: string, hederaFileId: string) {
    return this.store.write(`${this.knownPrefix}:${id}`, hederaFileId);
  }

  async canHandleCredential(id: string) {
    const canHandle = await this.store.read(`${this.knownPrefix}:${id}`);
    return !!canHandle;
  }

  public async fetchCredential(id: string): Promise<VerifiableCredential> {
    const cacheKey = `${this.vcPrefix}:${id}`;
    const cached = await this.store.read(cacheKey);
    if (cached) {
      return cached.credential;
    }
    const credentialFileId = await this.store.read(`${this.knownPrefix}:${id}`);
    const credential = await this.hfsReader.readFileAsJson(credentialFileId);

    await this.store.write(cacheKey, {
      credential,
      cachedAt: new Date(),
    });

    return credential;
  }
}
