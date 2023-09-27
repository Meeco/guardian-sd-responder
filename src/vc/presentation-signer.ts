import { Ed25519Signature2020 } from '@digitalbazaar/ed25519-signature-2020';
import { signPresentation } from '@digitalbazaar/vc';
import { Logger } from 'winston';
import { buildEd25519VerificationKey2020 } from '../util/key-data.js';
import { DocumentLoader } from './types.js';

export class PresentationSigner {
  constructor(
    private readonly documentLoader: DocumentLoader,
    private readonly keyConfiguration:
      | Ed25519VerificationKey2018Key
      | Ed25519VerificationKey2020Key,
    private readonly logger?: Logger
  ) {}

  async signPresentation(presentation: any, challenge: string) {
    this.logger?.debug('Signing presentation');
    this.logger?.silly(JSON.stringify(presentation));
    const key = await buildEd25519VerificationKey2020(this.keyConfiguration);

    const suite = new Ed25519Signature2020({ key });

    const vp = await signPresentation({
      presentation,
      suite,
      challenge,
      documentLoader: this.documentLoader,
    });

    this.logger?.silly('Signed presentation');
    this.logger?.silly(JSON.stringify(vp));

    return vp;
  }
}

export interface Ed25519VerificationKey2018Key {
  id: string;
  type: 'Ed25519VerificationKey2018';
  controller: string;
  publicKeyBase58: string;
  privateKeyBase58: string;
}

export interface Ed25519VerificationKey2020Key {
  id: string;
  type: 'Ed25519VerificationKey2020';
  controller: string;
  publicKeyMultibase: string;
  privateKeyMultibase: string;
}
