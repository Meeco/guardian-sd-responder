# guardian-sd-responder

Guardian Selective Disclosure - Presentation Exchange Responder Service

See the [Getting Started](./docs/GETTING_STARTED.md) document for a full setup guide.

## Configuration

See `config.example.json` for an example configuration file.

### Responder Configuration

| Property                            | Description                                                                                      |
| ----------------------------------- | ------------------------------------------------------------------------------------------------ |
| `did`                               | The did of the responder                                                                         |
| `hedera_network`                    | One of `testnet` `previewnet` or `maintenet`                                                     |
| `edsa_key_config`                   | DID key configuration for the Ed255192018 or Ed255192020 key for the responder did               |
| `payer_account_id`                  | Hedera account id to use to pay for HCS/HFS transactions                                         |
| `payer_account_public_key`          | Hedera account public key to use to pay for HCS/HFS transactions                                 |
| `payer_account_private_key`         | Hedera account private key to use to pay for HCS/HFS transactions                                |
| `hedera_encryption_private_key_hex` | Hex-encoded ED25519 private key to use for encryption                                            |
| `topic_ids`                         | Array of hcs topics to listen for requests on                                                    |
| `log_level`                         | Log level - one of error, warn, info, verbose, debug or silly - in increasing order of verbosity |

### Guardian Configuration

The `guardians` property of the config should contain a list of guardian configurations, the properties for which are outlined below.

| Property                    | Description                                                             |
| --------------------------- | ----------------------------------------------------------------------- |
| `id`                        | The did (or other identifier) of the guardian                           |
| `passphrase_encryption_key` | Hex-encoded passphrase to use to decrypt credentials from this guardian |
| `topic_ids`                 | Array of topic ids to listen on for new credentials on                  |
| `issued_credentials`        | List of credentials and trust setting for this guardian                 |

For `issued_credentials`:

| Property                             | Description                                                        |
| ------------------------------------ | ------------------------------------------------------------------ |
| `credential_type`                    | The type of credential issued by the guardian                      |
| `accepted_authorization_credentials` | The types of authorization credentials that can request disclosure |

For `accepted_authorization_credentials`:

| Property               | Description                                                                             |
| ---------------------- | --------------------------------------------------------------------------------------- |
| `credential_type`      | Holders of these credential types can request details for the parent `credential_types` |
| `accepted_issuer_dids` | The issued authorization credential must be from one of these issuers to qualify        |

Note that in order to be authorized, only one condition match must be met in order to be authorized. That is, as long as one authorization credential is presented that:

- Requests disclosure for a credential type issued by a guardian where:
- Any of the authorization credentials provided have a type and issuer combination trusted by that guardian (only one type must match)

## Running

Ensure `config.example.json` is copied as `config.json` and completed with all properties.

It can be run locally with node > 18:

- Install dependencies with `yarn` (`npm i -g yarn` to install yarn if you do not have it installed)
- `yarn start` to start the responder listening on the configured topics

There is also a provided Dockerfile to build and run the responder as a container.

## Registering Credentials

Running responders will listen to `guardians.topic_ids` for credential registration messages. Registration messages are expected to have the following format:

```
operation_id: string,             // Should be "register-credential"
guardian_id: string,              // ID of the guardian registering the credential
vc_id: string,                    // ID of the credential being registered
ipfs_cid: string,                 // IPFS CID of the encrypted credential on IPFS
encrypted_passphrase: string,     // Passphrase for the encrypted credential, encrypted with `guardians.passphrase_encryption_key` for the guardian
```

```jsonc
{
  "operation_id": "register-credential",
  "guardian_id": "a3f6af0f-19f4-40e1-80a6-4ca9eebcf892",
  "vc_id": "urn:uuid:6871fc25-0b80-421c-ae1a-457107a6aadf",
  "ipfs_cid": "bafybeifkz53amsv53iyojtjhi5rayym6jtavxipsmimpbrtexs53kofvqy/credential.json",
  "encrypted_pasphrase": "Aes256Gcm.2KrGWIP9TJmHqfnglKdYn8FJu7ZuFHk-ZZPeA--wjwoOowIJBNAaG6mco45YlzAshzXPxOb86_3d0CnnnsgaqqqQrwFDnJiihCb_a3yHmu-afMwoFhru2-QWHrBHGLQI.QUAAAAAFaXYADAAAAACr5b68bp29WIxyfTcFYXQAEAAAAAD-rpHiK0hZEKFHqGnzucIvAmFkAAUAAABub25lAAA=.Pbkdf2Hmac.S0EAAAAFaXYAFAAAAAARqZHS23aNrOZ8lPaQ6nxBMdC1UBBpAB1QAAAQbAAgAAAAAmhhc2gABwAAAFNIQTI1NgAA"
}
```

