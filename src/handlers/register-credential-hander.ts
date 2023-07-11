import { EncryptionKey } from '@meeco/cryppo';
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
    protected readonly passphraseEncryptionKey: EncryptionKey,
    protected readonly logger?: Logger
  ) {}

  async handle(message: DecodedMessage<RegisterCredentialMessage>) {
    this.logger?.verbose(`Received "${this.operation}"`);

    const { vc_id, encrypted_passphrase, ipfs_cid } = message.contents;
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

    try {
      await this.registry.registerCredential(
        message.contents,
        this.passphraseEncryptionKey
      );
    } catch (error) {
      this.logger?.error(error);
      this.logger?.error(
        `Credential registration failed from "${this.operation}" message`
      );
    }
  }
}
