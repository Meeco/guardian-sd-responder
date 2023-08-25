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
    'Aes256Gcm.2KrGWIP9TJmHqfnglKdYn8FJu7ZuFHk-ZZPeA--wjwoOowIJBNAaG6mco45YlzAshzXPxOb86_3d0CnnnsgaqqqQrwFDnJiihCb_a3yHmu-afMwoFhru2-QWHrBHGLQI.QUAAAAAFaXYADAAAAACr5b68bp29WIxyfTcFYXQAEAAAAAD-rpHiK0hZEKFHqGnzucIvAmFkAAUAAABub25lAAA=.Pbkdf2Hmac.S0EAAAAFaXYAFAAAAAARqZHS23aNrOZ8lPaQ6nxBMdC1UBBpAB1QAAAQbAAgAAAAAmhhc2gABwAAAFNIQTI1NgAA',
  ipfs_cid:
    'bafybeifkz53amsv53iyojtjhi5rayym6jtavxipsmimpbrtexs53kofvqy/credential.json',
  guardian_id: '135742af-a457-45ef-8a4e-03dbf6b98fd0',
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
