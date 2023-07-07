import { PresentationDefinitionV2 } from '@sphereon/pex-models';
import { VerifiableCredential } from '../../src/vc/types.js';

export const credentialId = 'urn:uuid:81348e38-db35-4e5a-bcce-1644422cedd9';

export const credential: VerifiableCredential = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://w3id.org/security/suites/bls12381-2020/v1',
    'https://ipfs.io/ipfs/QmYmAKqchE8J6feEEKwqZeJwSrC6NRQsCHx2dBs8Vs7ECe',
  ],
  id: credentialId,
  type: ['VerifiableCredential'],
  issuer:
    'did:hedera:testnet:FfcjotQh3MX6D8V97Yzvw3a1GupeV6kBjksviKraL75L_0.0.0',
  identifier: 'b5a8ec55-505b-4309-a6a1-6cd2ea270d71',
  name: 'iRec Application Details',
  description: 'iRec Application Details',
  issuanceDate: '2019-12-03T12:19:52Z',
  expirationDate: '2029-12-03T12:19:52Z',
  credentialSubject: {
    id: 'did:hedera:testnet:FfcjotQh3MX6D8V97Yzvw3a1GupeV6kBjksviKraL75L_0.0.0',
    type: '8851425a-8dee-4e0f-a044-dba63cf84eb2&1.0.0',
    field0: 'Example Company',
    field1: '10000',
    field2: 'H0170966',
    field3: '255 345 345',
    field4: 'AU',
    field5: '2022-10-13',
    field6: 'Pty Ltd',
    field7: 'food retailer',
    field8: 'Charlie Echo Oscar',
    field9: '6',
    field10: '2001',
    field11: 'contact@example.com',
    field12: 'Peter Charlie',
    field13: '0411111111',
    field14: '1 Main Street',
    field15: 'registrant',
    field16: 'http://exmple.com ',
    field17: '9',
    policyId: '627903aa8b28bf6e0ae7bbca',
  },
  proof: {
    type: 'BbsBlsSignature2020',
    created: '2023-07-07T01:21:39Z',
    proofPurpose: 'assertionMethod',
    proofValue:
      'oPHOzlwt31dk6Jlpmu/JhcFy/WDfkqhGmr/QcEzhu7Ipqwus6ADVKgX5KL3T3zq7YUHlKfzccE4m7waZyoLEkBLFiK2g54Q2i+CdtYBgDdkUDsoULSBMcH1MwGHwdjfXpldFNFrHFx/IAvLVniyeMQ==',
    verificationMethod:
      'did:hedera:testnet:FfcjotQh3MX6D8V97Yzvw3a1GupeV6kBjksviKraL75L_0.0.0#did-root-key-bbs',
  },
};

export const selectiveCredential = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://w3id.org/security/suites/bls12381-2020/v1',
    'https://ipfs.io/ipfs/QmYmAKqchE8J6feEEKwqZeJwSrC6NRQsCHx2dBs8Vs7ECe',
  ],
  id: credentialId,
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
    nonce:
      'oeuYH9pfC2xKsIYGscihYQhYHbi2aF5xt+w+kHyVg3FdaJobB89No7V5pwD3bA7Uf3c=',
    proofPurpose: 'assertionMethod',
    proofValue:
      'ACAA/4CAD4JZkc1du7snAchWdlWMuuIyYJZlxaYxFj7PjhQdPBZKX+2Y+Rhno9VHyf+1ybtHtLSorUiTLgFfA2upgYG0pXkriM4IEcq8mkxAPGCN5WQ9JVpa90VR7yY45cvHKe+tiKVVBuo9YwVUE5/Nr5dE0jodGfdN+GbPPs+hdhc57ozdOtqA6I4i6zuZqe1hkLniiAAAAHSxirQ0ahQbdrrSBOYk7dODNqe+CM3f/BcIJ6MZuhxgtHJPg9aOpgpUp3g8tJt/pSsAAAACDGoUVnBKI4fAJJlB4p1brrIqEyvSuVtzmVWeSNz9eqdVgA5M8x7ppUIqCP+BppLez2gRfq2n52pPQ0K81soMy7cfuLYAkWnpjIVUCletG3nG+6SN7P+Y55//1llerslVdaMa+3dwBmARB27bKPmg5AAAABRYAVVk9+iPzPamY0ewLX39M8XR++uzVP88eI7Kaks7qCISp4ouiwCFvWNVSCQ/oaGPk62I0+G+pFArRdGZrY9xGId+iLmwcZLSr8RCt1tEEqX1iKlo1tjzzJgU9uSCFtgFH9uPaIxFGotu3JuarvGSZWrK2ZQJiJPw3ejWkLxrg1VO911kr+ZsfJjvCpGPe0eWa2DOA1mUTFzYkkM7kGFmTDjdVqtAksUI/RFyH4/neZNeOakoixhjcjk0rwUWL0xr/Wp3AOjMFJyvGCsgJJhbKLsgFkqK0sU+2fnZXArNoU6Cyl2snCG7PHIsB/BHaJGhDviKkSjWa+b/CVMW7g3ADNgDxU/YVti6yABR1BKSbGBmb41AGfU+lFx5TMHwL/w7ZyKhrzySuKnNda1T7/CE7Tw/IQY0F2hb7DKr/WK1tzyzcfFIHrNaAzpnM650eTfwNUwYN+VyQm0ZhXgri2NMLqV6mWycgxWBC1OBt/cdtClLWdWtBmxAhZ7JGNdLJcZLXsHTdfxY2ydcRKqh5mVf4/1lb9DJ8Wr+iXZZvFwhyiyNx/4cFNg1BE60PE95TNBEZsSesTxlbiwCQOrxohYeQqUIYc8e9lXe25uCSkI6+Rr7CV+k2Xx0f5dlDhrUhupY03zf6PB1YZ6iuCf/wUIdE0buV0AgCIDtJkw+cMksGh+nZngZXCl9azogxSIhbieAHctdoaIshxWR+w8qMki+P2wl2BCK2NkPVFd2hZ5ZhPwXYJ2UHZ+Bla3Ce4qjesZfuC7vZGpc49TBPcJdGm1PmgGJ1pT7u/SVrbxBBdhFlAeq7SHgSAZG+3YOJT0uvLhw5jrwSxAIbWZW29t4WMnt',
    verificationMethod:
      'did:hedera:testnet:FfcjotQh3MX6D8V97Yzvw3a1GupeV6kBjksviKraL75L_0.0.0#did-root-key-bbs',
  },
};

