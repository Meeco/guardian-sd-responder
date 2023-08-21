import { describe, expect, it } from '@jest/globals';
import { authorizationDetails } from '../fixtures/data.js';
// import { PresentationVerifierTransmute } from '../../src/vc/presentation-verifier-transmute.js';
// import { testLoader } from '../fixtures/test-loader.js';

// This test fails to run in jest with ESM (issue with Buffer from a transitive dependency)
describe('PresentationVerifierTransmute', () => {
  // it.skip('isTrusted returns true if the issuer can access the given credential type', async () => {
  //   const verifier = new PresentationVerifierTransmute(
  //     testLoader,
  //     testGuardians
  //   );

  // await expect(
  //   verifier.isTrusted('guardian_1', 'did:key:1234', 'UniversityCredential')
  // ).resolves.toEqual(true);

  // await expect(
  //   verifier.isTrusted('guardian_1', 'did:key:1234', ['TertiaryCredential'])
  // ).resolves.toEqual(true);

  // await expect(
  //   verifier.isTrusted('guardian_1', 'did:key:1234', [
  //     'UniversityCredential',
  //     'TertiaryCredential',
  //   ])
  // ).resolves.toEqual(true);

  // await expect(
  //   verifier.isTrusted('guardian_1', 'did:key:1234', ['AcademicCredential'])
  // ).resolves.toEqual(false);

  // await expect(
  //   verifier.isTrusted('guardian_1', 'did:key:6789', ['UniversityCredential'])
  // ).resolves.toEqual(false);

  // await expect(
  //   verifier.isTrusted('guardian_7', 'did:key:999', ['UniversityCredential'])
  // ).resolves.toEqual(false);
  // });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('verifies a valid presentation', async () => {
    // const verifier = new PresentationVerifierTransmute(testLoader);
    const verifier = {} as any;
    await expect(
      verifier.verify(authorizationDetails.verifiablePresentation)
    ).resolves.toEqual(true);
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('does not verify an invalid presentation', async () => {
    // const verifier = new PresentationVerifierTransmute(testLoader);
    const verifier = {} as any;
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

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('does not verify a tampered presentation', async () => {
    // const verifier = new PresentationVerifierTransmute(testLoader);
    const verifier = {} as any;
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
