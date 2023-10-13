import { fetchJson } from '../../src/util/fetch-json.js';
import { ffc, sel, z6m } from './contexts/did-docs.js';
import exampleCredentialContext from './contexts/example-credential-context.json';

// Pre-cached test items
const loaderCache: any = {
  'did:key:z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL': sel,
  'did:key:z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL#z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL':
    sel,
  'did:key:z6MkugGg1NB8z7uqLsigSGicoxPsMBaBi9L6x7zPSLqw76R1': z6m,
  'did:key:z6MkugGg1NB8z7uqLsigSGicoxPsMBaBi9L6x7zPSLqw76R1#z6MkugGg1NB8z7uqLsigSGicoxPsMBaBi9L6x7zPSLqw76R1':
    z6m,
  'did:hedera:testnet:FfcjotQh3MX6D8V97Yzvw3a1GupeV6kBjksviKraL75L_0.0.0': ffc,
  'did:hedera:testnet:FfcjotQh3MX6D8V97Yzvw3a1GupeV6kBjksviKraL75L_0.0.0#did-root-key-bbs':
    ffc,
  'https://ipfs.io/ipfs/QmYmAKqchE8J6feEEKwqZeJwSrC6NRQsCHx2dBs8Vs7ECe':
    exampleCredentialContext,
};

export const didKeyData = {
  id: 'did:hedera:testnet:FfcjotQh3MX6D8V97Yzvw3a1GupeV6kBjksviKraL75L_0.0.0#did-root-key',
  controller:
    'did:hedera:testnet:FfcjotQh3MX6D8V97Yzvw3a1GupeV6kBjksviKraL75L_0.0.0',
  type: 'Ed25519VerificationKey2018',
  privateKeyBase58:
    '3NBjQ17bjR3kz94KU64r4iJ4hH8KA4RRVzKfiN7c8yUA6GMNj1RUtijLUY5phJ4hRhM6dSMKQCCWMyGPX772cjg3',
  publicKeyBase58: '7pa5nP3omvPiXFCNjcpwzpvGAumhrQtvRQ9WY9UfmfM9',
};

// Whitelist of URL's that will be loaded during testing
const acceptedUrls = [
  'https://identity.foundation/presentation-exchange/submission/v1',
  'https://w3id.org/security/bbs/v1',
  'https://w3id.org/security/suites/bls12381-2020/v1',
  'https://w3id.org/security/suites/ed25519-2018/v1',
  'https://w3id.org/security/suites/ed25519-2020/v1',
  'https://w3id.org/security/suites/jws-2020/v1',
  'https://w3id.org/security/v1',
  'https://w3id.org/security/v2',
  'https://www.w3.org/2018/credentials/examples/v1',
  'https://www.w3.org/2018/credentials/v1',
  'https://www.w3.org/ns/did/v1',
  'https://www.w3.org/ns/odrl.jsonld',
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
      const doc = await fetchJson({ url: documentUrl });
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
  const message = `Test loader could not load ${documentUrl}`;
  console.log(message);
  throw new Error(message);
};
