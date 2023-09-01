# guardian-sd-responder

Guardian Selective Disclosure - Presentation Exchange Responder Service

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
