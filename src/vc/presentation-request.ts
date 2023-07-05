import { PresentationDefinitionV2 } from '@sphereon/pex-models';
import { VerifiablePresentation } from './bbs-bls-service.js';

export interface PresentationRequest {
  presentation_definition: PresentationDefinitionV2;
  authorization_details: {
    did: string;
    type: string;
    credential_type: string;
    format: string;
    verifiablePresentation: VerifiablePresentation;
  };
}
