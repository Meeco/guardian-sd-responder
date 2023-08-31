import { describe, expect, it } from '@jest/globals';
import { GuardianConfig } from '../../src/util/config.js';
import { PresentationVerifierDigitalBazaar } from '../../src/vc/presentation-verifier-digitalbazaar.js';
import { authorizationDetails } from '../fixtures/data.js';
import { testLoader } from '../fixtures/test-loader.js';

describe('PresentationVerifierDigitalBazaar', () => {
  const testGuardians: GuardianConfig[] = [
    {
      id: 'guardian_1',
      passphrase_encryption_key:
        '668301721f4f5a31c7eb7d314d4c4c695a73afdf43c3d191db118fa2098c02d7',
      topic_ids: ['0.0.0.1'],
      issued_credentials: [],
    },
  ];

  it('verifies a valid presentation', async () => {
    const verifier = new PresentationVerifierDigitalBazaar(
      testLoader,
      testGuardians
    );
    await expect(
      verifier.verify(authorizationDetails.verifiablePresentation)
    ).resolves.toEqual(true);
  });

  it('does not verify an invalid presentation', async () => {
    const verifier = new PresentationVerifierDigitalBazaar(
      testLoader,
      testGuardians
    );
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
    const verifier = new PresentationVerifierDigitalBazaar(
      testLoader,
      testGuardians
    );
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
