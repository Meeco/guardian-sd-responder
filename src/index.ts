import { PresentationQueryHandler } from './handlers/presentation-query-handler.js';
import { PresentationRequestHandler } from './handlers/presentation-request-handler.js';
import { RegisterCredentialHandler } from './handlers/register-credential-hander.js';
import { HcsListener } from './hcs/hcs-listener.js';
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
  logger,
} = createServices(environment);

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

const registrationHandler = new RegisterCredentialHandler(registry, logger);

new HcsListener(client, responderTopicsIds, logger)
  .addHandler(queryHandler)
  .addHandler(requestHandler)
  .listen();

for (const guardian of guardians) {
  new HcsListener(client, guardian.topic_ids, logger)
    .addHandler(registrationHandler)
    .listen();
}
