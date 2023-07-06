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
    'did:hedera:testnet:DaQwTPYzrnSVBYgwNmtS4bSKQBqy4jy1XLtsQcmpVUUJ_0.0.15019570',
  identifier: 'b5a8ec55-505b-4309-a6a1-6cd2ea270d71',
  name: 'iRec Application Details',
  description: 'iRec Application Details',
  issuanceDate: '2019-12-03T12:19:52Z',
  expirationDate: '2029-12-03T12:19:52Z',
  credentialSubject: {
    id: 'did:hedera:testnet:DaQwTPYzrnSVBYgwNmtS4bSKQBqy4jy1XLtsQcmpVUUJ_0.0.15019570',
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
    created: '2023-07-05T04:29:09Z',
    proofPurpose: 'assertionMethod',
    proofValue:
      'jM5/dUktstEpxQl/23pqm9a2OUF9nxjCPbDrgo+02C9N1IMYSHItOg+51LHt6DGxYUHlKfzccE4m7waZyoLEkBLFiK2g54Q2i+CdtYBgDdkUDsoULSBMcH1MwGHwdjfXpldFNFrHFx/IAvLVniyeMQ==',
    verificationMethod:
      'did:hedera:testnet:5zoGqou2oPg9Rz2opbf8moyNwNeKeP7bYntNCdmjuJ9z_0.0.0#did-root-key-bbs',
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
    nonce:
      'XXBD0eP0qesc8V4RJCKsm0Oh/NSuLDXkXIbhgB6bXrK8hn90EmvOP2pL5T2lVJ8XBjI=',
    proofPurpose: 'assertionMethod',
    proofValue:
      'ACAA/4CAD4qx0UClIsVkUosOouR9YQUBuGb3arZhxet3Opv8x1UJzvpYRGw40DfEIwAJA+sJC7MiyfgxRIYqVo8+5ZDH0glUfw/MOMo2oNfaGkKyhq6oBJaanCmcfg9XDTdiYx6u87n6FROEqqegqBp+cban0HdaWKn8hgyc7rvb9hfmbxa83I7H1VxqHo/86TEFs9dleQAAAHSgQ+qAXYmng6RG+q8qd5ZuxLh5rzlAO/7a+mm3MoRTV0/PS4jMG1EFfRMIFq1UNUAAAAACO2P4DYjVCY4UsiBKLWhvDnrqm01OhpcCRMLDFQmZbuRC6aZlj3+Q30lOKSuRcyfJG4HCCFQh2UvF5SwLmL0186tJH9WTw4UgFDjJA54i5EObuvr1fI4WLzMlfBOG2CGEQhWkKNSJLNhZrg6YxI/SvwAAABRKcLNWTZANXHWr+52c4pxGIyQWtXgDQZUKHnXV9mEkziVBymVxhLgOsvcckb86qbnUdTnlx4GJzyvoCc59XoziQWTPEP8opubFmxQjEgSX8uJngKg0aeW4xjUxTRQ0YEgFnzbkThREaq6yIEc2pJci7bKvB4pcrUksRDljNZC6YFKSlgPCkuIcaZm47F+s42Tn62yZAqykfyn8XzSNn89DR+wY5/tf860wsBgznbXwQEkysjPEd/b9KlpokDOggL4BbPN6OvM6kymnibj+jzibDhesEux+CESAIUD60gqWUmRq31INaAjApm65lZceOHlg7SMkKO+hsaqhrSeYFF9EPcXHRNrrVvwEDV+FfkBw/6lGpccHKsAod8WjmrK6WvpMqRvbybvt11rmSSHxdQfnmiBYH2Y692KKF+bCuyq+pRfnEKJswAFkyQduwvTwgspDM9DcPykPoHAI8+j6evBNLOM3hrxQjPjApGNzM198xPdkUzv7JlKbahiHlfJzv2NBASltcQukZR6dEIP8vea1X9HUGyqBBbhcTDiNAbDPglUMGWmjFy18fd94epwJfjPZhzUcFVsEJ1X/HpoewWgkGPmQXhmSsHI3B7XCLnTYENLY7IPY48bFnqNs7Jmd9OBa6whJfsoQMxsNgIgaUPCcDLVmfS0X/HlXExD/3i+S41SS3M+SLOTskuIsYQUi683MnbR0XyxzVY6gcIsNYyZ1ZxlCQJxVTQw0RpsAT/+jq+vd27DyqOFKFL+3i+1tdY4WGHvF0WiqRVAjfoSIh3ldwGI5zFHNZoGkG1Xv9KFeoWiqyAd6LgtmTPUn8fwf/uwiQChhVi5ldEVmeQ+QTHux',
    verificationMethod:
      'did:hedera:testnet:5zoGqou2oPg9Rz2opbf8moyNwNeKeP7bYntNCdmjuJ9z_0.0.0#did-root-key-bbs',
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
        created: '2023-07-04T04:39:40Z',
        nonce:
          'E4hDOoA9ZFOjdbxutHA4dd/i3MLEEmwdtLmY3T8INDUZ3W38nA1imGvq2xOGsctqB9U=',
        proofPurpose: 'assertionMethod',
        proofValue:
          'ACAA/4CAD4D7QSeHWPqqKQpAM8i+L9XtB/ATu8V6x6xwAw/XfUW6HayYQtLkmoS4epmZBmAEKYFFiUCAXWLeiWbYgucMPAy2e33bK4Fr0eXq+Y1utp1LGImziPyddgp6QAU0gTMCraOZ74oeB6qF0CB00ZUHritqe3wt41v44Mwwq0GIkVZd9JRDQjryoHaELjDzibBLcQAAAHSNWHWRsJD4bHIdLEtnUw6/2c9lUHRfSNyTx0CQraBF5f0vQpRuWbZezndwJDhqOpYAAAACbOVKAYrzHhMrwuPt1LBh9VmU/a8ln6ZBVCnY28+OO6QYkvgTtxYHzW4Ph1yQMM9j/T+SDUVDFhyLd9gWdvoW4aEMVwyOqbSOxhoUKdcFciU5TmxWNJ6mguQgLs9rkd64JaHqW15pSgve7lPNms18lQAAABRhwv83idVGlBcyS7IEKvXKWDVJYlCP0iXGOAxk35t/KBwrmBH1Pp7Zj/Zsn0FzhK2JigUSc6w8jGmIB1DrvKR7KNP+qJsw9TM2Q8diDtURsGlCNTvEe+YAdHx9Zzi2k9o4E8tVJfwgUu7RX/FJojDkmgbC73ZRsMdlwH9diw9XawyvlPa75jG00rU9g8ct/U7YGLKuiY/C/2+F28ZMJNbzLia/W7vmScheoHvXa3irpNXjkNuMTA4C0JEHoIsUnZ4v1poT8O2uT7kj1DmglDTpG44DUuVdjNFeekSFC6l/KjIDAw2oRYNSentRH2jhTXFSaf+841QXl0OkhuEA7/euVBwo59OXcME8TXtZHVSWCL8JaKnqteKnyHlG+EMDQqFuZL9nw++dm/yeOhPuMq6lgxvqteW4L9HyxNGvbAsK8T0maYDBEiqEXlvV/e8eGZ11R1vluMKzCedT+3xXCcLMINKri2f0z0brO8k+2Oz1StoHVvXAo8WTOvRDKb/OmAgWyD6q+MkEmKZwliWzloKvAmYotBF/Qmn7tv3BkQTW/A6mHmuAtHfPK4wxcInaFSLSUmwL7ReZoFgy5E9MSGo2RNggKZka3hRk/kTjiy96q6Y2slN9Eq+dlyujlfVmorA1mCO5r+wjhYKxiGsE7vjrimGeJonJXjuZBrZat2c47mk4g13mngwi+H5JJv3au04hfPeAAvG2inApGpnvp63DVyIz1phOPiS4KV/HGgi6HDK0xDdpFOdxWGSmQrvFS4NYG9bvUPfEKPjNHTlb6230saWuRBZe9OfZ5gFWhW7fSQ17CA4qoHd6sKwz4CRqJFToh2fJawRsUuChAq+xwfyN',
        verificationMethod:
          'did:hedera:testnet:DaQwTPYzrnSVBYgwNmtS4bSKQBqy4jy1XLtsQcmpVUUJ_0.0.15019570#did-root-key-bbs',
      },
    },
  ],
};
