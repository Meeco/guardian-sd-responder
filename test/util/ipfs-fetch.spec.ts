import { describe, expect, it, jest } from '@jest/globals';
import {
  CLOUDFLARE_IPFS_PROXY,
  ResultType,
  fetchIPFSFile,
} from '../../src/util/ipfs-fetch.js';

describe('fetchIPFSFile', () => {
  it('fetches an IPFS file as text by default', async () => {
    const text = () => `Hello, World`;
    let url = '';

    jest.spyOn(global, 'fetch').mockImplementation(async (...args) => {
      [url] = args as any[];
      return { text, status: 200, ok: true } as any;
    });

    const response = await fetchIPFSFile('EXAMPLECID');

    expect(response).toEqual(`Hello, World`);
    expect(url).toEqual(`https://ipfs.io/ipfs/EXAMPLECID`);
  });

  it('fetches an IPFS file as json', async () => {
    const json = () => ({ message: `Hello, World` });

    jest.spyOn(global, 'fetch').mockImplementation(async () => {
      return { json, status: 200, ok: true } as any;
    });

    const response = await fetchIPFSFile('EXAMPLECID', {
      resultType: ResultType.JSON,
    });

    expect(response).toEqual({ message: `Hello, World` });
  });

  it('fetches an IPFS file as binary', async () => {
    const buff = new ArrayBuffer(1);
    const arrayBuffer = () => buff;

    jest.spyOn(global, 'fetch').mockImplementation(async () => {
      return { arrayBuffer, status: 200, ok: true } as any;
    });

    const response = await fetchIPFSFile('EXAMPLECID', {
      resultType: ResultType.ARRAY_BUFFER,
    });

    expect(response).toEqual(buff);
  });

  it('allows overriding the proxy', async () => {
    const text = () => `Hello, World`;
    let url = '';

    jest.spyOn(global, 'fetch').mockImplementation(async (...args) => {
      [url] = args as any[];
      return { text, status: 200, ok: true } as any;
    });

    const response = await fetchIPFSFile('EXAMPLECID', {
      httpProxy: CLOUDFLARE_IPFS_PROXY,
    });

    expect(response).toEqual(`Hello, World`);
    expect(url).toEqual(`https://cloudflare-ipfs.com/ipfs/EXAMPLECID`);
  });
});
