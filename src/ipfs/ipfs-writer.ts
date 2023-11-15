import { Readable } from 'stream';
import { Web3Storage } from 'web3.storage';

/**
 * Write files to IPFS
 */
export class IpfsWriter {
  constructor(private readonly web3StorageToken: string) {}

  public async writeFile({
    contents,
    name,
  }: {
    contents: string;
    name: string;
  }) {
    const client = new Web3Storage({ token: this.web3StorageToken });
    const rootCid = await client.put([
      {
        name,
        stream() {
          return Readable.from(
            Buffer.from(contents, 'utf-8')
          ) as any as ReadableStream;
        },
      },
    ] satisfies { name: string; stream: () => ReadableStream }[]);
    const cid = `${rootCid}/${name}`;

    return cid;
  }
}
