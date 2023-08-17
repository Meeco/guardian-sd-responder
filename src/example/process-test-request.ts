import { Timestamp, TopicMessage, TransactionId } from '@hashgraph/sdk';
import { EncryptionKey } from '@meeco/cryppo';
import Long from 'long';
import { PresentationRequestHandler } from '../handlers/presentation-request-handler.js';
import { DecodedMessage } from '../hcs/decoded-message.js';
import { MessageType, PresentationRequestMessage } from '../hcs/messages.js';
import { jsonToBase64 } from '../util/encoders.js';
import { createServices, loadEnvironment } from '../util/load-environment.js';
import { log } from '../util/logger.js';

// Process a 'request' for the given file id without the need to actually add a
// request message to a listened topic.

const environment = loadEnvironment();
const { responderDid, responderTopicsIds, passphraseEncryptionKeyHex } =
  environment;
const {
  registry,
  reader,
  writer,
  messenger,
  bbsBlsService,
  verifier,
  hcsEncryption,
} = createServices(environment);

await registry.registerCredential(
  {
    operation: MessageType.REGISTER_CREDENTIAL,
    vc_id: `urn:uuid:6871fc25-0b80-421c-ae1a-457107a6aadf`,
    encrypted_passphrase:
      'Aes256Gcm.8Kf9-zWPULg3J6iVAUognXQA83dIJkQxo9TMhUGbVA3CGiecz_UcaSq8-uKOcNMh.QUAAAAAFaXYADAAAAAADR7iLcRA0X44LFDwFYXQAEAAAAABhkFEy3_TaQIQHrzBuAWrBAmFkAAUAAABub25lAAA=',
    ipfs_cid:
      'bafybeigezd7mkdwfmcj3awnsf6hix6xyetxnq4lbund5yndq7fqho3t6hy/6871fc25-0b80-421c-ae1a-457107a6aadf',
  },
  EncryptionKey.fromBytes(Buffer.from(passphraseEncryptionKeyHex, 'hex'))
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
  verifier,
  hcsEncryption,
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

await requestHandler.handle(
  DecodedMessage.fromTopicMessage<PresentationRequestMessage>(message, topicId)!
);

log.info('Complete');
process.exit(0);
