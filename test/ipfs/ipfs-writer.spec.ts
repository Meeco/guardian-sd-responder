import { describe, expect, it, jest } from '@jest/globals';
import { Web3Storage } from 'web3.storage';
import { IpfsWriter } from '../../src/ipfs/ipfs-writer.js';

describe('IpfsWriter', () => {
  const web3StorageToken = 'abc123';
  const writer = new IpfsWriter(web3StorageToken);

  it('should return file cid', async () => {
    const rootCid = '456xyz';
    const name = 'did-document.json';

    jest.spyOn(Web3Storage, 'put').mockResolvedValue(rootCid);

    const fileCid = await writer.writeFile({
      contents: web3StorageToken,
      fileName: name,
    });
    expect(fileCid).toBe(`${rootCid}/${name}`);
  });
});
