import { PresentationQueryHandler } from './handlers/presentation-query-handler.js';
import { PresentationRequestHandler } from './handlers/presentation-request-handler.js';
import { HcsListener } from './hcs/hcs-listener.js';
import { createServices, loadEnvironment } from './util/load-environment.js';
import { log } from './util/logger.js';

const environment = loadEnvironment();
const { responderTopicsIds, responderDid } = environment;
const { client, registry, messenger, reader, writer, bbsBlsService } =
  createServices(environment);

await registry.registerCredential(
  `urn:uuid:81348e38-db35-4e5a-bcce-1644422cedd9`,
  '0.0.15043617'
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
