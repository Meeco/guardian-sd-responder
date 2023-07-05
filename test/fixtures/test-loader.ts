import { fetchJson } from '../../src/util/fetch-json.js';
import didDoc from './contexts/did-doc.json';
import exampleCredentialContext from './contexts/example-credential-context.json';

// Pre-cached test items
const loaderCache: any = {
  'did:hedera:testnet:5zoGqou2oPg9Rz2opbf8moyNwNeKeP7bYntNCdmjuJ9z_0.0.0#did-root-key-bbs':
    didDoc,
  'https://ipfs.io/ipfs/QmYmAKqchE8J6feEEKwqZeJwSrC6NRQsCHx2dBs8Vs7ECe':
    exampleCredentialContext,
};

// Whitelist of URL's that will be loaded during testing
const acceptedUrls = [
  'https://www.w3.org/2018/credentials/v1',
  'https://w3id.org/security/bbs/v1',
  'https://w3id.org/security/v1',
  'https://w3id.org/security/v2',
  'https://w3id.org/security/suites/bls12381-2020/v1',
  'https://www.w3.org/ns/did/v1',
  'https://w3id.org/security/suites/jws-2020/v1',
];

export const testLoader = async (documentUrl: string) => {
  if (loaderCache[documentUrl]) {
    return {
      contextUrl: null,
      document: loaderCache[documentUrl],
      documentUrl,
    } as any;
  }

  try {
    if (acceptedUrls.includes(documentUrl)) {
      const doc = await fetchJson(documentUrl);
      loaderCache[documentUrl] = doc;
      return {
        contextUrl: null,
        document: loaderCache[documentUrl],
        documentUrl,
      } as any;
    }
  } catch (err) {
    console.error(err);
  }

  throw new Error(`Test loader could not load ${documentUrl}`);
};
