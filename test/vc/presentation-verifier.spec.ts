import { describe, expect, it } from '@jest/globals';
import { Logger } from 'winston';
import { GuardianConfig } from '../../src/util/config.js';
import { PresentationVerifier } from '../../src/vc/presentation-verifier.js';
import {
  VerifiableCredential,
  VerifiablePresentation,
} from '../../src/vc/types.js';
import { authorizationDetails, credential } from '../fixtures/data.js';

class ExampleVerifier extends PresentationVerifier {
  constructor(
    protected readonly guardians: GuardianConfig[],
    protected readonly logger?: Logger
  ) {
    super(guardians, logger);
  }

  async verify(_: VerifiablePresentation): Promise<boolean> {
    return true;
  }
}

describe('PresentationVerifier', () => {
  const auth = {
    ...authorizationDetails.verifiablePresentation,
  };

  const requestedCredential = {
    ...credential,
  };

  const testGuardian: GuardianConfig = {
    id: 'a',
    issued_credentials: [
      {
        credential_type: 'VerifiableCredential',
        accepted_authorization_credentials: [
          {
            credential_type: 'VerifiableCredential',
            accepted_issuer_dids: [
              'did:key:z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL',
            ],
          },
        ],
      },
    ],
    passphrase_encryption_key: '',
    topic_ids: [],
  };

  it('trusts authorization request', () => {
    const verifier = new ExampleVerifier([testGuardian]);

    expect(verifier.isTrusted('a', auth, requestedCredential)).toEqual(true);
  });

  it('trusts as long as any authorization credential is applicable', () => {
    const verifier = new ExampleVerifier([testGuardian]);

    expect(
      verifier.isTrusted(
        'a',
        {
          ...auth,
          verifiableCredential: [
            {
              ...(auth.verifiableCredential[0] as VerifiableCredential),
              issuer: 'DO_NOT_TRUST',
            },
            {
              ...(auth.verifiableCredential[0] as VerifiableCredential),
            },
          ],
        },
        requestedCredential
      )
    ).toEqual(true);
  });

  it('supports both credential types (single and array)', () => {
    const verifier = new ExampleVerifier([testGuardian]);

    expect(
      verifier.isTrusted(
        'a',
        {
          ...auth,
          verifiableCredential: [
            {
              ...auth.verifiableCredential[0],
            },
          ],
        },
        requestedCredential
      )
    ).toEqual(true);

    expect(
      verifier.isTrusted(
        'a',
        {
          ...auth,
          verifiableCredential: {
            ...auth.verifiableCredential[0],
            issuer: {
              id: 'did:key:z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL',
            },
          },
        },
        requestedCredential
      )
    ).toEqual(true);
  });

  it('supports both issuer types', () => {
    const verifier = new ExampleVerifier([testGuardian]);

    expect(
      verifier.isTrusted(
        'a',
        {
          ...auth,
          verifiableCredential: {
            ...auth.verifiableCredential[0],
            issuer: 'did:key:z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL',
          },
        },
        requestedCredential
      )
    ).toEqual(true);

    expect(
      verifier.isTrusted(
        'a',
        {
          ...auth,
          verifiableCredential: {
            ...auth.verifiableCredential[0],
            issuer: {
              id: 'did:key:z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL',
            },
          },
        },
        requestedCredential
      )
    ).toEqual(true);
  });

  it('is not trusted if the guardian is not found', () => {
    const verifier = new ExampleVerifier([testGuardian]);

    expect(verifier.isTrusted('c', auth, requestedCredential)).toEqual(false);
  });

  it('is not trusted if the requested credential type is not accepted by the authorization credential', () => {
    const verifier = new ExampleVerifier([testGuardian]);

    expect(verifier.isTrusted('a', auth, requestedCredential)).toEqual(true);
    expect(
      verifier.isTrusted('a', auth, {
        ...requestedCredential,
        type: ['AlumniCredential'],
      })
    ).toEqual(false);
  });

  it('is not trusted if the authorization credential is not a trusted type', () => {
    const verifier = new ExampleVerifier([testGuardian]);

    expect(verifier.isTrusted('a', auth, requestedCredential)).toEqual(true);
    expect(
      verifier.isTrusted(
        'a',
        {
          ...auth,
          verifiableCredential: {
            ...auth.verifiableCredential[0],
            type: ['AlumniCredential'],
          },
        },
        requestedCredential
      )
    ).toEqual(false);
  });

  it('is not trusted if the authorization credential is not from a trusted issuer', () => {
    const verifier = new ExampleVerifier([testGuardian]);

    expect(verifier.isTrusted('a', auth, requestedCredential)).toEqual(true);
    expect(
      verifier.isTrusted(
        'a',
        {
          ...auth,
          verifiableCredential: {
            ...auth.verifiableCredential[0],
            issuer: 'did:key:not-trusted',
          },
        },
        requestedCredential
      )
    ).toEqual(false);
  });
});
