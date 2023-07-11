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
const { client, registry, messenger, reader, writer, bbsBlsService } =
  createServices(environment);

await registry.registerCredential(
  {
    operation: MessageType.REGISTER_CREDENTIAL,
    vc_id: `urn:uuid:81348e38-db35-4e5a-bcce-1644422cedd9`,
    encrypted_passphrase:
      'Aes256Gcm.lESQoX90KLyB4FM8kKnW1tYmsPI9P9Ma3RPQhqYz21Q=.QUAAAAAFaXYADAAAAABGLi4kytbeaqKAuHIFYXQAEAAAAABTNaI2LuYsHWFl97TN91bQAmFkAAUAAABub25lAAA=',
    ipfs_cid: 'QmNxHdP8EoKQTqLDZtVijv66aeGKsxGEPwCz4AMkj2AExZ',
  },
  EncryptionKey.fromBytes(Buffer.from(passphraseEncryptionKeyHex, 'hex'))
);

const queryHandler = new PresentationQueryHandler(
  responderDid,
  messenger,
  registry,
  log
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

new HcsListener(client, responderTopicsIds, log)
  .addHandler(queryHandler)
  .addHandler(requestHandler)
  .listen();
