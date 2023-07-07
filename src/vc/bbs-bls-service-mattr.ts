import {
  BbsBlsSignatureProof2020,
  deriveProof,
} from '@mattrglobal/jsonld-signatures-bbs';
import { PresentationDefinitionV2 } from '@sphereon/pex-models';
import { Logger } from 'winston';
import {
  BaseBbsBlsService,
  BbsBlsService,
  DocumentLoader,
  VerifiableCredential,
} from './bbs-bls-service.js';
import { PresentationSigner } from './presentation-signer.js';

/**
 * Implementation for creating selective disclosure proofs using Mattr packages
 */
export class MattrBbsBlsService
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
    const revealDoc = this.composeRevealDoc(credential, presentationDefinition);

    this.logger?.debug('Composed reveal document:', revealDoc);

    this.logger?.verbose('Derive proof');

    const derivedProof = await deriveProof(credential, revealDoc, {
      suite: new BbsBlsSignatureProof2020(),
      documentLoader: this.documentLoader,
    });

    this.logger?.debug('Derived proof:', derivedProof);
    return derivedProof;
  }
}
