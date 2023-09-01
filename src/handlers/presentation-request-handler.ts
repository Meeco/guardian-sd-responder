import { FieldV2 } from '@sphereon/pex-models';
import { Logger } from 'winston';
import { DecodedMessage } from '../hcs/decoded-message.js';
import { HcsEncryption } from '../hcs/hcs-encryption.js';
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
import { PresentationVerifier } from '../vc/presentation-verifier.js';
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
export class PresentationRequestHandler
  implements Handler<PresentationRequestMessage>
{
  public readonly operation = MessageType.PRESENTATION_REQUEST;

  constructor(
    private readonly responderDid: string,
    private readonly reader: HfsReader,
    private readonly writer: HfsWriter,
    private readonly hcsMessenger: HcsMessenger,
    private readonly registry: CredentialRegistry,
    private readonly bbsBlsService: BbsBlsService,
    private readonly verifier: PresentationVerifier,
    private readonly encryption: HcsEncryption,
    protected readonly logger?: Logger
  ) {}

  async handle(message: DecodedMessage<PresentationRequestMessage>) {
    this.logger?.verbose(`Received "${this.operation}"`);

    const { recipient_did, request_file_id, request_id } =
      message.contents as PresentationRequestMessage;
    const challenge = message.consensusTimestamp.toString();

    // Is the message for this responder?
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

    // Fetch and decrypt the presentation
    this.logger?.verbose(`Fetch request file "${request_file_id}"`);
    const contents = await this.reader.readFileAsJson(request_file_id);

    let presentationRequest: PresentationRequest;
    this.logger?.verbose(`Decrypt request file "${request_file_id}"`);
    try {
      presentationRequest = await this.encryption.decrypt(contents);
      this.logger?.verbose(`Parse decrypted request file "${request_file_id}"`);
    } catch (err) {
      return this.sendErrorResponse({
        request_id,
        topicId: message.topicId,
        error: {
          code: 'FILE_DECRYPTION_FAILED',
          message: `Unable to decrypt the request file.`,
        },
      });
    }

    this.logger?.debug(presentationRequest);

    const { authorization_details, presentation_definition } =
      presentationRequest;

    if (!authorization_details?.did) {
      this.logger?.info(
        `Request authorization did not contain a did - ignoring request`
      );
      return;
    }

    const { verifiablePresentation } = authorization_details;

    if (verifiablePresentation.holder != authorization_details.did) {
      this.logger?.info(
        `Presentation holder "${verifiablePresentation.holder}" did not match request authorization DID "${authorization_details.did}"`
      );
      return this.sendErrorResponse({
        recipient_did: authorization_details.did,
        request_id,
        topicId: message.topicId,
        error: {
          code: 'AUTHORIZATION_MISMATCH',
          message: `Credential holder did not match authorization DID.`,
        },
      });
    }

    const descriptors = presentation_definition?.input_descriptors ?? [];

    let field: FieldV2 | undefined;

    descriptors.find((descriptor) => {
      field = descriptor?.constraints?.fields?.find(
        (field) => field.path && field.path[0] === '$.id'
      );
      return field;
    });

    const credentialId = field?.filter?.const as string;

    if (!credentialId) {
      return this.sendErrorResponse({
        recipient_did: authorization_details.did,
        request_id,
        topicId: message.topicId,
        error: {
          code: 'MISSING_CREDENTIAL_ID',
          message: `Unable to determine credential ID from request.`,
        },
      });
    }

    // Verify the presentation of the requester
    const verified = await this.verifier.verify(verifiablePresentation);
    if (!verified) {
      return this.sendErrorResponse({
        request_id,
        recipient_did: authorization_details.did,
        topicId: message.topicId,
        error: {
          code: 'INVALID_PRESENTATION',
          message: `Presentation could not be verified.`,
        },
      });
    }

    try {
      let credentialData: {
        credential: VerifiableCredential;
        guardian_id: string;
      };

      try {
        credentialData = await this.registry.fetchCredential(credentialId);
      } catch (err) {
        this.logger?.error(err);

        return this.sendErrorResponse({
          recipient_did: authorization_details.did,
          request_id,
          topicId: message.topicId,
          error: {
            code: 'CREDENTIAL_NOT_FOUND',
            message: `Unable to fetch the credential "${credentialId}". Request can not be handled`,
          },
        });
      }

      this.logger?.verbose('Check credential trust');
      const isTrusted = await this.verifier.isTrusted(
        credentialData.guardian_id,
        verifiablePresentation,
        credentialData.credential
      );
      if (!isTrusted) {
        return this.sendErrorResponse({
          request_id,
          recipient_did: authorization_details.did,
          topicId: message.topicId,
          error: {
            code: 'UNAUTHORIZED_REQUEST',
            message: `The submitted presentation is not authorized to disclose the requested credential.`,
          },
        });
      }

      this.logger?.verbose('Derive proof');

      const derivedProof = await this.bbsBlsService.createProof(
        credentialData.credential,
        presentation_definition
      );

      const signedPresentation = await this.bbsBlsService.preparePresentation(
        presentation_definition,
        derivedProof,
        challenge
      );

      this.logger?.verbose('Encrypt presentation');

      const encryptedResponse = await this.encryption.encrypt(
        signedPresentation,
        authorization_details.did
      );

      this.logger?.verbose('Write encrypted presentation to HFS');
      const fileId = await this.writer.writeFile(
        JSON.stringify(encryptedResponse)
      );

      if (!fileId) {
        throw new Error(
          'Writing file to HFS did not return a file id - can not respond'
        );
      }

      const response: PresentationResponseMessage = {
        operation: MessageType.PRESENTATION_RESPONSE,
        request_id,
        recipient_did: authorization_details.did,
        response_file_id: fileId.toString(),
      };

      this.logger?.verbose(`Sending response "${response.operation}"`);
      this.logger?.debug(response);

      await this.hcsMessenger.send({
        message: JSON.stringify(response),
        topicId: message.topicId,
      });

      this.logger?.info(`Processing "${this.operation}" complete`);
    } catch (err) {
      this.logger?.error(err);
      return this.sendErrorResponse({
        recipient_did: authorization_details.did,
        request_id,
        topicId: message.topicId,
        error: {
          code: 'UNKNOWN_ERROR',
          message: `There was an unexpected problem processing the request`,
        },
      });
    }
  }

  async sendErrorResponse({
    recipient_did,
    request_id,
    topicId,
    error,
  }: {
    recipient_did?: string;
    request_id: string;
    topicId: string;
    error: { code: string; message: string };
  }) {
    this.logger?.error(error.message);

    const response: PresentationResponseMessage = {
      operation: MessageType.PRESENTATION_RESPONSE,
      request_id,
      recipient_did,
      error,
    };

    await this.hcsMessenger.send({
      message: JSON.stringify(response),
      topicId,
    });
  }
}
