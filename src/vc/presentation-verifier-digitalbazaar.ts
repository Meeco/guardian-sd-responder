import { Ed25519Signature2018 } from '@digitalbazaar/ed25519-signature-2018';
import { Ed25519Signature2020 } from '@digitalbazaar/ed25519-signature-2020';

import { Ed25519VerificationKey2018 } from '@digitalbazaar/ed25519-verification-key-2018';
import { Ed25519VerificationKey2020 } from '@digitalbazaar/ed25519-verification-key-2020';

import * as vc from '@digitalbazaar/vc';
import { Logger } from 'winston';
import { PresentationVerifier } from './presentation-verifier.js';
import {
  DocumentLoader,
  VerifiableCredential,
  VerifiablePresentation,
} from './types.js';

export class PresentationVerifierDigitalBazaar implements PresentationVerifier {
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
    if (!presentation) return false;

    // Note, `result.verified` on the presentation verification will likely be
    // false as the credential will probably be issued by someone different than
    // the presentation.
    // Hence why the credentials are verified separately.
    // This is caused by the DigitalBazaar library requiring a publicKey to use
    // for verification and only allowing a single public key.
    // If we can verify the presentation on its own and all the internal
    // credentials individually then the whole thing is is considered verified.

    const presentationVerified = await this.verifyPresentation(presentation);
    const credentialsVerified = await this.verifyCredentials(presentation);
    return presentationVerified && credentialsVerified;
  }

  async verifyCredentials(presentation: VerifiablePresentation) {
    const credentials = Array.isArray(presentation.verifiableCredential)
      ? presentation.verifiableCredential ?? []
      : [presentation.verifiableCredential];
    for (const credential of credentials) {
      if (!credential) return false;
      const verificationMethod =
        credential.proof?.verificationMethod?.id ??
        credential.proof?.verificationMethod;
      const key = await this.resolveKey(verificationMethod);

      if (!key) return false;

      const suiteType = this.getSuite(credential);
      const suite = new suiteType({
        key,
      });

      this.logger?.debug(`Verify credential`);
      this.logger?.silly(JSON.stringify(credential));
      const resultVc = await vc.verifyCredential({
        credential,
        suite,
        documentLoader: this.documentLoader,
      });

      this.logger?.debug(`Verification results`);
      this.logger?.verbose(JSON.stringify(resultVc));
      if (!resultVc.verified) {
        return false;
      }
    }

    return true;
  }

  async verifyPresentation(presentation: VerifiablePresentation) {
    /**
     * DigitalBazaar requires at least the public key be present when
     * constructing the signature suite in order to verify.
     */
    const verificationMethod =
      presentation.proof?.verificationMethod?.id ??
      presentation.proof?.verificationMethod;

    const key = await this.resolveKey(verificationMethod);

    if (!key) return false;

    const suiteType = this.getSuite(presentation);

    const suite = new suiteType({
      key,
    });

    this.logger?.debug(`Verify presentation`);
    this.logger?.silly(JSON.stringify(presentation));

    const resultVp = await vc.verify({
      presentation,
      challenge: presentation.proof?.challenge,
      suite,
      documentLoader: this.documentLoader,
    });

    this.logger?.debug(`Verification results`);
    this.logger?.verbose(JSON.stringify(resultVp));

    return resultVp.presentationResult.verified;
  }

  private async resolveKey(didKeyId: string) {
    const didDoc = await this.documentLoader(didKeyId).then(
      (result) => result.document
    );
    const verificationKey = didDoc?.verificationMethod?.find(
      (method: any) => method.id == didKeyId
    );

    if (!verificationKey?.type) {
      this.logger?.error('Could not resolve key data');
      this.logger?.verbose(didDoc);
      return false;
    }

    /**
     * Universal resolver can return `Ed25519VerificationKey2018` type with only
     * a `publicKeyJwk` which the DigitalBazaar 2018 key constructor doesn't handle.
     */
    if (
      verificationKey?.type == 'Ed25519VerificationKey2018' &&
      verificationKey.publicKeyJwk
    ) {
      verificationKey.type = 'JsonWebKey2020';
    }

    // This could technically just be `Ed25519VerificationKey2020.from` since
    // that supports going directly from `Ed25519VerificationKey2018`
    const key =
      verificationKey?.type == 'Ed25519VerificationKey2018'
        ? await Ed25519VerificationKey2018.from(didDoc.verificationMethod[0])
        : await Ed25519VerificationKey2020.from(didDoc.verificationMethod[0]);

    return key;
  }

  private getSuite(item: VerifiablePresentation | VerifiableCredential) {
    let suiteType;
    switch (item.proof?.type ?? item.proof?.suite) {
      case 'Ed25519Signature2018':
        suiteType = Ed25519Signature2018;
        break;
      case 'Ed25519Signature2020':
        suiteType = Ed25519Signature2020;
        break;
      default:
        throw new Error(`Unsupported proof suite "${item.proof?.suite}"`);
    }
    return suiteType;
  }
}
