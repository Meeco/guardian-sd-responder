import { describe, expect, it } from '@jest/globals';
import { PresentationSigner } from '../../src/vc/presentation-signer.js';
import { presentation } from '../fixtures/data.js';
import { testLoader } from '../fixtures/test-loader.js';

describe('PresentationSigner', () => {
  const documentLoader = testLoader;

  it('signs a presentation with an Ed25519VerificationKey2018', async () => {
    const signer = new PresentationSigner(documentLoader, {
      id: 'did:hedera:testnet:FasH3qYV6EspnVhrHcZccwoV9TfRPHmrigQXz2E3VxRc#did-root-key',
      controller:
        'did:hedera:testnet:FasH3qYV6EspnVhrHcZccwoV9TfRPHmrigQXz2E3VxRc',
      type: 'Ed25519VerificationKey2018',
      privateKeyBase58:
        '31unnXkQDmm6C4WT2iquXwVEM5b6qBHG3UXtJ9UmCueHKZsdRqWoYdvYGh2qhQ77F5PLXEEWqqVQd6Yd82RvqVfR',
      publicKeyBase58: 'D1SkHPAaaYZPTxhHH9AS1T97pKHiqQabvKQWA46EuYaF',
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
