import { Client, Hbar, PrivateKey, PublicKey } from '@hashgraph/sdk';

/**
 * Load all required environment variables and return them in a single map. Also
 * prepares the Hashgraph `Client`.
 */
export const loadEnvironment = (env = process.env) => {
  const accountId = env.RESPONDER_ACCOUNT_ID;
  const accountPrivateKey = env.RESPONDER_ACCOUNT_PRIVATE_KEY;
  const responderDid = env.RESPONDER_DID;
  const responderTopicsIds = env.RESPONDER_TOPIC_IDS?.split(',');

  const responderPublicKeyHex = env.RESPONDER_DID_PUBLIC_KEY_HEX;
  const responderPrivateKeyHex = env.RESPONDER_DID_PRIVATE_KEY_HEX;

  if (!accountId || !accountPrivateKey) {
    throw new Error(
      'Environment variables RESPONDER_ACCOUNT_ID and RESPONDER_ACCOUNT_PRIVATE_KEY must be present'
    );
  }

  if (!responderDid) {
    throw new Error('Environment variable RESPONDER_DID must be present');
  }

  if (!responderTopicsIds) {
    throw new Error('Environment variable RESPONDER_TOPIC_IDS must be present');
  }

  if (!Array.isArray(responderTopicsIds) || responderTopicsIds.length === 0) {
    throw new Error(
      'Environment variable RESPONDER_TOPIC_IDS must be a comma separated list of TopicIds'
    );
  }

  if (!responderPublicKeyHex || !responderPrivateKeyHex) {
    throw new Error(
      'Environment variables RESPONDER_DID_PUBLIC_KEY_HEX and RESPONDER_DID_PUBLIC_KEY_HEX must be present'
    );
  }

  const responderPublicKey = PublicKey.fromString(responderPublicKeyHex);
  const responderPrivateKey = PrivateKey.fromString(responderPrivateKeyHex);

  const client = Client.forTestnet();

  client
    .setOperator(accountId, accountPrivateKey)
    .setDefaultMaxTransactionFee(new Hbar(1))
    .setMaxQueryPayment(new Hbar(1));

  return {
    accountId,
    accountPrivateKey,
    responderDid,
    responderTopicsIds,
    responderPublicKey,
    responderPrivateKey,
    client,
  };
};