export const presentationDefinition: PresentationDefinitionV2 = {
  id: '33bdb7eb-20fe-47dd-bed3-3f6c582d44d1',
  input_descriptors: [
    {
      id: 'audit',
      name: 'Audit Report Request',
      purpose: 'Require further information to complete audit report.',
      constraints: {
        fields: [
          {
            path: ['$.id'],
            filter: {
              type: 'string',
              const: credentialId,
            },
          },
          {
            path: ['$.credentialSubject.field3'],
          },
        ],
      },
    },
  ],
};

export const presentation = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://identity.foundation/presentation-exchange/submission/v1',
  ],
  type: ['VerifiablePresentation', 'PresentationSubmission'],
  presentation_submission: {
    id: 'Upa-4PF3w8qXNCM1BPXFA',
    definition_id: '33bdb7eb-20fe-47dd-bed3-3f6c582d44d1',
    descriptor_map: [
      { id: 'audit', format: 'ldp_vc', path: '$.verifiableCredential[0]' },
    ],
  },
  verifiableCredential: [
    {
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
        nonce:
          'oeuYH9pfC2xKsIYGscihYQhYHbi2aF5xt+w+kHyVg3FdaJobB89No7V5pwD3bA7Uf3c=',
        proofPurpose: 'assertionMethod',
        proofValue:
          'ACAA/4CAD4JZkc1du7snAchWdlWMuuIyYJZlxaYxFj7PjhQdPBZKX+2Y+Rhno9VHyf+1ybtHtLSorUiTLgFfA2upgYG0pXkriM4IEcq8mkxAPGCN5WQ9JVpa90VR7yY45cvHKe+tiKVVBuo9YwVUE5/Nr5dE0jodGfdN+GbPPs+hdhc57ozdOtqA6I4i6zuZqe1hkLniiAAAAHSxirQ0ahQbdrrSBOYk7dODNqe+CM3f/BcIJ6MZuhxgtHJPg9aOpgpUp3g8tJt/pSsAAAACDGoUVnBKI4fAJJlB4p1brrIqEyvSuVtzmVWeSNz9eqdVgA5M8x7ppUIqCP+BppLez2gRfq2n52pPQ0K81soMy7cfuLYAkWnpjIVUCletG3nG+6SN7P+Y55//1llerslVdaMa+3dwBmARB27bKPmg5AAAABRYAVVk9+iPzPamY0ewLX39M8XR++uzVP88eI7Kaks7qCISp4ouiwCFvWNVSCQ/oaGPk62I0+G+pFArRdGZrY9xGId+iLmwcZLSr8RCt1tEEqX1iKlo1tjzzJgU9uSCFtgFH9uPaIxFGotu3JuarvGSZWrK2ZQJiJPw3ejWkLxrg1VO911kr+ZsfJjvCpGPe0eWa2DOA1mUTFzYkkM7kGFmTDjdVqtAksUI/RFyH4/neZNeOakoixhjcjk0rwUWL0xr/Wp3AOjMFJyvGCsgJJhbKLsgFkqK0sU+2fnZXArNoU6Cyl2snCG7PHIsB/BHaJGhDviKkSjWa+b/CVMW7g3ADNgDxU/YVti6yABR1BKSbGBmb41AGfU+lFx5TMHwL/w7ZyKhrzySuKnNda1T7/CE7Tw/IQY0F2hb7DKr/WK1tzyzcfFIHrNaAzpnM650eTfwNUwYN+VyQm0ZhXgri2NMLqV6mWycgxWBC1OBt/cdtClLWdWtBmxAhZ7JGNdLJcZLXsHTdfxY2ydcRKqh5mVf4/1lb9DJ8Wr+iXZZvFwhyiyNx/4cFNg1BE60PE95TNBEZsSesTxlbiwCQOrxohYeQqUIYc8e9lXe25uCSkI6+Rr7CV+k2Xx0f5dlDhrUhupY03zf6PB1YZ6iuCf/wUIdE0buV0AgCIDtJkw+cMksGh+nZngZXCl9azogxSIhbieAHctdoaIshxWR+w8qMki+P2wl2BCK2NkPVFd2hZ5ZhPwXYJ2UHZ+Bla3Ce4qjesZfuC7vZGpc49TBPcJdGm1PmgGJ1pT7u/SVrbxBBdhFlAeq7SHgSAZG+3YOJT0uvLhw5jrwSxAIbWZW29t4WMnt',
        verificationMethod:
          'did:hedera:testnet:FfcjotQh3MX6D8V97Yzvw3a1GupeV6kBjksviKraL75L_0.0.0#did-root-key-bbs',
      },
    },
  ],
};
