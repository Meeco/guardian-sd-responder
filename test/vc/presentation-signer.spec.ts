import { Ed25519Signature2020 } from '@digitalbazaar/ed25519-signature-2020';
import { Ed25519VerificationKey2020 } from '@digitalbazaar/ed25519-verification-key-2020';
import { describe, expect, it } from '@jest/globals';
import {
  Ed25519VerificationKey2018Key,
  PresentationSigner,
} from '../../src/vc/presentation-signer.js';
import { presentation } from '../fixtures/data.js';
import { testLoader } from '../fixtures/test-loader.js';

import { verify } from '@digitalbazaar/vc';

describe('PresentationSigner', () => {
  const documentLoader = testLoader;

  it('signs a presentation with an Ed25519VerificationKey2018', async () => {
    const keyPair: Ed25519VerificationKey2018Key = {
      id: 'did:hedera:testnet:FfcjotQh3MX6D8V97Yzvw3a1GupeV6kBjksviKraL75L_0.0.0#did-root-key',
      controller:
        'did:hedera:testnet:FfcjotQh3MX6D8V97Yzvw3a1GupeV6kBjksviKraL75L_0.0.0',
      type: 'Ed25519VerificationKey2018',
      privateKeyBase58:
        '31unnXkQDmm6C4WT2iquXwVEM5b6qBHG3UXtJ9UmCueHKZsdRqWoYdvYGh2qhQ77F5PLXEEWqqVQd6Yd82RvqVfR',
      publicKeyBase58: 'D1SkHPAaaYZPTxhHH9AS1T97pKHiqQabvKQWA46EuYaF',
    };
    const signer = new PresentationSigner(documentLoader, keyPair);

    const challenge = 'abcd';

    const signed = await signer.signPresentation(
      { ...presentation },
      challenge
    );

    expect(signed).toEqual({
      ...presentation,
      '@context': [
        ...presentation['@context'],
        'https://w3id.org/security/suites/ed25519-2020/v1',
      ],
      proof: {
        challenge,
        created: expect.any(String),
        proofPurpose: 'authentication',
        proofValue: expect.any(String),
        type: 'Ed25519Signature2020',
        verificationMethod:
          'did:hedera:testnet:FfcjotQh3MX6D8V97Yzvw3a1GupeV6kBjksviKraL75L_0.0.0#did-root-key',
      },
    });

    const key = await Ed25519VerificationKey2020.fromEd25519VerificationKey2018(
      {
        keyPair,
      }
    );
    const suite = new Ed25519Signature2020({ key });
    const verificationResult = await verify({
      presentation: signed,
      suite,
      documentLoader: testLoader,
      challenge,
    });

    expect(verificationResult.presentationResult.verified).toEqual(true);
  });

  it('signs a presentation with an Ed25519VerificationKey2020', async () => {
    const signer = new PresentationSigner(documentLoader, {
      controller:
        'did:hedera:testnet:FasH3qYV6EspnVhrHcZccwoV9TfRPHmrigQXz2E3VxRc',
      id: 'did:hedera:testnet:FasH3qYV6EspnVhrHcZccwoV9TfRPHmrigQXz2E3VxRc#did-root-key',
      privateKeyMultibase:
        'zrv2eoobQuBoq2Q7ZRvdNPtKuvDZmQCj7Fndq59UzqEF9D9pHarodwbWDYnmcrLXnACEXRyKFaWRrGFSSYpZQ8mqYGK',
      publicKeyMultibase: 'z6MkrThnsdR1v63raTXyxi8GrYh7dtZaFHpxcLKRzL4FpmMd',
      type: 'Ed25519VerificationKey2020',
    });

    const signed = await signer.signPresentation({ ...presentation }, 'abcd');
    expect(signed).toEqual({
      ...presentation,
      '@context': [
        ...presentation['@context'],
        'https://w3id.org/security/suites/ed25519-2020/v1',
      ],
      proof: {
        challenge: 'abcd',
        created: expect.any(String),
        proofPurpose: 'authentication',
        proofValue: expect.any(String),
        type: 'Ed25519Signature2020',
        verificationMethod:
          'did:hedera:testnet:FasH3qYV6EspnVhrHcZccwoV9TfRPHmrigQXz2E3VxRc#did-root-key',
      },
    });
  });
});
