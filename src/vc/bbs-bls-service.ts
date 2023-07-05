import { PEXv2 } from '@sphereon/pex';
import { PresentationDefinitionV2 } from '@sphereon/pex-models';
import { IProofType } from '@sphereon/ssi-types';
import { VerifiableCredential } from '@transmute/vc.js/dist/types/VerifiableCredential.js';
import jsonpath from 'jsonpath';
import { Logger } from 'winston';

// Re-export some types that are likely to change source
export * from './types.js';

export class BaseBbsBlsService {
  constructor(protected readonly logger?: Logger) {}

  composeRevealDoc(
    credential: VerifiableCredential,
    presentationDefinition: PresentationDefinitionV2
  ) {
    // The base reveal document (without any fields requested)
    const frame = {
      '@context': credential['@context'],
      type: credential.type,
      credentialSubject: {
        '@explicit': true,
        type: Array.isArray(credential['credentialSubject'])
          ? credential['credentialSubject'].map(
              (subject: any) => subject['type']
            )
          : credential['credentialSubject']['type'],
      },
    };

    const descriptors = presentationDefinition?.input_descriptors ?? [];

    // Apply the fields in the request to the json-ld frame used as the reveal document.
    descriptors.forEach((descriptor: any) => {
      descriptor?.constraints?.fields?.forEach((field: any) => {
        field?.path?.forEach((path: string) => {
          if (path.startsWith('$.credentialSubject')) {
            jsonpath.value(frame, path, {});
          }
        });
      });
    });

    this.logger?.debug('Composed reveal document:', frame);
    return frame;
  }

  async preparePresentation(
    presentationDefinition: PresentationDefinitionV2,
    derivedProof: any
  ) {
    const pex = new PEXv2();

    // Must be called before running presentationFrom()
    const evaluationResults = pex.evaluateCredentials(
      presentationDefinition,
      derivedProof,
      {
        // holderDIDs: [deriveProof],
        limitDisclosureSignatureSuites: [IProofType.BbsBlsSignatureProof2020],
      }
    );
    this.logger?.silly('Evaluation result', JSON.stringify(evaluationResults));

    // Note, currently unsigned
    const presentationResult = await pex.presentationFrom(
      presentationDefinition,
      derivedProof
    );
    this.logger?.silly(
      'Presentation result',
      JSON.stringify(presentationResult)
    );

    return presentationResult;
  }
}

export abstract class BbsBlsService extends BaseBbsBlsService {
  abstract createProof(
    credential: VerifiableCredential,
    presentationDefinition: PresentationDefinitionV2
  ): Promise<any>;
}
