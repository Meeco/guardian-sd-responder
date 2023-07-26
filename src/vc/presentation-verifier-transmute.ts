import { Ed25519Signature2018 } from '@transmute/ed25519-signature-2018';
import { Ed25519Signature2020 } from '@transmute/ed25519-signature-2020';
import { verifiable } from '@transmute/vc.js';
import { Logger } from 'winston';
import { PresentationVerifier } from './presentation-verifier.js';
import { DocumentLoader, VerifiablePresentation } from './types.js';

export class PresentationVerifierTransmute implements PresentationVerifier {
  constructor(
    private readonly documentLoader: DocumentLoader,
    private readonly logger?: Logger
  ) {}

  async isTrusted(issuer: string) {
    return (
      issuer === 'did:key:z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL'
    );
  }

  async verify(presentation: VerifiablePresentation) {
    let suiteType;
    switch (presentation.proof?.type ?? presentation.proof?.suite) {
      case 'Ed25519Signature2018':
        suiteType = Ed25519Signature2018;
        break;
      case 'Ed25519Signature2020':
        suiteType = Ed25519Signature2020;
        break;
      default:
        throw new Error(
          `Unsupported proof suite "${presentation.proof?.suite}"`
        );
    }

    const suite = new suiteType({});

    this.logger?.debug(`Verify presentation`);
    this.logger?.silly(JSON.stringify(presentation));

    const resultVp = await verifiable.presentation.verify({
      presentation,
      challenge: presentation.proof?.challenge,
      suite,
      documentLoader: this.documentLoader,
    });

    this.logger?.debug(`Verification results`);
    this.logger?.verbose(JSON.stringify(resultVp));

    return resultVp.verified;
  }
}
