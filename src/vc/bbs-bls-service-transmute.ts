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
import { PresentationSigner } from './presentation-signer.js';

/**
 * Implementation for creating selective disclosure proofs using Transmute Industries packages.
 */
export class TransmuteBbsBlsService
  extends BaseBbsBlsService
  implements BbsBlsService
{
  constructor(
    protected readonly documentLoader: DocumentLoader,
    protected readonly presentationSigner: PresentationSigner,
    protected readonly logger?: Logger
  ) {
    super(documentLoader, presentationSigner, logger);
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
    // Transmute library returns an array of items instead of just hte proof
    return derivedProof.items[0];
  }
}
