import { Logger } from 'winston';
import { fetchJson } from '../util/fetch-json.js';
import { ResultType, fetchIPFSFile } from '../util/ipfs-fetch.js';
import { KeyValueStorage } from '../util/key-value-storage.js';
import { resolveDidDocument } from './did-resolve.js';

/**
 * Custom json-ld document loader.
 * Based on the node.js document loader implementation but with support for
 * `ipfs://` and `did:` URNs and using native fetch.
 *
 * https://github.com/digitalbazaar/jsonld.js/blob/main/lib/documentLoaders/node.js
 *
 * Probably needs some more security considerations before being ready for production.
 * https://github.com/digitalbazaar/jsonld-signatures#security
 */
export class PexDocumentLoader {
  private readonly cachePrefix = `doc_cache`;

  constructor(
    private readonly storage: KeyValueStorage,
    private readonly logger?: Logger
  ) {}

  public get loader() {
    return this.load.bind(this);
  }

  private async load(url: string) {
    this.logger?.verbose(`Request document "${url}"`);
    const [protocol] = url.split(':');
    const cacheKey = `${this.cachePrefix}:${url}`;

    if (
      url ===
      'https://ipfs.io/ipfs/QmdafSLzFLrTSp3fPG8CpcjH5MehtDFY4nxjr5CVq3z1rz'
    ) {
      return this.wrapResponse(url, {
        '@context': {
          '@version': 1.1,
          '@protected': true,
          name: 'http://schema.org/name',
          description: 'http://schema.org/description',
          identifier: 'http://schema.org/identifier',
          auditor_template: {
            '@id': 'https://example-credentials.org#auditor_template',
            '@context': {
              '@version': 1.1,
              '@protected': true,
              id: '@id',
              type: '@type',
              schema: 'http://schema.org/',
              given_name: {
                '@id': 'custom:given_name',
                '@type': 'schema:text',
              },
              member_id: {
                '@id': 'custom:member_id',
                '@type': 'schema:text',
              },
              member_since: {
                '@id': 'custom:member_since',
                '@type': 'schema:text',
              },
              valid_until: {
                '@id': 'custom:valid_until',
                '@type': 'schema:text',
              },
            },
          },
        },
      });
    }

    const cached = await this.storage.read(cacheKey);
    if (cached) {
      this.logger?.verbose(`Return cached result for "${url}"`);
      return this.wrapResponse(url, cached);
    }

    let document: any;
    switch (protocol) {
      case 'did':
        document = await resolveDidDocument(url);
        break;
      case 'ipfs':
        document = await fetchIPFSFile(url, { resultType: ResultType.JSON });
        break;
      case 'https':
        document = await fetchJson(url);
        break;
      default:
        throw new Error(
          `Refused to load document "${url}" - unsupported protocol`
        );
    }

    if (!document) {
      const error = `Failed to load document at: "${url}"`;
      this.logger?.error(error);
      throw new Error(error);
    }

    this.logger?.debug(`Cache document ${cacheKey}`);
    await this.storage.write(cacheKey, document);

    return this.wrapResponse(url, document);
  }

  private wrapResponse(url: string, document: any) {
    return {
      contextUrl: null,
      document,
      documentUrl: url,
    };
  }
}
