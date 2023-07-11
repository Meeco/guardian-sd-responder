import { Client, Hbar, PrivateKey, PublicKey } from '@hashgraph/sdk';
import bs58 from 'bs58';
import { HcsMessenger } from '../hcs/hcs-messenger.js';
import { HfsReader } from '../hfs/hfs-reader.js';
import { HfsWriter } from '../hfs/hfs-writer.js';
import { MattrBbsBlsService } from '../vc/bbs-bls-service-mattr.js';
import { CredentialRegistry } from '../vc/credential-registry.js';
import { PexDocumentLoader } from '../vc/document-loader.js';
import {
  Ed25519VerificationKey2018Key,
  Ed25519VerificationKey2020Key,
  PresentationSigner,
} from '../vc/presentation-signer.js';
import { fetchIPFSFile } from './ipfs-fetch.js';
import { LmdbStorage } from './key-value-storage.js';
import { log } from './logger.js';

interface EnvironmentConfiguration {
  accountId: string;
  accountPrivateKey: string;
  responderDid: string;
  responderTopicsIds: string[];
  passphraseEncryptionKeyHex: string;
  responderPublicKey: PublicKey;
  responderPrivateKey: PrivateKey;
  responderKeyDetails:
    | Ed25519VerificationKey2018Key
    | Ed25519VerificationKey2020Key;
}

/**
 * Load all required environment variables and return them in a single map. Also
 * prepares the Hashgraph `Client`.
 */
export const loadEnvironment = (
  env = process.env
): EnvironmentConfiguration => {
  const accountId = env.RESPONDER_ACCOUNT_ID;
  const accountPrivateKey = env.RESPONDER_ACCOUNT_PRIVATE_KEY;
  const responderDid = env.RESPONDER_DID;
  const responderTopicsIds = env.RESPONDER_TOPIC_IDS?.split(',');

  const responderKeyId = env.RESPONDER_DID_KEY_ID;
  const responderPublicKeyHex = env.RESPONDER_DID_PUBLIC_KEY_HEX;
  const responderPrivateKeyHex = env.RESPONDER_DID_PRIVATE_KEY_HEX;

  const passphraseEncryptionKeyHex = env.PASSPHRASE_ENCRYPTION_KEY_HEX;

  if (!accountId || !accountPrivateKey) {
    throw new Error(
      'Environment variables RESPONDER_ACCOUNT_ID and RESPONDER_ACCOUNT_PRIVATE_KEY must be present'
    );
  }

  if (!responderDid) {
    throw new Error('Environment variable RESPONDER_DID must be present');
  }

  if (!responderTopicsIds) {
    throw new Error('Environment variable RESPONDER_TOPIC_IDS must be present');
  }

  if (!Array.isArray(responderTopicsIds) || responderTopicsIds.length === 0) {
    throw new Error(
      'Environment variable RESPONDER_TOPIC_IDS must be a comma separated list of TopicIds'
    );
  }

  if (!responderPublicKeyHex || !responderPrivateKeyHex || !responderKeyId) {
    throw new Error(
      'Environment variables RESPONDER_DID_PUBLIC_KEY_HEX, RESPONDER_DID_PUBLIC_KEY_HEX and RESPONDER_DID_KEY_ID must be present'
    );
  }

  if (!passphraseEncryptionKeyHex) {
    throw new Error(
      'Environment variable PASSPHRASE_ENCRYPTION_KEY_HEX must be present'
    );
  }

  const responderPublicKey = PublicKey.fromString(responderPublicKeyHex);
  const responderPrivateKey = PrivateKey.fromString(responderPrivateKeyHex);

  return {
    accountId,
    accountPrivateKey,
    responderDid,
    responderTopicsIds,
    responderPublicKey,
    responderPrivateKey,
    passphraseEncryptionKeyHex,
    responderKeyDetails: {
      id: `${responderDid}#${responderKeyId}`,
      controller: responderDid,
      type: 'Ed25519VerificationKey2018',
      privateKeyBase58: bs58.encode(Buffer.from(responderPrivateKeyHex, 'hex')),
      publicKeyBase58: bs58.encode(Buffer.from(responderPublicKeyHex, 'hex')),
    },
  };
};

const _createHederaClient = (accountId: string, accountPrivateKey: string) => {
  const client = Client.forTestnet();
  client
    .setOperator(accountId, accountPrivateKey)
    .setDefaultMaxTransactionFee(new Hbar(1))
    .setMaxQueryPayment(new Hbar(1));
  return client;
};

export const createServices = (configuration: EnvironmentConfiguration) => {
  const {
    accountId,
    accountPrivateKey,
    responderPublicKey,
    responderPrivateKey,
    responderKeyDetails,
  } = configuration;
  const client = _createHederaClient(accountId, accountPrivateKey);

  const messenger = new HcsMessenger(client, log);
  const storage = new LmdbStorage();
  const reader = new HfsReader(client);
  const documentLoader = new PexDocumentLoader(storage, log);
  const presentationSigner = new PresentationSigner(
    documentLoader.loader,
    responderKeyDetails,
    log
  );
  const bbsBlsService = new MattrBbsBlsService(
    documentLoader.loader,
    presentationSigner,
    log
  );
  const writer = new HfsWriter(
    responderPublicKey,
    responderPrivateKey,
    client,
    log
  );

  const registry = new CredentialRegistry(storage, fetchIPFSFile, log);

  return {
    messenger,
    storage,
    reader,
    documentLoader,
    bbsBlsService,
    writer,
    registry,
    client,
  };
};
