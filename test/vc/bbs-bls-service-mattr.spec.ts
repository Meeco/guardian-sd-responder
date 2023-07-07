import { describe, expect, it } from '@jest/globals';
import { MattrBbsBlsService } from '../../src/vc/bbs-bls-service-mattr.js';
import { PresentationSigner } from '../../src/vc/presentation-signer.js';
import { createSpyObject } from '../fixtures/create-spy-object.js';
import { credential, presentationDefinition } from '../fixtures/data.js';
import { testLoader } from '../fixtures/test-loader.js';

describe('MattrBbsBlsService', () => {
  const signer = createSpyObject<PresentationSigner>();

  it('derives a proof', async () => {
    const service = new MattrBbsBlsService(testLoader, signer);

    const derivedProof = await service.createProof(
      credential,
      presentationDefinition
    );

    expect(derivedProof).toEqual({
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://w3id.org/security/suites/bls12381-2020/v1',
        'https://ipfs.io/ipfs/QmYmAKqchE8J6feEEKwqZeJwSrC6NRQsCHx2dBs8Vs7ECe',
      ],
      id: 'urn:uuid:81348e38-db35-4e5a-bcce-1644422cedd9',
      type: 'VerifiableCredential',
      description: 'iRec Application Details',
      identifier: 'b5a8ec55-505b-4309-a6a1-6cd2ea270d71',
      name: 'iRec Application Details',
      credentialSubject: {
        id: 'did:hedera:testnet:FfcjotQh3MX6D8V97Yzvw3a1GupeV6kBjksviKraL75L_0.0.0',
        type: '8851425a-8dee-4e0f-a044-dba63cf84eb2&1.0.0',
        field3: '255 345 345',
      },
      expirationDate: '2029-12-03T12:19:52Z',
      issuanceDate: '2019-12-03T12:19:52Z',
      issuer:
        'did:hedera:testnet:FfcjotQh3MX6D8V97Yzvw3a1GupeV6kBjksviKraL75L_0.0.0',
      proof: {
        type: 'BbsBlsSignatureProof2020',
        created: '2023-07-07T01:21:39Z',
        nonce: expect.any(String),
        proofPurpose: 'assertionMethod',
        proofValue: expect.any(String),
        verificationMethod:
          'did:hedera:testnet:FfcjotQh3MX6D8V97Yzvw3a1GupeV6kBjksviKraL75L_0.0.0#did-root-key-bbs',
      },
    });
  });
});
