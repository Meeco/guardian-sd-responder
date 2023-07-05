import { FileContentsQuery } from '@hashgraph/sdk';
import { describe, expect, it, jest } from '@jest/globals';
import { HfsReader } from '../../src/hfs/hfs-reader.js';

describe('HfsReader', () => {
  const client = {} as any;
  const reader = new HfsReader(client);

  it('reads a file as text', async () => {
    const fileId = '0.0.123';
    const mockQuery = jest
      .fn<any>()
      .mockResolvedValue(Buffer.from('file contents'));

    const setFileId = jest.spyOn(FileContentsQuery.prototype, 'setFileId');
    const setMaxAttempts = jest.spyOn(
      FileContentsQuery.prototype,
      'setMaxAttempts'
    );
    jest
      .spyOn(FileContentsQuery.prototype, 'execute')
      .mockImplementation(mockQuery);

    const result = await reader.readFileAsText(fileId);

    expect(setFileId).toHaveBeenCalledWith('0.0.123');
    expect(setMaxAttempts).toHaveBeenCalledWith(2);

    expect(mockQuery).toHaveBeenCalledWith(client);
    expect(result).toEqual('file contents');
  });

  it('reads a file as json', async () => {
    const fileId = '0.0.123';
    const json = { hello: 'world' };
    const mockQuery = jest
      .fn<any>()
      .mockResolvedValue(Buffer.from(JSON.stringify(json)));

    const setFileId = jest.spyOn(FileContentsQuery.prototype, 'setFileId');
    const setMaxAttempts = jest.spyOn(
      FileContentsQuery.prototype,
      'setMaxAttempts'
    );
    jest
      .spyOn(FileContentsQuery.prototype, 'execute')
      .mockImplementation(mockQuery);

    const result = await reader.readFileAsJson(fileId);

    expect(setFileId).toHaveBeenCalledWith('0.0.123');
    expect(setMaxAttempts).toHaveBeenCalledWith(2);

    expect(mockQuery).toHaveBeenCalledWith(client);
    expect(result).toEqual(json);
  });
});
