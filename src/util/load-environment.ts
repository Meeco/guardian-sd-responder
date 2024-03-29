import { Client, Hbar } from '@hashgraph/sdk';
import bs58 from 'bs58';
import { existsSync, readFileSync } from 'fs';
import { base58btc } from 'multiformats/bases/base58';
import { join } from 'path';
import { HcsEncryption } from '../hcs/hcs-encryption.js';
import { HcsMessenger } from '../hcs/hcs-messenger.js';
import { HfsReader } from '../hfs/hfs-reader.js';
import { MattrBbsBlsService } from '../vc/bbs-bls-service-mattr.js';
import { CredentialRegistry } from '../vc/credential-registry.js';
import { resolveDidDocument } from '../vc/did-resolve.js';
import { PexDocumentLoader } from '../vc/document-loader.js';
import {
  Ed25519VerificationKey2018Key,
  Ed25519VerificationKey2020Key,
  PresentationSigner,
} from '../vc/presentation-signer.js';
import { PresentationVerifierDigitalBazaar } from '../vc/presentation-verifier-digitalbazaar.js';
import { EnvironmentConfig, HederaNetwork } from './config.js';
import { fetchIPFSFile } from './ipfs-fetch.js';
import { LmdbStorage } from './key-value-storage.js';

import path from 'path';
import { fileURLToPath } from 'url';
import { IpfsWriter } from '../ipfs/ipfs-writer.js';
import { log, makeLogger } from './logger.js';

// As we are using ESM we can't use vanilla __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const _createHederaClient = (
  accountId: string,
  network: HederaNetwork,
  accountPrivateKey: string
) => {
  let client: Client;

  switch (network) {
    case 'mainnet':
      client = Client.forMainnet();
      break;
    case 'previewnet':
      client = Client.forPreviewnet();
      break;
    case 'testnet':
      client = Client.forTestnet();
      break;
    default:
      throw Error(`Unsupported hedera_network in config "${network}"`);
  }

  client
    .setOperator(accountId, accountPrivateKey)
    .setDefaultMaxTransactionFee(new Hbar(1))
    .setMaxQueryPayment(new Hbar(1));
  return client;
};

export const responderKey = (
  env: EnvironmentConfig
): Ed25519VerificationKey2018Key | Ed25519VerificationKey2020Key => {
  const {
    responder: { did, edsa_key_config },
  } = env;

  return edsa_key_config.type == 'Ed25519VerificationKey2018'
    ? ({
        id: edsa_key_config.id,
        controller: did,
        type: 'Ed25519VerificationKey2018',
        privateKeyBase58: bs58.encode(
          Buffer.from(edsa_key_config.private_key_hex, 'hex')
        ),
        publicKeyBase58: bs58.encode(
          Buffer.from(edsa_key_config.public_key_hex, 'hex')
        ),
      } as Ed25519VerificationKey2018Key)
    : ({
        id: edsa_key_config.id,
        controller: did,
        type: edsa_key_config.type,
        privateKeyMultibase: base58btc.encode(
          Buffer.from(edsa_key_config.private_key_hex, 'hex')
        ),
        publicKeyMultibase: base58btc.encode(
          Buffer.from(edsa_key_config.public_key_hex, 'hex')
        ),
      } as Ed25519VerificationKey2020Key);
};

export const createServices = (configuration: EnvironmentConfig) => {
  const { responder } = configuration;
  const {
    did,
    hedera_network,
    payer_account_id,
    payer_account_private_key,
    edsa_key_config,
    web3_storage_api_token,
  } = responder;
  const client = _createHederaClient(
    payer_account_id,
    hedera_network,
    payer_account_private_key
  );

  const logger = makeLogger(configuration.responder.log_level ?? 'info');
  const messenger = new HcsMessenger(client, logger);
  const storage = new LmdbStorage();
  const reader = new HfsReader(client);
  const documentLoader = new PexDocumentLoader(storage, logger);
  const responderKeyDetails = responderKey(configuration);
  const presentationSigner = new PresentationSigner(
    documentLoader.loader,
    responderKeyDetails,
    logger
  );
  const bbsBlsService = new MattrBbsBlsService(
    documentLoader.loader,
    presentationSigner,
    logger
  );

  const web3StorageToken = web3_storage_api_token;

  const writer = new IpfsWriter(web3StorageToken);

  const registry = new CredentialRegistry(
    storage,
    fetchIPFSFile,
    configuration.guardians,
    logger
  );

  const verifier = new PresentationVerifierDigitalBazaar(
    documentLoader.loader,
    configuration.guardians,
    logger
  );

  let edsaKeyConfig:
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
      };

  switch (edsa_key_config.type) {
    case 'Ed25519VerificationKey2018':
      edsaKeyConfig = {
        id: edsa_key_config.id,
        controller: did,
        privateKeyBase58: bs58.encode(
          Buffer.from(edsa_key_config.private_key_hex, 'hex')
        ),
        publicKeyBase58: bs58.encode(
          Buffer.from(edsa_key_config.public_key_hex, 'hex')
        ),
        type: 'Ed25519VerificationKey2018',
      };
      break;
    case 'Ed25519VerificationKey2020':
      edsaKeyConfig = {
        id: edsa_key_config.id,
        controller: did,
        privateKeyMultibase: base58btc.encode(
          Buffer.from(edsa_key_config.private_key_hex, 'hex')
        ),
        publicKeyMultibase: base58btc.encode(
          Buffer.from(edsa_key_config.public_key_hex, 'hex')
        ),
        type: 'Ed25519VerificationKey2020',
      };
      break;
    default:
      log.error(
        `Invalid EDSA key type "${edsa_key_config.type}" - expected one of: ['Ed25519VerificationKey2018', 'Ed25519VerificationKey2020]`
      );
      process.exit(1);
  }

  const hcsEncryption = new HcsEncryption(
    edsaKeyConfig,
    resolveDidDocument,
    logger
  );

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
    logger,
  };
};
