import { PresentationQueryHandler } from './handlers/presentation-query-handler.js';
import { PresentationRequestHandler } from './handlers/presentation-request-handler.js';
import { HcsListener } from './hcs/hcs-listener.js';
import { HcsMessenger } from './hcs/hcs-messenger.js';
import { HfsReader } from './hfs/hfs-reader.js';
import { HfsWriter } from './hfs/hfs-writer.js';
import { LmdbStorage } from './util/key-value-storage.js';
import { loadEnvironment } from './util/load-environment.js';
import { log } from './util/logger.js';
import { MattrBbsBlsService } from './vc/bbs-bls-service-mattr.js';
import { CredentialRegistry } from './vc/credential-registry.js';
import { PexDocumentLoader } from './vc/document-loader.js';

const {
  client,
  responderPublicKey,
  responderPrivateKey,
  responderDid,
  responderTopicsIds,
} = loadEnvironment();

const messenger = new HcsMessenger(client, log);
const storage = new LmdbStorage();
const reader = new HfsReader(client);
const documentLoader = new PexDocumentLoader(storage, log);
const bbsBlsService = new MattrBbsBlsService(documentLoader.loader, log);
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
