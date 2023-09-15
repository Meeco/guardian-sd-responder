import { Ed25519VerificationKey2018 } from '@digitalbazaar/ed25519-verification-key-2018';
import { Ed25519VerificationKey2020 } from '@digitalbazaar/ed25519-verification-key-2020';

const coerceKeyData = (keyData: any) => {
  /**
   * Universal resolver can return `Ed25519VerificationKey2018` type with only
   * a `publicKeyJwk` which the DigitalBazaar 2018 key constructor doesn't handle.
   */
  if (keyData?.type == 'Ed25519VerificationKey2018' && keyData.publicKeyJwk) {
    keyData.type = 'JsonWebKey2020';
  }
  return keyData;
};

/**
 * Construct a new Ed25519VerificationKey2020. Supports
 * Ed25519VerificationKey2020, Ed25519VerificationKey2018 and JsonWebKey2020
 * key data.
 * Note, some resolved keys show as Ed25519VerificationKey2018 and have
 * `publicKeyJwk` on them, these may be coerced to `JsonWebKey2020`.
 */
export const buildEd25519VerificationKey2020 = async (keyPair: any) => {
  let key;
  keyPair = coerceKeyData({ ...keyPair });
  switch (keyPair.type) {
    case 'Ed25519VerificationKey2018':
      // This could technically just be `Ed25519VerificationKey2020.from` since
      // that supports going directly from `Ed25519VerificationKey2018`
      key = await Ed25519VerificationKey2020.fromEd25519VerificationKey2018({
        keyPair,
      });
      break;
    case 'Ed25519VerificationKey2020':
    case 'JsonWebKey2020':
      key = await Ed25519VerificationKey2020.from(keyPair);
      break;
    default:
      throw new Error(`Key type "${keyPair.type}" not supported`);
  }
  return key;
};

export const buildEd25519VerificationKey = async (keyPair: any) => {
  keyPair = coerceKeyData({ ...keyPair });
  const key =
    keyPair?.type == 'Ed25519VerificationKey2018'
      ? await Ed25519VerificationKey2018.from(keyPair)
      : await Ed25519VerificationKey2020.from(keyPair);
  return key;
};
