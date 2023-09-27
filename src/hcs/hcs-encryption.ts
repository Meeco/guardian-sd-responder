import { Cipher } from '@digitalbazaar/minimal-cipher';
import { X25519KeyAgreementKey2020 } from '@digitalbazaar/x25519-key-agreement-key-2020';
import { Logger } from 'winston';
import { buildEd25519VerificationKey2020 } from '../util/key-data.js';
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
  ) {
    if (
      !this.edsaKeyConfig.id ||
      !this.edsaKeyConfig.controller ||
      !this.edsaKeyConfig.type
    ) {
      logger?.error(
        'Bad key config - check edsaKeyConfig has all required properties'
      );
      throw new Error('Missing one or more EDSA key config properties');
    }
  }

  public get publicKeyId() {
    return this.edsaKeyConfig.id;
  }

  private async deriveX25519KeyPair() {
    const responderEdKey = await buildEd25519VerificationKey2020(
      this.edsaKeyConfig
    );

    return X25519KeyAgreementKey2020.fromEd25519VerificationKey2020({
      keyPair: responderEdKey,
    });
  }

  async encrypt(obj: { [key: string]: any }, recipientKeyIdOrDid: string) {
    const [did] = recipientKeyIdOrDid.split('#');
    const didDoc = await this.didResolver(did);
    const keys = [
      ...(didDoc.publicKey ?? []),
      ...(didDoc.verificationMethod ?? []),
    ];
    let key = keys.find((key: any) => key.id === recipientKeyIdOrDid);
    if (!key) key = keys[0];
    if (!key) {
      throw new Error('No applicable keys found on did document');
    }

    const keyPair = await buildEd25519VerificationKey2020(key);

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
