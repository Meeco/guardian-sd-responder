import { describe, expect, it, jest } from '@jest/globals';
import { promiseWithTimeout } from '../../src/util/promise-with-timeout.js';

describe('promiseWithTimeout', () => {
  it('should resolve promise', async () => {
    const promise = jest.fn().mockImplementation(() => {
      return new Promise((resolve) => resolve(true));
    }) as any;
    const res = await promiseWithTimeout({ promise: promise(), time: 1000 });
    expect(res).toBe(true);
  });

  it('should reject error if timeout', async () => {
    const promise = jest.fn().mockImplementation(() => {
      return new Promise((resolve) => setTimeout(resolve, 2000, true));
    }) as any;

    try {
      await promiseWithTimeout({ promise: promise(), time: 1000 });
    } catch (error) {
      expect((error as any).message).toBe('Promise timed out');
    }
  });
});
