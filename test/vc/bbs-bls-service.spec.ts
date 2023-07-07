import { describe, expect, it } from '@jest/globals';
import { BaseBbsBlsService } from '../../src/vc/bbs-bls-service.js';
import { PresentationSigner } from '../../src/vc/presentation-signer.js';
import { createSpyObject } from '../fixtures/create-spy-object.js';
import {
  presentationDefinition,
  selectiveCredential,
} from '../fixtures/data.js';
import { testLoader } from '../fixtures/test-loader.js';

describe('BaseBbsBlsService', () => {
  const signer = createSpyObject<PresentationSigner>();

  it('turns a derived proof into a signed presentation', async () => {
    const service = new BaseBbsBlsService(testLoader, signer);

    signer.signPresentation.mockImplementation((credential, challenge) => ({
      ...credential,
      proof: {
        challenge,
        proofValue: '1234',
        type: 'Ed25519Signature2020',
        verificationMethod: 'did:key:1234',
      },
    }));

    const presentation = await service.preparePresentation(
      presentationDefinition,
      selectiveCredential,
      '1234.5678'
    );

    const expectedPresentation = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://identity.foundation/presentation-exchange/submission/v1',
      ],
      type: ['VerifiablePresentation', 'PresentationSubmission'],
      presentation_submission: {
        id: expect.any(String),
        holder: undefined,
        definition_id: '33bdb7eb-20fe-47dd-bed3-3f6c582d44d1',
        descriptor_map: [
          {
            id: 'audit',
            format: 'ldp_vc',
            path: '$.verifiableCredential[0]',
          },
        ],
      },
      verifiableCredential: [selectiveCredential],
    };

    expect(signer.signPresentation).toHaveBeenCalledWith(
      expectedPresentation,
      '1234.5678'
    );

    expect(presentation).toEqual({
      verifiablePresentation: {
        ...expectedPresentation,
        proof: {
          challenge: '1234.5678',
          proofValue: '1234',
          type: 'Ed25519Signature2020',
          verificationMethod: 'did:key:1234',
        },
      },
      presentationSubmissionLocation: 1,
      presentationSubmission: {
        id: expect.any(String),
        definition_id: '33bdb7eb-20fe-47dd-bed3-3f6c582d44d1',
        descriptor_map: [
          { id: 'audit', format: 'ldp_vc', path: '$.verifiableCredential[0]' },
        ],
      },
    });
    expect(presentation.presentationSubmission.id).toEqual(
      (presentation.verifiablePresentation as any).presentation_submission.id
    );
  });
});