Example of encrypting a credential and the passphrase for the credential:

```ts
import {
  CipherStrategy,
  encryptWithKeyDerivedFromString,
  utf8ToBytes,
} from '@meeco/cryppo';
import { randomBytes } from 'crypto';

const passphrase = randomBytes(48).toString('hex');

// Encrypt the credential
const encryptedDocument = await encryptWithKeyDerivedFromString({
  passphrase: passphrase,
  data: utf8ToBytes(JSON.stringify(signedDocument)),
  strategy: CipherStrategy.AES_GCM,
  serializationVersion: 'latest_version' as any,
});

// Encrypt the passphrase for  the credential
const encryptedPassphrase = await encryptWithKeyDerivedFromString({
  data: Buffer.from(passphrase, 'utf-8'),
  strategy: CipherStrategy.AES_GCM,
  passphrase: passphraseEncryptionPassphrase,
});
```

## Example Query/Response/Request/Response Flow

### Presentation Query

```jsonc
{
  "operation": "presentation-query",
  // This allows tying the query response to the query
  "request_id": "0a40262e-e100-47b3-a69a-3824e867e0a7",
  // ID of the credential being requested
  "vc_id": "urn:uuid:a67a8607-0e2a-4818-8a75-f64743ea8dc2",
  // DID of the requester
  "requester_did": "did:hedera:testnet:z6MkmELdkLPDgwzwXSm166M2ut4i2M9GHALUiYvZBz15YzWG_0.0.1136547",
  "limit_hbar": 1
}
```

### Query Response

```jsonc
{
  "operation": "query-response",
  // Responding to the original query ID
  "request_id": "0a40262e-e100-47b3-a69a-3824e867e0a7",
  // There may be multiple query responses on the topic, each with a different responder DID. This is also used for encryption.
  "responder_did": "did:hedera:testnet:z6Mkt3X4e2hBgobfouBuy2DmpG4zEdSeFCjwCkK19e2iRjYs_0.0.893331",
  "offer_hbar": 0
}
```

### Presentation Request

```jsonc
{
  "operation": "presentation-request",
  // Targeting a specific responder from the `query-response` messages seen
  "recipient_did": "did:hedera:testnet:z6Mkt3X4e2hBgobfouBuy2DmpG4zEdSeFCjwCkK19e2iRjYs_0.0.893331",
  // Allows tying the presentation response to the request
  "request_id": "8a6a42ea-4b47-43bf-9431-f28c33ece38a",
  // HFS file id of the request JSON, encrypted with the responder_did from the query response
  "request_file_id": "0.0.1144002"
}
```

### Presentation Response

```jsonc
{
  "operation": "presentation-response",
  // The Responding to the original request ID
  "request_id": "8a6a42ea-4b47-43bf-9431-f28c33ece38a",
  // Intended recipient
  "recipient_did": "did:hedera:testnet:z6MkmELdkLPDgwzwXSm166M2ut4i2M9GHALUiYvZBz15YzWG_0.0.1136547",
  // HFS file ID of the response JSON, encrypted with the DID in the request file authorization JSON
  "response_file_id": "0.0.1144004"
}
```

## Response Error Codes

When handling a `presentation-request` message, the responder may return one of several error codes in the `presentation-response`.

These are described below.

- `AUTHORIZATION_MISMATCH` - The request `authorization_details.did` did not match the `holder` of the presentation file submitted
- `CREDENTIAL_NOT_FOUND` - The requested credential ID was not able to be fetched from IPFS.
- `FILE_DECRYPTION_FAILED` - The responer was unable to decrypt the request file.
- `FILE_PARSE_FAILED` - The request file was decrypted but was not parsed as a valid JSON document.
- `INVALID_PRESENTATION` - The authorization presentation could not be verified.
- `MISSING_CREDENTIAL_ID` - The request `field.filter.const` did not contain a credential id.
- `UNAUTHORIZED_REQUEST` - The issuer and type of the authorization presentation was not configured as a trusted by the guardian of the requested credential type.
- `UNKNOWN_ERROR` - Some other unexpected error ocurred.
