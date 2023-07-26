import { describe, expect, it } from '@jest/globals';
import { PresentationVerifierDigitalBazaar } from '../../src/vc/presentation-verifier-digitalbazaar.js';
import { authorizationDetails } from '../fixtures/data.js';
import { testLoader } from '../fixtures/test-loader.js';

describe('PresentationVerifierDigitalBazaar', () => {
  it('verifies a valid presentation', async () => {
    const verifier = new PresentationVerifierDigitalBazaar(testLoader);
    await expect(
      verifier.verify(authorizationDetails.verifiablePresentation)
    ).resolves.toEqual(true);
  });

  it('does not verify an invalid presentation', async () => {
    const verifier = new PresentationVerifierDigitalBazaar(testLoader);
    await expect(
      verifier.verify({
        ...authorizationDetails.verifiablePresentation,
        proof: {
          ...authorizationDetails.verifiablePresentation.proof,
          challenge: 'incorrect',
        },
      })
    ).resolves.toEqual(false);
  });

  it('does not verify a tampered presentation', async () => {
    const verifier = new PresentationVerifierDigitalBazaar(testLoader);
    const presentation = {
      ...authorizationDetails.verifiablePresentation,
      verifiableCredential: {
        ...authorizationDetails.verifiablePresentation.verifiableCredential[0],
        credentialSubject: {
          ...authorizationDetails.verifiablePresentation.verifiableCredential[0]
            .credentialSubject,
          authorized: true,
        },
      },
    };
    await expect(verifier.verify(presentation)).resolves.toEqual(false);
  });
});
