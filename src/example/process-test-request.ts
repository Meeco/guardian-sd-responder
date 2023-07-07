import { Timestamp, TopicMessage, TransactionId } from '@hashgraph/sdk';
import Long from 'long';
import { PresentationRequestHandler } from '../handlers/presentation-request-handler.js';
import { DecodedMessage } from '../hcs/decoded-message.js';
import { MessageType } from '../hcs/messages.js';
import { jsonToBase64 } from '../util/encoders.js';
import { createServices, loadEnvironment } from '../util/load-environment.js';
import { log } from '../util/logger.js';

// Process a 'request' for the given file id without the need to actually add a
// request message to a listened topic.

const environment = loadEnvironment();
const { responderDid, responderTopicsIds } = environment;
const { registry, reader, writer, messenger, bbsBlsService } =
  createServices(environment);
await registry.registerCredential(
  `urn:uuid:81348e38-db35-4e5a-bcce-1644422cedd9`,
  '0.0.15043617'
);

const [topicId] = responderTopicsIds;
const requestFileId = '0.0.15056857';

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
