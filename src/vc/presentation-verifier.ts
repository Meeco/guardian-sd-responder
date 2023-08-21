import { VerifiablePresentation } from './types.js';

export abstract class PresentationVerifier {
  /**
   * True if the issuer is configured to access any of the credential types provided
   */
  abstract isTrusted(
    guardianId: string,
    issuer: string,
    credentialTypes: string | string[]
  ): Promise<boolean>;

  abstract verify(presentation: VerifiablePresentation): Promise<boolean>;
}
