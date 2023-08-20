import nacl from 'tweetnacl';

export class HcsEncryption {
  public readonly keyPair: nacl.BoxKeyPair;
  constructor(private readonly hederaPrivateKeyHex: string) {
    this.keyPair = nacl.box.keyPair.fromSecretKey(
      Buffer.from(this.hederaPrivateKeyHex, 'hex')
    );
  }

  public get publicKey() {
    return this.keyPair.publicKey;
  }

  generateNonce() {
    return nacl.randomBytes(24);
  }

  encrypt(
    message: Uint8Array,
    nonceBase64: string,
    theirPublicKeyBase64: string
  ) {
    const theirPublic = Buffer.from(theirPublicKeyBase64, 'base64');
    return nacl.box(
      message,
      Buffer.from(nonceBase64, 'base64'),
      theirPublic,
      this.keyPair.secretKey
    );
  }

  decrypt(
    ciphertext: Uint8Array,
    nonceBase64: string,
    theirPublicKeyBase64: string
  ) {
    const theirPublic = Buffer.from(theirPublicKeyBase64, 'base64');
    const decrypted = nacl.box.open(
      ciphertext,
      Buffer.from(nonceBase64, 'base64'),
      theirPublic,
      this.keyPair.secretKey
    );

    if (decrypted == null || decrypted == undefined) {
      throw new DecryptionError();
    }

    return decrypted!;
  }
}

export class DecryptionError extends Error {
  constructor(message = 'Decryption Failed') {
    super(message);
    this.name = 'DecryptionError';
  }
}
