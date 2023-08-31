import { Logger } from 'winston';
import { GuardianConfig } from '../util/config.js';
import {
  Issuer,
  VerifiableCredential,
  VerifiablePresentation,
} from './types.js';

export abstract class PresentationVerifier {
  constructor(
    protected guardians: GuardianConfig[],
    protected logger?: Logger
  ) {}

  isTrusted(
    guardianId: string,
    presentation: VerifiablePresentation,
    requestedCredential: VerifiableCredential
  ) {
    const coerceArray = <T>(x: T | T[]): T[] => (Array.isArray(x) ? x : [x]);
    const coerceIssuerId = (issuer: Issuer): string =>
      (issuer as any)?.id ?? issuer;

    const applicableGuardians = this.guardians.filter(
      (item) => item.id === guardianId
    );

    if (applicableGuardians.length === 0) {
      this.logger?.verbose('Guardian not found - untrusted request');
      return false;
    }

    const authorizationConfigurations = applicableGuardians
      .flatMap((guardian) =>
        guardian.issued_credentials.filter((item) =>
          coerceArray(requestedCredential.type).includes(item.credential_type)
        )
      )
      .flatMap((item) => item.accepted_authorization_credentials);

    const credentials = coerceArray(presentation.verifiableCredential).filter(
      (credential): credential is VerifiableCredential => !!credential
    );

    for (const credential of credentials) {
      const authorizationType = coerceArray(credential.type);
      const issuer = coerceIssuerId(credential.issuer);
      for (const configuration of authorizationConfigurations) {
        if (!configuration.accepted_issuer_dids.includes(issuer)) continue;
        if (!authorizationType.includes(configuration.credential_type))
          continue;

        this.logger?.verbose(
          `Authorized by "${issuer}" for "${
            configuration.credential_type
          }" by one of: ${authorizationType.join(',')}`
        );
        return true;
      }
    }

    this.logger?.verbose('No matching trusted issuer for requested type');
    return false;
  }

  abstract verify(presentation: VerifiablePresentation): Promise<boolean>;
}
