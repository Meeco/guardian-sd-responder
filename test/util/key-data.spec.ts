import { Ed25519VerificationKey2018 } from '@digitalbazaar/ed25519-verification-key-2018';
import { Ed25519VerificationKey2020 } from '@digitalbazaar/ed25519-verification-key-2020';
import { describe, expect, it } from '@jest/globals';
import {
  buildEd25519VerificationKey,
  buildEd25519VerificationKey2020,
} from '../../src/util/key-data.js';

describe('key data helpers', () => {
  describe('build ed25519 key', () => {
    it('builds a 2018 verification key from a 2018 key', async () => {
      // From https://www.w3.org/community/reports/credentials/CG-FINAL-di-eddsa-2020-20220724/
      const key = await buildEd25519VerificationKey({
        id: 'https://example.com/issuer/123#key-0',
        type: 'Ed25519VerificationKey2018',
        controller: 'https://example.com/issuer/123',
        publicKeyBase58: 'dbDmZLTWuEYYZNHFLKLoRkEX4sZykkSLNQLXvMUyMB1',
        privateKeyBase58:
          '47QbyJEDqmHTzsdg8xzqXD8gqKuLufYRrKWTmB7eAaWHG2EAsQ2GUyqRqWWYT15dGuag52Sf3j4hs2mu7w52mgps',
      });

      expect(key).toBeTruthy();
      expect(key).toBeInstanceOf(Ed25519VerificationKey2018);
    });

    it('builds a 2020 verification key from a jwk 2018 key', async () => {
      // resolved from https://dev.uniresolver.io/1.0/identifiers/did:key:z6Mkr5wVSomgoJBCUT1ugrR6r5ZdJsfj4f2Vc2MSsqyWRHd9#z6Mkuykqu8SkrSMTw4zd4nXym5D2vsU1ihtXrChGhYpcPeV3
      const key = await buildEd25519VerificationKey({
        id: 'did:key:z6Mkr5wVSomgoJBCUT1ugrR6r5ZdJsfj4f2Vc2MSsqyWRHd9#z6Mkr5wVSomgoJBCUT1ugrR6r5ZdJsfj4f2Vc2MSsqyWRHd9',
        type: 'Ed25519VerificationKey2018',
        controller: 'did:key:z6Mkr5wVSomgoJBCUT1ugrR6r5ZdJsfj4f2Vc2MSsqyWRHd9',
        publicKeyJwk: {
          kty: 'OKP',
          crv: 'Ed25519',
          x: 'rNYRGP-Q8BeuyzxXxm87E4KPR_JseAW3Elmi3ZU_2gA',
        },
      });

      expect(key).toBeTruthy();
      expect(key).toBeInstanceOf(Ed25519VerificationKey2020);
    });

    it('builds a 2020 verification key from a 2020 key', async () => {
      // From https://www.w3.org/community/reports/credentials/CG-FINAL-di-eddsa-2020-20220724/
      const key = await buildEd25519VerificationKey({
        id: 'https://example.com/issuer/123#key-0',
        type: 'Ed25519KeyPair2020',
        controller: 'https://example.com/issuer/123',
        publicKeyMultibase: 'z6Mkf5rGMoatrSj1f4CyvuHBeXJELe9RPdzo2PKGNCKVtZxP',
        privateKeyMultibase:
          'zrv3kJcnBP1RpYmvNZ9jcYpKBZg41iSobWxSg3ix2U7Cp59kjwQFCT4SZTgLSL3HP8iGMdJs3nedjqYgNn6ZJmsmjRm',
      });
      expect(key).toBeTruthy();
      expect(key).toBeInstanceOf(Ed25519VerificationKey2020);
    });
  });

  describe('build 2020 key', () => {
    it('builds a 2020 verification key from a 2018 key', async () => {
      // From https://www.w3.org/community/reports/credentials/CG-FINAL-di-eddsa-2020-20220724/
      const key = await buildEd25519VerificationKey2020({
        id: 'https://example.com/issuer/123#key-0',
        type: 'Ed25519VerificationKey2018',
        controller: 'https://example.com/issuer/123',
        publicKeyBase58: 'dbDmZLTWuEYYZNHFLKLoRkEX4sZykkSLNQLXvMUyMB1',
        privateKeyBase58:
          '47QbyJEDqmHTzsdg8xzqXD8gqKuLufYRrKWTmB7eAaWHG2EAsQ2GUyqRqWWYT15dGuag52Sf3j4hs2mu7w52mgps',
      });

      expect(key).toBeTruthy();
      expect(key).toBeInstanceOf(Ed25519VerificationKey2020);
    });

    it('builds a 2020 verification key from a jwk 2018 key', async () => {
      // resolved from https://dev.uniresolver.io/1.0/identifiers/did:key:z6Mkr5wVSomgoJBCUT1ugrR6r5ZdJsfj4f2Vc2MSsqyWRHd9#z6Mkuykqu8SkrSMTw4zd4nXym5D2vsU1ihtXrChGhYpcPeV3
      const key = await buildEd25519VerificationKey2020({
        id: 'did:key:z6Mkr5wVSomgoJBCUT1ugrR6r5ZdJsfj4f2Vc2MSsqyWRHd9#z6Mkr5wVSomgoJBCUT1ugrR6r5ZdJsfj4f2Vc2MSsqyWRHd9',
        type: 'Ed25519VerificationKey2018',
        controller: 'did:key:z6Mkr5wVSomgoJBCUT1ugrR6r5ZdJsfj4f2Vc2MSsqyWRHd9',
        publicKeyJwk: {
          kty: 'OKP',
          crv: 'Ed25519',
          x: 'rNYRGP-Q8BeuyzxXxm87E4KPR_JseAW3Elmi3ZU_2gA',
        },
      });

      expect(key).toBeTruthy();
      expect(key).toBeInstanceOf(Ed25519VerificationKey2020);
    });

    it('builds a 2020 verification key from a 2020 key', async () => {
      // From https://www.w3.org/community/reports/credentials/CG-FINAL-di-eddsa-2020-20220724/
      const key = await buildEd25519VerificationKey({
        id: 'https://example.com/issuer/123#key-0',
        type: 'Ed25519KeyPair2020',
        controller: 'https://example.com/issuer/123',
        publicKeyMultibase: 'z6Mkf5rGMoatrSj1f4CyvuHBeXJELe9RPdzo2PKGNCKVtZxP',
        privateKeyMultibase:
          'zrv3kJcnBP1RpYmvNZ9jcYpKBZg41iSobWxSg3ix2U7Cp59kjwQFCT4SZTgLSL3HP8iGMdJs3nedjqYgNn6ZJmsmjRm',
      });

      expect(key).toBeTruthy();
      expect(key).toBeInstanceOf(Ed25519VerificationKey2020);
    });
  });
});
