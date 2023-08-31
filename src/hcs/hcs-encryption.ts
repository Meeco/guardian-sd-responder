import { Ed25519VerificationKey2020 } from '@digitalbazaar/ed25519-verification-key-2020';
import { Cipher } from '@digitalbazaar/minimal-cipher';
import { X25519KeyAgreementKey2020 } from '@digitalbazaar/x25519-key-agreement-key-2020';
import { Logger } from 'winston';
import { resolveDidDocument } from '../vc/did-resolve.js';

export class HcsEncryption {
  constructor(
    private readonly edsaKeyConfig:
      | {
          id: string;
          controller: string;
          type: 'Ed25519VerificationKey2018';
          privateKeyBase58: string;
          publicKeyBase58: string;
        }
      | {
          id: string;
          controller: string;
          type: 'Ed25519VerificationKey2020';
          privateKeyMultibase: string;
          publicKeyMultibase: string;
        },
    private didResolver: (did: string) => any = resolveDidDocument,
    protected readonly logger?: Logger
  ) {}

  private async deriveX25519KeyPair() {
    const responderEdKey =
      this.edsaKeyConfig.type === 'Ed25519VerificationKey2018'
        ? await Ed25519VerificationKey2020.fromEd25519VerificationKey2018({
            keyPair: this.edsaKeyConfig,
          })
        : await Ed25519VerificationKey2020.from(this.edsaKeyConfig);

    return X25519KeyAgreementKey2020.fromEd25519VerificationKey2020({
      keyPair: responderEdKey,
    });
  }

  async encrypt(obj: { [key: string]: any }, recipientKeyIdOrDid: string) {
    const [did] = recipientKeyIdOrDid.split('#');
    const didDoc = await this.didResolver(did);
    let key = didDoc.publicKey.find(
      (key: any) => key.id === recipientKeyIdOrDid
    );
    if (!key) key = didDoc.publicKey[0];

    let keyPair;
    switch (key.type) {
      case 'Ed25519VerificationKey2018':
        keyPair =
          await Ed25519VerificationKey2020.fromEd25519VerificationKey2018({
            keyPair: key,
          });
        break;
      case 'Ed25519VerificationKey2020':
        keyPair = await Ed25519VerificationKey2020.from(key);
        break;
      default:
        throw new Error(`Key type "${key.type}" not supported for encryption`);
    }

    const keyAgreement =
      await X25519KeyAgreementKey2020.fromEd25519VerificationKey2020({
        keyPair,
      });

    const keyResolver = async () => keyAgreement;
    const cipher = new Cipher();
    const recipients = [
      {
        header: {
          kid: keyAgreement.id,
          alg: 'ECDH-ES+A256KW',
        },
      },
    ];
    const encrypted = await cipher.encryptObject({
      obj,
      recipients,
      keyResolver,
    });
    return encrypted;
  }

  async decrypt(jwe: any) {
    try {
      const cipher = new Cipher();
      const keyAgreementKey = await this.deriveX25519KeyPair();
      const decrypted = await cipher.decryptObject({
        jwe: jwe,
        keyAgreementKey,
      });
      return decrypted;
    } catch (error) {
      this.logger?.error(error);
      throw new DecryptionError();
    }
  }
}

export class DecryptionError extends Error {
  constructor(message = 'Decryption Failed') {
    super(message);
    this.name = 'DecryptionError';
  }
}
