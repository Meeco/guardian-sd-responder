import { Client, Hbar, PrivateKey, PublicKey } from '@hashgraph/sdk';
import bs58 from 'bs58';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { HcsEncryption } from '../hcs/hcs-encryption.js';
import { HcsMessenger } from '../hcs/hcs-messenger.js';
import { HfsReader } from '../hfs/hfs-reader.js';
import { HfsWriter } from '../hfs/hfs-writer.js';
import { MattrBbsBlsService } from '../vc/bbs-bls-service-mattr.js';
import { CredentialRegistry } from '../vc/credential-registry.js';
import { PexDocumentLoader } from '../vc/document-loader.js';
import {
  Ed25519VerificationKey2018Key,
  PresentationSigner,
} from '../vc/presentation-signer.js';
import { PresentationVerifierDigitalBazaar } from '../vc/presentation-verifier-digitalbazaar.js';
import { EnvironmentConfig } from './config.js';
import { fetchIPFSFile } from './ipfs-fetch.js';
import { LmdbStorage } from './key-value-storage.js';
import { log } from './logger.js';

/**
 * Load all required environment variables and return them in a single map. Also
 * prepares the Hashgraph `Client`.
 */
export const loadEnvironment = (): EnvironmentConfig => {
  const configPath =
    process.env.CONFIG_PATH ?? join(__dirname, '..', '..', 'config.json');

  if (!existsSync) {
    log.error(
      `config.json file not present - expected to find it at "${configPath}"`
    );
  }

  const configJson = readFileSync(configPath, 'utf-8');

  return JSON.parse(configJson);
};

const _createHederaClient = (accountId: string, accountPrivateKey: string) => {
  const client = Client.forTestnet();
  client
    .setOperator(accountId, accountPrivateKey)
    .setDefaultMaxTransactionFee(new Hbar(1))
    .setMaxQueryPayment(new Hbar(1));
  return client;
};

export const responderKey = (
  env: EnvironmentConfig
): Ed25519VerificationKey2018Key => {
  const {
    responder: { did, did_public_key_hex, did_private_key_hex, did_key_id },
  } = env;

  return {
    id: `${did}#${did_key_id}`,
    controller: did,
    type: 'Ed25519VerificationKey2018',
    privateKeyBase58: bs58.encode(Buffer.from(did_public_key_hex, 'hex')),
    publicKeyBase58: bs58.encode(Buffer.from(did_private_key_hex, 'hex')),
  };
};

export const createServices = (configuration: EnvironmentConfig) => {
  const { responder } = configuration;
  const {
    payer_account_id,
    payer_account_private_key,
    did_public_key_hex,
    did_private_key_hex,
    hedera_encryption_private_key_hex,
  } = responder;
  const client = _createHederaClient(
    payer_account_id,
    payer_account_private_key
  );

  const messenger = new HcsMessenger(client, log);
  const storage = new LmdbStorage();
  const reader = new HfsReader(client);
  const documentLoader = new PexDocumentLoader(storage, log);
  const responderKeyDetails = responderKey(configuration);
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

  const responderPublicKey = PublicKey.fromString(did_public_key_hex);
  const responderPrivateKey = PrivateKey.fromString(did_private_key_hex);
  const writer = new HfsWriter(
    responderPublicKey,
    responderPrivateKey,
    client,
    log
  );

  const registry = new CredentialRegistry(
    storage,
    fetchIPFSFile,
    configuration.guardians,
    log
  );

  const verifier = new PresentationVerifierDigitalBazaar(
    documentLoader.loader,
    configuration.guardians,
    log
  );

  const hcsEncryption = new HcsEncryption(hedera_encryption_private_key_hex);

  return {
    messenger,
    storage,
    reader,
    documentLoader,
    bbsBlsService,
    writer,
    registry,
    client,
    verifier,
    hcsEncryption,
  };
};
