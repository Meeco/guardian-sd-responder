import inquirer from 'inquirer';
import { MessageType, RegisterCredentialMessage } from '../hcs/messages.js';
import { createServices, loadEnvironment } from '../util/load-environment.js';
import { log } from '../util/logger.js';

const environment = loadEnvironment();

const { guardians } = environment;

const { registry, messenger } = createServices(environment);

if (guardians.length < 1) {
  log.error('No guardians configured - check config file');
  process.exit(1);
}

const { direct } = await inquirer.prompt([
  {
    name: 'direct',
    type: 'confirm',
    message:
      'Would you like to immediately register the credential (skip HCS message)?',
    default: false,
  },
]);

const { vc_id, encrypted_passphrase, ipfs_cid, guardian_id } =
  await inquirer.prompt([
    {
      name: 'vc_id',
      message: 'ID/URN of the verifiable credential',
    },
    {
      name: 'ipfs_cid',
      message: 'IPFS CID of the encrypted credential',
    },
    {
      name: 'encrypted_passphrase',
      message: 'Encrypted passphrase',
    },
    {
      name: 'guardian_id',
      message: 'Guardian ID (default is first configured guardian)',
      default: guardians[0].id,
    },
  ]);

if (direct) {
  await registry.registerCredential({
    operation: MessageType.REGISTER_CREDENTIAL,
    vc_id,
    encrypted_passphrase,
    ipfs_cid,
    guardian_id,
  });
  log.info('Credential registered');
  process.exit(0);
} else {
  const { topicId } = await inquirer.prompt({
    name: 'topicId',
    message:
      'Topic ID for the message (default is the first topic for the selected guardian)',
    default: guardians[0].topic_ids[0],
  });

  await messenger.send({
    message: JSON.stringify(<RegisterCredentialMessage>{
      operation: MessageType.REGISTER_CREDENTIAL,
      guardian_id,
      vc_id,
      ipfs_cid,
      encrypted_passphrase,
    }),
    topicId,
  });
  log.info('Topic message sent');
  process.exit(0);
}
