# guardian-sd-responder

Guardian Selective Disclosure - Presentation Exchange Responder Service

## Running

Ensure `.env.example` is copied as `.env` and completed with all properties. 

Alternatively, ensure that the required properties are provided as environment variables by other means.

It can be run locally with node > 18:

- Install dependencies with `yarn` (`npm i -g yarn` to install yarn if you do not have it installed)
- `yarn start` to start the responder listening on the configured topics

There is also a provided Dockerfile to build and run the responder as a container.

## Response Error Codes

When handling a `presentation-request` message, the responder may return one of several error codes in the `presentation-response`. 

These are described below.

- `FILE_DECRYPTION_FAILED` - The responer was unable to decrypt the request file.
- `FILE_PARSE_FAILED` - The request file was decrypted but was not parsed as a valid JSON document.
- `UNTRUSTED_ISSUER` - The issuer of the authorization presentation was not configured as a trusted issuer by this responder.
- `INVALID_PRESENTATION` - The authorization presentation could not be verified.
- `MISSING_CREDENTIAL_ID` - The request `field.filter.const` did not contain a credential id.
- `CREDENTIAL_NOT_FOUND` - The requested credential ID was not able to be fetched from IPFS.
- `UNKNOWN_ERROR` - Some other unexpected error ocurred.
