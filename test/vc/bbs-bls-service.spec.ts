import { describe, expect, it } from '@jest/globals';
import { BaseBbsBlsService } from '../../src/vc/bbs-bls-service.js';
import {
  presentationDefinition,
  selectiveCredential,
} from '../fixtures/data.js';

describe('BaseBbsBlsService', () => {
  it('turns a derived proof into a presentation', async () => {
    const service = new BaseBbsBlsService();
    const presentation = await service.preparePresentation(
      presentationDefinition,
      selectiveCredential
    );

    expect(presentation).toEqual({
      presentation: {
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          'https://identity.foundation/presentation-exchange/submission/v1',
        ],
        type: ['VerifiablePresentation', 'PresentationSubmission'],
        presentation_submission: {
          id: expect.any(String),
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

    expect(presentation.presentation.presentation_submission!.id).toEqual(
      presentation.presentationSubmission.id
    );
  });
});
