import { VerifiablePresentation } from './types.js';

export abstract class PresentationVerifier {
  abstract isTrusted(issuer: string): Promise<boolean>;

  abstract verify(presentation: VerifiablePresentation): Promise<boolean>;
}
