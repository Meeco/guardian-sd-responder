import { Timestamp, TopicMessage, TransactionId } from '@hashgraph/sdk';
import Long from 'long';
import { jsonToBase64 } from '../../src/util/encoders.js';

export const createTopicMessage = (
  json: any,
  sequenceNo = 100,
  timestamp?: Timestamp
) => {
  const consensusTimestamp = timestamp ?? Timestamp.fromDate(new Date());
  const sequenceNumber = new Long(sequenceNo);

  return {
    consensusTimestamp,
    contents: Buffer.from(jsonToBase64(json), 'base64'),
    chunks: [],
    initialTransactionId: new TransactionId(null, null),
    runningHash: new Uint8Array(),
    sequenceNumber,
  } as TopicMessage;
};
