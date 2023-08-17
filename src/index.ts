import { EncryptionKey } from '@meeco/cryppo';
import { PresentationQueryHandler } from './handlers/presentation-query-handler.js';
import { PresentationRequestHandler } from './handlers/presentation-request-handler.js';
import { HcsListener } from './hcs/hcs-listener.js';
import { MessageType } from './hcs/messages.js';
import { createServices, loadEnvironment } from './util/load-environment.js';
import { log } from './util/logger.js';

const environment = loadEnvironment();
const { responderTopicsIds, responderDid, passphraseEncryptionKeyHex } =
  environment;
const {
  client,
  registry,
  messenger,
  reader,
  writer,
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

const queryHandler = new PresentationQueryHandler(
  responderDid,
  messenger,
  registry,
  hcsEncryption,
  log
);

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

new HcsListener(client, responderTopicsIds, log)
  .addHandler(queryHandler)
  .addHandler(requestHandler)
  .listen();
