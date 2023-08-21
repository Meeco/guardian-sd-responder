import { PresentationQueryHandler } from './handlers/presentation-query-handler.js';
import { PresentationRequestHandler } from './handlers/presentation-request-handler.js';
import { RegisterCredentialHandler } from './handlers/register-credential-hander.js';
import { HcsListener } from './hcs/hcs-listener.js';
import { MessageType } from './hcs/messages.js';
import { createServices, loadEnvironment } from './util/load-environment.js';
import { log } from './util/logger.js';

const environment = loadEnvironment();

const {
  responder: { did: responderDid, topic_ids: responderTopicsIds },
  guardians,
} = environment;

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

await registry.registerCredential({
  operation: MessageType.REGISTER_CREDENTIAL,
  vc_id: `urn:uuid:6871fc25-0b80-421c-ae1a-457107a6aadf`,
  encrypted_passphrase:
    'Aes256Gcm.E0Agd8lDqW3HnKducPzkpsTWtxf6NPhx4wdudm45Ucg7SsbOd2fAAMDb0QIWd5IYVnxgfe-1oOwCDXjTkvUpm49DKe399sHH4VBfosDhS7vYwn4tUPLX4EtUAVRuwhqp.QUAAAAAFaXYADAAAAAA6nabrgad_cWS0O2YFYXQAEAAAAAA1FIYymXQLFXQXCtximnPNAmFkAAUAAABub25lAAA=',
  ipfs_cid:
    'bafybeie44cfgb6y6sqerl6ltfyfl6l2otvz4ectbvmsq4j2rbljx4kiufq/6871fc25-0b80-421c-ae1a-457107a6aadf',
  guardian_id: 'did:key:1234',
});

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

const registrationHandler = new RegisterCredentialHandler(registry, log);

new HcsListener(client, responderTopicsIds, log)
  .addHandler(queryHandler)
  .addHandler(requestHandler)
  .listen();

for (const guardian of guardians) {
  new HcsListener(client, guardian.topic_ids, log)
    .addHandler(registrationHandler)
    .listen();
}
