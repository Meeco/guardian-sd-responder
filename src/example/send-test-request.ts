import { TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import inquirer from 'inquirer';
import { MessageType } from '../hcs/messages.js';
import { createServices, loadEnvironment } from '../util/load-environment.js';
import { log } from '../util/logger.js';

// Send a request message for the given file id to the first topic listed in the
// RESPONDER_TOPIC_IDS configuration.

const environment = loadEnvironment();
const {
  responder: { did: responderDid, topic_ids: responderTopicsIds },
} = environment;
const { client } = createServices(environment);

const { requestFileId } = await inquirer.prompt([
  {
    name: 'requestFileId',
    message: 'Enter HFS file id of request file',
  },
]);

const [topicId] = responderTopicsIds;

const message = JSON.stringify({
  operation: MessageType.PRESENTATION_REQUEST,
  recipient_did: responderDid,
  request_file_id: requestFileId,
  request_file_dek_encrypted_base64: '',
  request_file_public_key_id: '',
});

const sendResponse = await new TopicMessageSubmitTransaction({
  topicId: topicId,
  message,
}).execute(client);

const getReceipt = await sendResponse.getReceipt(client);
const transactionStatus = getReceipt.status;

log.debug('The message transaction status: ' + transactionStatus.toString());
log.info('Complete');
process.exit(0);
