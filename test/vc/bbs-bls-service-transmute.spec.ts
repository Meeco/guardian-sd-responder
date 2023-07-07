import { describe, expect, it } from '@jest/globals';
import { credential, presentationDefinition } from '../fixtures/data.js';
// import { PresentationSigner } from '../../src/vc/presentation-signer.js';
// import { createSpyObject } from '../fixtures/create-spy-object.js';
// import { TransmuteBbsBlsService } from '../../src/vc/bbs-bls-service-transmute.js';
// import { testLoader } from '../fixtures/test-loader.js';

describe('TransmuteBbsBlsService', () => {
  // const signer = createSpyObject<PresentationSigner>();

  // This test fails to run in jest with ESM.
  // Since the Mattr service is being used for now anyway it is being skipped.
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('derives a proof', async () => {
    // const service = new TransmuteBbsBlsService(testLoader, signer);
    const service = {} as any;

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
        id: 'did:hedera:testnet:DaQwTPYzrnSVBYgwNmtS4bSKQBqy4jy1XLtsQcmpVUUJ_0.0.15019570',
        type: '8851425a-8dee-4e0f-a044-dba63cf84eb2&1.0.0',
        field3: '255 345 345',
      },
      expirationDate: '2029-12-03T12:19:52Z',
      issuanceDate: '2019-12-03T12:19:52Z',
      issuer:
        'did:hedera:testnet:DaQwTPYzrnSVBYgwNmtS4bSKQBqy4jy1XLtsQcmpVUUJ_0.0.15019570',
      proof: {
        type: 'BbsBlsSignatureProof2020',
        created: '2023-07-05T04:29:09Z',
        nonce: expect.any(String),
        proofPurpose: 'assertionMethod',
        proofValue: expect.any(String),
        verificationMethod:
          'did:hedera:testnet:5zoGqou2oPg9Rz2opbf8moyNwNeKeP7bYntNCdmjuJ9z_0.0.0#did-root-key-bbs',
      },
    });
  });
});
