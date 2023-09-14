import { describe, expect, it } from '@jest/globals';
import { HcsEncryption } from '../../src/hcs/hcs-encryption.js';

describe('hcs encryption', () => {
  const responderPrivateKeyMultibase =
    'zrv5Fdaiw8JfMkr7fyUyGY6zNmazwvyxuXBz8eAtmztZd3iBQ5TtQ1CwVJ5mSXgoVXssahtoGkcVbqpo18fB5g6CnDM';

  const responderDidDoc = {
    '@context': 'https://www.w3.org/ns/did/v1',
    id: 'did:hedera:testnet:z6MkokyNgNyTsUFpzZhdViALRgZ2BQ9PhxYUchFU4nTir91q_0.0.0',
    authentication: [
      'did:hedera:testnet:z6MkokyNgNyTsUFpzZhdViALRgZ2BQ9PhxYUchFU4nTir91q_0.0.0#did-root-key',
    ],
    verificationMethod: [
      {
        id: 'did:hedera:testnet:z6MkokyNgNyTsUFpzZhdViALRgZ2BQ9PhxYUchFU4nTir91q_0.0.0#did-root-key',
        type: 'Ed25519VerificationKey2020',
        publicKeyMultibase: 'z6MkokyNgNyTsUFpzZhdViALRgZ2BQ9PhxYUchFU4nTir91q',
        controller:
          'did:hedera:testnet:z6MkokyNgNyTsUFpzZhdViALRgZ2BQ9PhxYUchFU4nTir91q_0.0.0',
      },
      {
        id: 'did:hedera:testnet:z6MkokyNgNyTsUFpzZhdViALRgZ2BQ9PhxYUchFU4nTir91q_0.0.0#did-root-key-bbs',
        type: 'Bls12381G2Key2020',
        controller:
          'did:hedera:testnet:z6MkokyNgNyTsUFpzZhdViALRgZ2BQ9PhxYUchFU4nTir91q_0.0.0',
        publicKeyBase58:
          'ys1xHA2w9eUeQcu66dPZ7HrXPWJATxVjwA8XDtwKfbjNKaKVgDGrqYYf5VSNXPbgUSGY8Z3LYtdY2r2QKGBg7eEH45S7adH1gwLopuVVqp1pDNpFdXaQzQiTnRNCThLg1KF',
      },
    ],
    assertionMethod: ['#did-root-key', '#did-root-key-bbs'],
  };

  const responderDidDocOld = {
    ...responderDidDoc,
    publicKey: responderDidDoc.verificationMethod,
    verificationMethod: undefined,
  };

  const requestorPrivateKeyMultibase =
    'zrv5gtjREBZdLxDTRXPk92Yd9JNj1iweZquz7U78qfuqDLftApGn28Te9TqCj8PAsY5r5K3tLaYNQAKN2qjhY4hiGtz';
  const requestorDidDoc = {
    '@context': 'https://www.w3.org/ns/did/v1',
    id: 'did:hedera:testnet:z6MkgyCykwm4PhQncy9vK7WXi4F1wx4eXjQZnE7CEedgPpMg_0.0.0',
    authentication: [
      'did:hedera:testnet:z6MkgyCykwm4PhQncy9vK7WXi4F1wx4eXjQZnE7CEedgPpMg_0.0.0#did-root-key',
    ],
    verificationMethod: [
      {
        id: 'did:hedera:testnet:z6MkgyCykwm4PhQncy9vK7WXi4F1wx4eXjQZnE7CEedgPpMg_0.0.0#did-root-key',
        type: 'Ed25519VerificationKey2020',
        publicKeyMultibase: 'z6MkgyCykwm4PhQncy9vK7WXi4F1wx4eXjQZnE7CEedgPpMg',
        controller:
          'did:hedera:testnet:z6MkgyCykwm4PhQncy9vK7WXi4F1wx4eXjQZnE7CEedgPpMg_0.0.0',
      },
      {
        id: 'did:hedera:testnet:z6MkgyCykwm4PhQncy9vK7WXi4F1wx4eXjQZnE7CEedgPpMg_0.0.0#did-root-key-bbs',
        type: 'Bls12381G2Key2020',
        controller:
          'did:hedera:testnet:z6MkgyCykwm4PhQncy9vK7WXi4F1wx4eXjQZnE7CEedgPpMg_0.0.0',
        publicKeyBase58:
          'trDYeNsSKpSUY6dB8SnM365CqUGcV45J6ULCm3PpYVMmQmKb31dDgvEFZnnJ9ZF2sUJ87tYveNNy5QWYCD9Kmxh5NuCH5EhzhwwpnXP6ALbJMZX2qwSLCMeLCC3FydmiQaf',
      },
    ],
    assertionMethod: ['#did-root-key', '#did-root-key-bbs'],
  };

  const requestorDidDocOld = {
    ...requestorDidDoc,
    publicKey: requestorDidDoc.verificationMethod,
    verificationMethod: undefined,
  };

  it('returns the public key to use for encryption', async () => {
    const mockResolver = (did: string) => {
      if (did === requestorDidDoc.id) return requestorDidDoc;
      if (did === responderDidDoc.id) return responderDidDoc;
      throw new Error(`Could not resolve did "${did}"`);
    };

    const responder = new HcsEncryption(
      {
        id: responderDidDoc.verificationMethod[0].id,
        controller: responderDidDoc.id,
        type: 'Ed25519VerificationKey2020',
        publicKeyMultibase:
          responderDidDoc.verificationMethod[0].publicKeyMultibase!,
        privateKeyMultibase: responderPrivateKeyMultibase,
      },
      mockResolver
    );

    expect(responder.publicKeyId).toEqual(
      'did:hedera:testnet:z6MkokyNgNyTsUFpzZhdViALRgZ2BQ9PhxYUchFU4nTir91q_0.0.0#did-root-key'
    );
  });

  it('encrypts and decrypts a message (both directions)', async () => {
    const mockResolver = (did: string) => {
      if (did === requestorDidDoc.id) return requestorDidDoc;
      if (did === responderDidDoc.id) return responderDidDoc;
      throw new Error(`Could not resolve did "${did}"`);
    };

    const client = new HcsEncryption(
      {
        id: requestorDidDoc.verificationMethod[0].id,
        controller: requestorDidDoc.id,
        type: 'Ed25519VerificationKey2020',
        publicKeyMultibase:
          requestorDidDoc.verificationMethod[0].publicKeyMultibase!,
        privateKeyMultibase: requestorPrivateKeyMultibase,
      },
      mockResolver
    );
    const responder = new HcsEncryption(
      {
        id: responderDidDoc.verificationMethod[0].id,
        controller: responderDidDoc.id,
        type: 'Ed25519VerificationKey2020',
        publicKeyMultibase:
          responderDidDoc.verificationMethod[0].publicKeyMultibase!,
        privateKeyMultibase: responderPrivateKeyMultibase,
      },
      mockResolver
    );

    // Alice to Bob
    const message1 = {
      message: 'Hello, Bob!',
    };
    const encrypted1 = await client.encrypt(
      message1,
      responderDidDoc.verificationMethod[0].id
    );
    const decrypted1 = await responder.decrypt(encrypted1);
    expect(decrypted1).toEqual(message1);

    // Bob to Alice
    const message2 = {
      message: 'Hi, Alice!',
    };
    const encrypted2 = await client.encrypt(
      message2,
      responderDidDoc.verificationMethod[0].id
    );
    const decrypted2 = await responder.decrypt(encrypted2);
    expect(decrypted2).toEqual(message2);
  });

  it('is backwards compatible with with publicKey documents', async () => {
    const mockResolver = (did: string) => {
      if (did === requestorDidDoc.id) return requestorDidDocOld;
      if (did === responderDidDoc.id) return responderDidDocOld;
      throw new Error(`Could not resolve did "${did}"`);
    };

    const client = new HcsEncryption(
      {
        id: requestorDidDocOld.publicKey[0].id,
        controller: requestorDidDoc.id,
        type: 'Ed25519VerificationKey2020',
        publicKeyMultibase: requestorDidDocOld.publicKey[0].publicKeyMultibase!,
        privateKeyMultibase: requestorPrivateKeyMultibase,
      },
      mockResolver
    );
    const responder = new HcsEncryption(
      {
        id: responderDidDocOld.publicKey[0].id,
        controller: responderDidDoc.id,
        type: 'Ed25519VerificationKey2020',
        publicKeyMultibase: responderDidDocOld.publicKey[0].publicKeyMultibase!,
        privateKeyMultibase: responderPrivateKeyMultibase,
      },
      mockResolver
    );

    // Alice to Bob
    const message1 = {
      message: 'Hello, Bob!',
    };
    const encrypted1 = await client.encrypt(
      message1,
      responderDidDocOld.publicKey[0].id
    );
    const decrypted1 = await responder.decrypt(encrypted1);
    expect(decrypted1).toEqual(message1);

    // Bob to Alice
    const message2 = {
      message: 'Hi, Alice!',
    };
    const encrypted2 = await client.encrypt(
      message2,
      responderDidDocOld.publicKey[0].id
    );
    const decrypted2 = await responder.decrypt(encrypted2);
    expect(decrypted2).toEqual(message2);
  });
});
