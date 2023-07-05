import { Timestamp, TopicMessage, TransactionId } from '@hashgraph/sdk';
import inquirer from 'inquirer';
import Long from 'long';
import { PresentationRequestHandler } from '../handlers/presentation-request-handler.js';
import { DecodedMessage } from '../hcs/decoded-message.js';
import { HcsMessenger } from '../hcs/hcs-messenger.js';
import { MessageType } from '../hcs/messages.js';
import { HfsReader } from '../hfs/hfs-reader.js';
import { HfsWriter } from '../hfs/hfs-writer.js';
import { jsonToBase64 } from '../util/encoders.js';
import { LmdbStorage } from '../util/key-value-storage.js';
import { loadEnvironment } from '../util/load-environment.js';
import { log } from '../util/logger.js';
import { TransmuteBbsBlsService } from '../vc/bbs-bls-service-transmute.js';
import { CredentialRegistry } from '../vc/credential-registry.js';
import { PexDocumentLoader } from '../vc/document-loader.js';

// Process a 'request' for the given file id without the need to actually add a
// request message to a listened topic.

const {
  client,
  responderPublicKey,
  responderPrivateKey,
  responderDid,
  responderTopicsIds,
} = loadEnvironment();

const { requestFileId } = await inquirer.prompt([
  {
    name: 'requestFileId',
    message: 'Enter HFS file id of request file',
  },
]);

const [topicId] = responderTopicsIds;
const messenger = new HcsMessenger(client, log);
const storage = new LmdbStorage();
const reader = new HfsReader(client);
const documentLoader = new PexDocumentLoader(storage, log);
const bbsBlsService = new TransmuteBbsBlsService(documentLoader.loader, log);
const writer = new HfsWriter(
  responderPublicKey,
  responderPrivateKey,
  client,
  log
);

const registry = new CredentialRegistry(storage, reader);
await registry.registerCredential(
  `urn:uuid:81348e38-db35-4e5a-bcce-1644422cedd9`,
  '0.0.15043617'
);

const requestHandler = new PresentationRequestHandler(
  responderDid,
  reader,
  writer,
  messenger,
  registry,
  bbsBlsService,
  log
);

const consensusTimestamp = Timestamp.fromDate(new Date());
const sequenceNumber = new Long(100);

const message = {
  consensusTimestamp,
  contents: Buffer.from(
    jsonToBase64({
      operation: MessageType.PRESENTATION_REQUEST,
      recipient_did: responderDid,
      request_file_id: requestFileId,
      request_file_dek_encrypted_base64: '',
      request_file_public_key_id: '',
    }),
    'base64'
  ),
  chunks: [],
  initialTransactionId: new TransactionId(null, null),
  runningHash: new Uint8Array(),
  sequenceNumber,
} as TopicMessage;

await requestHandler.handle(DecodedMessage.fromTopicMessage(message, topicId)!);

log.info('Complete');
process.exit(0);
