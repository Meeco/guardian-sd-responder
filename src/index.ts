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
      'Aes256Gcm.OWhPuDTvE9C3r2OzQC3-6phXK9nQLQD8k52L16K_UhCVza9cBLOnNib3z75A4JxEt__1JkIeMOt_joQpypgO3Hd2TlEv90ngAQPhtVIT2Uns2OjpmftMHnjrmrKhGUbc.QUAAAAAFaXYADAAAAAAlRd8N6IqxE1rj5nIFYXQAEAAAAACvv9QafQFgWPgfnV5vcEqOAmFkAAUAAABub25lAAA=',
    ipfs_cid:
      'bafybeibs3vbylkk7ikhbkqd6zsjmspeajnm3onaqpad2a5tcvh3sk2xt5m/6871fc25-0b80-421c-ae1a-457107a6aadf',
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
