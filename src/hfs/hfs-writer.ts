import {
  Client,
  FileCreateTransaction,
  Hbar,
  PrivateKey,
  PublicKey,
} from '@hashgraph/sdk';
import { Logger } from 'winston';

/**
 * Write files to HFS
 */
export class HfsWriter {
  constructor(
    private readonly writePublicKey: PublicKey,
    private readonly writePrivateKey: PrivateKey,
    private readonly client: Client,
    private readonly logger?: Logger,
    private readonly maxWriteHbar = 5
  ) {}

  public async writeFile(contents: string | Uint8Array) {
    const transaction = new FileCreateTransaction()
      .setKeys([this.writePublicKey])
      .setContents(contents)
      .setMaxTransactionFee(new Hbar(this.maxWriteHbar))
      .freezeWith(this.client);

    const signed = await transaction.sign(this.writePrivateKey);
    const txId = await signed.execute(this.client);
    const receipt = await txId.getReceipt(this.client);
    const fileId = receipt?.fileId;

    this.logger?.info(`Wrote file ${fileId}`);

    return fileId;
  }
}
