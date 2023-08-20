import { describe, expect, it } from '@jest/globals';
import nacl from 'tweetnacl';
import { HcsEncryption } from '../../src/hcs/hcs-encryption.js';

describe('hcs encryption', () => {
  const nonceBase64 = 'WTD3wc02YIG0B0Ou4ilR7kh6TK6sgLgv';
  const key =
    '4cd6372b65a5191f6dbea071a197f549b4df490a32515e73c2f293ca85597a82';
  const bob = {
    publicBase64: '6r3NiDSS3sUdgMonXebx4n+MfIwBfUmx+w2fhXJSSGE=',
    privateBase64: '9OhXU8Y38UazYe6BV/TvsPD/DMV5CIFQVAef9nkqCmY=',
  };

  it('encrypts a message', () => {
    const service = new HcsEncryption(key);
    const encrypted = service.encrypt(
      Buffer.from(`Hello, Bob.`, 'utf-8'),
      nonceBase64,
      bob.publicBase64
    );

    // Assume this would happen on the requester.
    const decryptedBinary = nacl.box.open(
      encrypted,
      Buffer.from(nonceBase64, 'base64'),
      service.publicKey,
      Buffer.from(bob.privateBase64, 'base64')
    );
    const decrypted = Buffer.from(decryptedBinary!).toString('utf-8');

    expect(decrypted).toEqual('Hello, Bob.');
  });

  it('decrypts a message', () => {
    const service = new HcsEncryption(key);

    // Assume this would come from requester
    const encrypted = nacl.box(
      Buffer.from('Hi, Alice.', 'utf-8'),
      Buffer.from(nonceBase64, 'base64'),
      service.publicKey,
      Buffer.from(bob.privateBase64, 'base64')
    );

    const decryptedBinary = service.decrypt(
      encrypted,
      nonceBase64,
      bob.publicBase64
    );

    const decrypted = Buffer.from(decryptedBinary!).toString('utf-8');

    expect(decrypted).toEqual('Hi, Alice.');
  });
});
