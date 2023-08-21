# guardian-sd-responder

Guardian Selective Disclosure - Presentation Exchange Responder Service

## Configuration

See `config.example.json` for an example configuration file.

### Responder Configuration

| Property                            | Description                                                                                      |
| ----------------------------------- | ------------------------------------------------------------------------------------------------ |
| `did`                               | The did of the responder                                                                         |
| `did_key_id`                        | The key id of the responder, this should typically remain as `did-root-key`                      |
| `did_private_key_hex`               | Hex encoded private key to use for BLS signatures, should match the key id above                 |
| `did_public_key_hex`                | Hex encoded public key to use for BLS signatures, should match the key id above                  |
| `payer_account_id`                  | Hedera account id to use to pay for HCS/HFS transactions                                         |
| `payer_account_private_key`         | Hedera account private key to use to pay for HCS/HFS transactions                                |
| `hedera_encryption_private_key_hex` | Hex-encoded ED25519 private key to use for encryption                                            |
| `topic_ids`                         | Array of hcs topics to listen for requests on                                                    |
| `log_level`                         | Log level - one of error, warn, info, verbose, debug or silly - in increasing order of verbosity |

### Guardian Configuration

The `guardians` property of the config should contain a list of guardian configurations, the properties for which are outlined below.

| Property                           | Description                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------------ |
| `id`                               | The did (or other identifier) of the guardian                                  |
| `master_passphrase`                | Hex-encoded passphrase to use to decrypt credentials from this guardian        |
| `topic_ids`                        | Array of topic ids to listen on for new credentials on                         |
| `trusted_issuers`                  | List of trusted issuer configurations:                                         |
| `trusted_issuers.did`              | The did of the issuer                                                          |
| `trusted_issuers.credential_types` | Array of credential types holders from this issuer can request more details on |

Note, a holder of a credential from a `trusted_issuers.did` issuer can request disclosure of any credential types from the list (even if the credential has multiple other types specified).

## Running

Ensure `.env.example` is copied as `.env` and completed with all properties. Alternatively, ensure that the required properties are provided as environment variables by other means.

It can be run locally with node > 18:

- Install dependencies with `yarn` (`npm i -g yarn` to install yarn if you do not have it installed)
- `yarn start` to start the responder listening on the configured topics

There is also a provided Dockerfile to build and run the responder as a container.

## Response Error Codes

When handling a `presentation-request` message, the responder may return one of several error codes in the `presentation-response`. These are described below.

`FILE_DECRYPTION_FAILED` - The responer was unable to decrypt the request file.
`FILE_PARSE_FAILED` - The request file was decrypted but was not parsed as a valid JSON document.
`UNTRUSTED_ISSUER` - The issuer of the authorization presentation was not configured as a trusted issuer by this responder.
`INVALID_PRESENTATION` - The authorization presentation could not be verified.
`MISSING_CREDENTIAL_ID` - The request `field.filter.const` did not contain a credential id.
`CREDENTIAL_NOT_FOUND` - The requested credential ID was not able to be fetched from IPFS.
`UNKNOWN_ERROR` - Some other unexpected error ocurred.
