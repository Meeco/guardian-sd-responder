export const ffc = {
  '@context': 'https://www.w3.org/ns/did/v1',
  id: 'did:hedera:testnet:FfcjotQh3MX6D8V97Yzvw3a1GupeV6kBjksviKraL75L_0.0.0',
  authentication: [
    'did:hedera:testnet:FfcjotQh3MX6D8V97Yzvw3a1GupeV6kBjksviKraL75L_0.0.0#did-root-key',
  ],
  verificationMethod: [
    {
      id: 'did:hedera:testnet:FfcjotQh3MX6D8V97Yzvw3a1GupeV6kBjksviKraL75L_0.0.0#did-root-key',
      type: 'Ed25519VerificationKey2018',
      controller:
        'did:hedera:testnet:FfcjotQh3MX6D8V97Yzvw3a1GupeV6kBjksviKraL75L_0.0.0',
      publicKeyMultibase: 'z3Ub7u123pmWYUbBwgVhkAMXKd4UQKD9qzrqAMfqsu6tb',
    },
    {
      id: 'did:hedera:testnet:FfcjotQh3MX6D8V97Yzvw3a1GupeV6kBjksviKraL75L_0.0.0#did-root-key-bbs',
      type: 'Bls12381G2Key2020',
      controller:
        'did:hedera:testnet:FfcjotQh3MX6D8V97Yzvw3a1GupeV6kBjksviKraL75L_0.0.0',
      publicKeyBase58:
        '24oo3edsjZmNrujMN2Kt6gLCDE393eiCTV6NnHX3RCb83FUuXwWTC9JGhAwnVP4PUnSex6m2qYixxUsfzWvGc4WH7z2vBgE3iNRtC6dhBaEWt1hv1XL1mKRPLvYQJ2QYrLJW',
    },
  ],
  assertionMethod: ['#did-root-key', '#did-root-key-bbs'],
};

export const sel = {
  '@context': [
    'https://www.w3.org/ns/did/v1',
    {
      Ed25519VerificationKey2018:
        'https://w3id.org/security#Ed25519VerificationKey2018',
      publicKeyJwk: {
        '@id': 'https://w3id.org/security#publicKeyJwk',
        '@type': '@json',
      },
    },
  ],
  id: 'did:key:z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL',
  verificationMethod: [
    {
      id: 'did:key:z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL#z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL',
      type: 'Ed25519VerificationKey2018',
      controller: 'did:key:z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL',
      publicKeyJwk: {
        kty: 'OKP',
        crv: 'Ed25519',
        x: 'VDXDwuGKVq91zxU6q7__jLDUq8_C5cuxECgd-1feFTE',
      },
    },
  ],
  authentication: [
    'did:key:z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL#z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL',
  ],
  assertionMethod: [
    'did:key:z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL#z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL',
  ],
};

export const z6m = {
  '@context': [
    'https://www.w3.org/ns/did/v1',
    {
      Ed25519VerificationKey2018:
        'https://w3id.org/security#Ed25519VerificationKey2018',
      publicKeyJwk: {
        '@id': 'https://w3id.org/security#publicKeyJwk',
        '@type': '@json',
      },
    },
  ],
  id: 'did:key:z6MkugGg1NB8z7uqLsigSGicoxPsMBaBi9L6x7zPSLqw76R1',
  verificationMethod: [
    {
      id: 'did:key:z6MkugGg1NB8z7uqLsigSGicoxPsMBaBi9L6x7zPSLqw76R1#z6MkugGg1NB8z7uqLsigSGicoxPsMBaBi9L6x7zPSLqw76R1',
      type: 'Ed25519VerificationKey2018',
      controller: 'did:key:z6MkugGg1NB8z7uqLsigSGicoxPsMBaBi9L6x7zPSLqw76R1',
      publicKeyJwk: {
        kty: 'OKP',
        crv: 'Ed25519',
        x: '4jSQeFemzplGYhBeO7vQSs6TI3XV13NwyKGR0NZVULQ',
      },
    },
  ],
  authentication: [
    'did:key:z6MkugGg1NB8z7uqLsigSGicoxPsMBaBi9L6x7zPSLqw76R1#z6MkugGg1NB8z7uqLsigSGicoxPsMBaBi9L6x7zPSLqw76R1',
  ],
  assertionMethod: [
    'did:key:z6MkugGg1NB8z7uqLsigSGicoxPsMBaBi9L6x7zPSLqw76R1#z6MkugGg1NB8z7uqLsigSGicoxPsMBaBi9L6x7zPSLqw76R1',
  ],
};
