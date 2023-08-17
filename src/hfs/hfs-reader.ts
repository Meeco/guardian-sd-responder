import { Client, FileContentsQuery } from '@hashgraph/sdk';

/**
 * Read files from HFS in various formats
 */
export class HfsReader {
  constructor(private readonly client: Client) {}

  async readFileAsJson(fileId: string) {
    const contents = await this.readFileAsText(fileId);
    return JSON.parse(contents);
  }

  async readFileAsText(fileId: string) {
    const contents = await this.readFile(fileId);
    return Buffer.from(contents).toString('utf-8');
  }

  public readFile(fileId: string) {
    return new FileContentsQuery()
      .setFileId(fileId)
      .setMaxAttempts(2)
      .execute(this.client);
  }
}
