import { Logger } from 'winston';
import { DecodedMessage } from '../hcs/decoded-message.js';
import { MessageType, RegisterCredentialMessage } from '../hcs/messages.js';
import { CredentialRegistry } from '../vc/credential-registry.js';
import { Handler } from './handler.js';

export class RegisterCredentialHandler
  implements Handler<RegisterCredentialMessage>
{
  public readonly operation = MessageType.REGISTER_CREDENTIAL;

  constructor(
    protected readonly registry: CredentialRegistry,
    protected readonly logger?: Logger
  ) {}

  async handle(message: DecodedMessage<RegisterCredentialMessage>) {
    this.logger?.verbose(`Received "${this.operation}"`);

    const { vc_id, encrypted_passphrase, ipfs_cid, guardian_id } =
      message.contents;
    if (!vc_id) {
      this.logger?.error(
        `Skipping credential due to missing parameter on "${this.operation}" message: vc_id`
      );
      return;
    }
    if (!encrypted_passphrase) {
      this.logger?.error(
        `Skipping credential due to missing parameter on "${this.operation}" message: encrypted_passphrase`
      );
      return;
    }
    if (!ipfs_cid) {
      this.logger?.error(
        `Skipping credential due to missing parameter on "${this.operation}" message: ipfs_cid`
      );
      return;
    }
    if (!guardian_id) {
      this.logger?.error(
        `Skipping credential due to missing parameter on "${this.operation}" message: guardian_id`
      );
      return;
    }

    try {
      await this.registry.registerCredential(message.contents);
    } catch (error) {
      this.logger?.error(error);
      this.logger?.error(
        `Credential registration failed from "${this.operation}" message`
      );
    }
  }
}
