import { FieldV2 } from '@sphereon/pex-models';
import { Logger } from 'winston';
import { DecodedMessage } from '../hcs/decoded-message.js';
import { HcsMessenger } from '../hcs/hcs-messenger.js';
import {
  MessageType,
  PresentationRequestMessage,
  PresentationResponseMessage,
} from '../hcs/messages.js';
import { HfsReader } from '../hfs/hfs-reader.js';
import { HfsWriter } from '../hfs/hfs-writer.js';
import { BbsBlsService, VerifiableCredential } from '../vc/bbs-bls-service.js';
import { CredentialRegistry } from '../vc/credential-registry.js';
import { PresentationRequest } from '../vc/presentation-request.js';
import { Handler } from './handler.js';

/**
 * Processes presentation request messages, only if they are addressed to this
 * responder's DID (via recipient_idd in the message).
 *
 * The requested file along with the corresponding presentation request will be
 * fetched and a new credential will be created using selective disclosure. This
 * is then composed into a Verifiable Presentation and returned as a
 * presentation-response message via HCS.
 */
export class PresentationRequestHandler implements Handler {
  public readonly operation = MessageType.PRESENTATION_REQUEST;

  constructor(
    private readonly responderDid: string,
    private readonly reader: HfsReader,
    private readonly writer: HfsWriter,
    private readonly hcsMessenger: HcsMessenger,
    private readonly registry: CredentialRegistry,
    private readonly bbsBlsService: BbsBlsService,
    protected readonly logger?: Logger
  ) {}

  async handle(message: DecodedMessage) {
    this.logger?.verbose(`Received "${this.operation}"`);

    const { recipient_did, request_file_id } =
      message.contents as PresentationRequestMessage;
    const challenge = message.sequenceNumber.toString();

    if (recipient_did !== this.responderDid) {
      this.logger?.verbose(
        `Request is not intended for this responder - skipping`,
        {
          recipient_did,
          responder_did: this.responderDid,
        }
      );
      return;
    }

    this.logger?.verbose(`Fetch request file "${request_file_id}"`);
    const presentationRequest = (await this.reader.readFileAsJson(
      request_file_id
    )) as PresentationRequest;
    this.logger?.debug(presentationRequest);

    const { authorization_details, presentation_definition } =
      presentationRequest;

    const descriptors = presentation_definition?.input_descriptors ?? [];

    let field: FieldV2 | undefined;

    descriptors.find((descriptor) => {
      field = descriptor?.constraints?.fields?.find(
        (field) => field.path && field.path[0] === '$.id'
      );
      return field;
    });

    const credentialId = field?.filter?.const;

    if (!credentialId) {
      this.logger?.info(
        `Unable to determine credential ID from request. It will be ignored`
      );
      return;
    }

    this.logger?.verbose(`Fetch credential "${credentialId}"`);
    let credential: VerifiableCredential | undefined;

    try {
      credential = await this.registry.fetchCredential(credentialId as string);
    } catch (err) {
      // Skip if can't fetch
    }

    this.logger?.debug(credential);

    if (!credential) {
      this.logger?.info(
        `Unable to fetch the credential "${credentialId}". Request can not be handled`
      );
      return;
    }

    this.logger?.verbose('Derive proof');

    const derivedProof = await this.bbsBlsService.createProof(
      credential,
      presentation_definition
    );

    const signedPresentation = await this.bbsBlsService.preparePresentation(
      presentation_definition,
      derivedProof,
      challenge
    );

    this.logger?.verbose('Write presentation to HFS');
    const fileId = await this.writer.writeFile(
      JSON.stringify(signedPresentation)
    );

    if (!fileId) {
      this.logger?.error(
        `Writing file to HFS did not return a file id - can not respond`
      );
      return;
    }

    const response: PresentationResponseMessage = {
      operation: MessageType.PRESENTATION_RESPONSE,
      recipient_did: authorization_details.did,
      response_file_dek_encrypted_base64: '',
      response_file_id: fileId.toString(),
    };

    this.logger?.verbose(`Sending response "${response.operation}"`);
    this.logger?.debug(response);

    await this.hcsMessenger.send({
      message: JSON.stringify(response),
      topicId: message.topicId,
    });

    this.logger?.info(`Processing "${this.operation}" complete`);
  }
}
