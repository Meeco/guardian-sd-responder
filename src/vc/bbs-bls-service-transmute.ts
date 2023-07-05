import { PresentationDefinitionV2 } from '@sphereon/pex-models';
import { BbsBlsSignatureProof2020 } from '@transmute/bbs-bls12381-signature-2020';
import { verifiable } from '@transmute/vc.js';
import { Logger } from 'winston';
import {
  BaseBbsBlsService,
  BbsBlsService,
  DocumentLoader,
  VerifiableCredential,
} from './bbs-bls-service.js';

/**
 * Implementation for creating selective disclosure proofs using Transmute Industries packages.
 */
export class TransmuteBbsBlsService
  extends BaseBbsBlsService
  implements BbsBlsService
{
  constructor(
    private readonly documentLoader: DocumentLoader,
    protected readonly logger?: Logger
  ) {
    super(logger);
  }

  async createProof(
    credential: VerifiableCredential,
    presentationDefinition: PresentationDefinitionV2
  ) {
    const frame = this.composeRevealDoc(credential, presentationDefinition);

    this.logger?.verbose('Derive proof');

    const derivedProof = await verifiable.credential.derive({
      credential: credential,
      frame,
      format: ['vc'],
      documentLoader: this.documentLoader,
      suite: new BbsBlsSignatureProof2020(),
    });

    this.logger?.debug('Derived proof:', derivedProof);
    return derivedProof;
  }
}
