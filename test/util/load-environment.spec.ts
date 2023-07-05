import { Client, PrivateKey, PublicKey } from '@hashgraph/sdk';
import { afterEach, describe, expect, it } from '@jest/globals';
import { loadEnvironment } from '../../src/util/load-environment.js';

describe('Load environment', () => {
  const exampleEnvironment = {
    LOG_LEVEL: 'info',
    RESPONDER_TOPIC_IDS: '0.0.123,0.0.456,0.0.789',
    RESPONDER_DID: 'did:key:1234',
    RESPONDER_DID_PUBLIC_KEY_HEX:
      '0000000000000000000000000000000000000000000000000000000000000000',
    RESPONDER_DID_PRIVATE_KEY_HEX:
      '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    RESPONDER_ACCOUNT_ID: '0.0.1',
    RESPONDER_ACCOUNT_PRIVATE_KEY:
      '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
  };

  let client: Client | undefined;
  afterEach(() => {
    client?.close();
  });

  it('parses all variables and returns environment configuration', () => {
    const env = loadEnvironment(exampleEnvironment);
    client = env.client;
    expect(env).toEqual({
      accountId: '0.0.1',
      accountPrivateKey:
        '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      responderDid: 'did:key:1234',
      responderTopicsIds: ['0.0.123', '0.0.456', '0.0.789'],
      responderPublicKey: PublicKey.fromString(
        '0000000000000000000000000000000000000000000000000000000000000000'
      ),
      responderPrivateKey: PrivateKey.fromString(
        '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
      ),
      client: expect.any(Client),
    });
  });

  it('requires an account id', () => {
    const { RESPONDER_ACCOUNT_ID, ...env } = exampleEnvironment;
    expect(() => loadEnvironment(env)).toThrow(
      new Error(
        'Environment variables RESPONDER_ACCOUNT_ID and RESPONDER_ACCOUNT_PRIVATE_KEY must be present'
      )
    );
  });

  it('requires an account private key', () => {
    const { RESPONDER_ACCOUNT_PRIVATE_KEY, ...env } = exampleEnvironment;
    expect(() => loadEnvironment(env)).toThrow(
      new Error(
        'Environment variables RESPONDER_ACCOUNT_ID and RESPONDER_ACCOUNT_PRIVATE_KEY must be present'
      )
    );
  });

  it('requires a responder did', () => {
    const { RESPONDER_DID, ...env } = exampleEnvironment;
    expect(() => loadEnvironment(env)).toThrow(
      new Error('Environment variable RESPONDER_DID must be present')
    );
  });

  it('requires responder topic ids', () => {
    const { RESPONDER_TOPIC_IDS, ...env } = exampleEnvironment;
    expect(() => loadEnvironment(env)).toThrow(
      new Error('Environment variable RESPONDER_TOPIC_IDS must be present')
    );
  });

  it('requires responder private key', () => {
    const { RESPONDER_DID_PRIVATE_KEY_HEX, ...env } = exampleEnvironment;
    expect(() => loadEnvironment(env)).toThrow(
      new Error(
        'Environment variables RESPONDER_DID_PUBLIC_KEY_HEX and RESPONDER_DID_PUBLIC_KEY_HEX must be present'
      )
    );
  });

  it('requires responder public key', () => {
    const { RESPONDER_DID_PUBLIC_KEY_HEX, ...env } = exampleEnvironment;
    expect(() => loadEnvironment(env)).toThrow(
      new Error(
        'Environment variables RESPONDER_DID_PUBLIC_KEY_HEX and RESPONDER_DID_PUBLIC_KEY_HEX must be present'
      )
    );
  });
});
