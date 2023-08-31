import { describe, expect, it } from '@jest/globals';
import { GuardianConfig } from '../../src/util/config.js';
import { PresentationVerifierDigitalBazaar } from '../../src/vc/presentation-verifier-digitalbazaar.js';
import { authorizationDetails } from '../fixtures/data.js';
import { testLoader } from '../fixtures/test-loader.js';

describe('PresentationVerifierDigitalBazaar', () => {
  const testGuardians: GuardianConfig[] = [
    {
      id: 'guardian_1',
      master_passphrase:
        '668301721f4f5a31c7eb7d314d4c4c695a73afdf43c3d191db118fa2098c02d7',
      topic_ids: ['0.0.0.1'],
      trusted_issuers: [
        {
          did: 'did:key:1234',
          credential_types: ['UniversityCredential', 'TertiaryCredential'],
        },
        {
          did: 'did:key:6789',
          credential_types: ['UniversityCredential'],
        },
      ],
    },
  ];

  it('isTrusted returns true if the issuer can access the given credential type', async () => {
    const verifier = new PresentationVerifierDigitalBazaar(
      testLoader,
      testGuardians
    );

    await expect(
      verifier.isTrusted('guardian_1', 'did:key:1234', 'UniversityCredential')
    ).resolves.toEqual(true);

    await expect(
      verifier.isTrusted('guardian_1', 'did:key:1234', ['TertiaryCredential'])
    ).resolves.toEqual(true);

    await expect(
      verifier.isTrusted('guardian_1', 'did:key:1234', [
        'UniversityCredential',
        'TertiaryCredential',
      ])
    ).resolves.toEqual(true);

    await expect(
      verifier.isTrusted('guardian_1', 'did:key:1234', ['AcademicCredential'])
    ).resolves.toEqual(false);

    await expect(
      verifier.isTrusted('guardian_1', 'did:key:6789', ['TertiaryCredential'])
    ).resolves.toEqual(false);

    await expect(
      verifier.isTrusted('guardian_7', 'did:key:999', ['UniversityCredential'])
    ).resolves.toEqual(false);
  });

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
