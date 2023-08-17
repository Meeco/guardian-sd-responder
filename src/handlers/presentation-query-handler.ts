import { Logger } from 'winston';
import { DecodedMessage } from '../hcs/decoded-message.js';
import { HcsEncryption } from '../hcs/hcs-encryption.js';
import { HcsMessenger } from '../hcs/hcs-messenger.js';
import {
  MessageType,
  PresentationQueryMessage,
  QueryResponseMessage,
} from '../hcs/messages.js';
import { CredentialRegistry } from '../vc/credential-registry.js';
import { Handler } from './handler.js';

/**
 * Processes presentation query messages, responding with a query-response
 * message via HCS only if the query could be fulfilled by this responder (based
 * on known credential ids).
 */
export class PresentationQueryHandler
  implements Handler<PresentationQueryMessage>
{
  constructor(
    private readonly responderDid: string,
    private readonly hcsMessenger: HcsMessenger,
    private readonly registry: CredentialRegistry,
    private readonly encryption: HcsEncryption,
    protected readonly logger?: Logger
  ) {}

  readonly operation = MessageType.PRESENTATION_QUERY;

  async handle(message: DecodedMessage<PresentationQueryMessage>) {
    this.logger?.verbose(`Received "${this.operation}"`);

    const { vc_id, requester_did, request_id } =
      message.contents as PresentationQueryMessage;

    if (!vc_id || !requester_did || !request_id) {
      this.logger?.error(
        `Message "${message.consensusTimestamp}" did not contain the required parameters for "${this.operation}"`
      );
      return;
    }

    const canHandle = await this.registry.canHandleCredential(vc_id);
    if (!canHandle) {
      this.logger?.info(`Unable to handle credential "${vc_id}" - ignoring`);
      return;
    }

    const response: QueryResponseMessage = {
      operation: MessageType.QUERY_RESPONSE,
      request_id,
      responder_did: this.responderDid,
      response_ephem_public_key: Buffer.from(
        this.encryption.publicKey
      ).toString('base64'),
      offer_hbar: 0,
    };

    this.logger?.verbose(`Sending response "${response.operation}"`);
    await this.hcsMessenger.send({
      message: JSON.stringify(response),
      topicId: message.topicId,
    });
  }
}
