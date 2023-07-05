import {
  FileCreateTransaction,
  Hbar,
  PrivateKey,
  PublicKey,
} from '@hashgraph/sdk';
import { describe, expect, it, jest } from '@jest/globals';
import { HfsWriter } from '../../src/hfs/hfs-writer.js';

describe('HfsWriter', () => {
  const client = {} as any;
  const publicKey = PublicKey.fromString(
    '0000000000000000000000000000000000000000000000000000000000000000'
  );
  const privateKey = PrivateKey.fromString(
    '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
  );

  const reader = new HfsWriter(publicKey, privateKey, client, undefined, 5);

  it('writes a file using a signed transaction', async () => {
    const fileId = '0.0.123';
    const mockWrite = jest.fn<any>().mockResolvedValue({
      getReceipt: jest.fn<any>().mockResolvedValue({
        fileId,
      }),
    });

    const setKeys = jest.spyOn(FileCreateTransaction.prototype, 'setKeys');
    const setContents = jest.spyOn(
      FileCreateTransaction.prototype,
      'setContents'
    );
    const setMaxTransactionFee = jest.spyOn(
      FileCreateTransaction.prototype,
      'setMaxTransactionFee'
    );
    const freezeWith = jest
      .spyOn(FileCreateTransaction.prototype, 'freezeWith')
      .mockReturnThis();

    const sign = jest
      .spyOn(FileCreateTransaction.prototype, 'sign')
      .mockReturnThis();

    jest
      .spyOn(FileCreateTransaction.prototype, 'execute')
      .mockImplementation(mockWrite);

    const result = await reader.writeFile('Hello, World');

    expect(setKeys).toHaveBeenCalledWith([publicKey]);
    expect(setContents).toHaveBeenCalledWith('Hello, World');
    expect(setMaxTransactionFee).toHaveBeenCalledWith(new Hbar(5));
    expect(freezeWith).toHaveBeenCalledWith(client);

    expect(sign).toHaveBeenCalledWith(privateKey);

    expect(mockWrite).toHaveBeenCalledWith(client);
    expect(result).toEqual('0.0.123');
  });
});
