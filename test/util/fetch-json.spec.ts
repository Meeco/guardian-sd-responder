import { describe, expect, it, jest } from '@jest/globals';
import { fetchJson } from '../../src/util/fetch-json.js';

describe('fetchJson', () => {
  it('fetches json data', async () => {
    const json = () => ({
      key: 'value',
    });

    jest.spyOn(global, 'fetch').mockImplementation(async () => {
      return { json, status: 200, ok: true } as any;
    });

    const response = await fetchJson({ url: 'https://example.com/json' });
    expect(response).toEqual({
      key: 'value',
    });
  });

  it('should retry to call fetchJson', async () => {
    const json = () => ({
      key: 'value',
    });

    jest
      .spyOn(global, 'fetch')
      .mockImplementationOnce(() => Promise.reject({ ok: false }))
      .mockImplementationOnce(() => Promise.reject({ ok: false }))
      .mockImplementationOnce(() => {
        return { json, status: 200, ok: true } as any;
      }) as unknown as jest.Mock;

    const response = await fetchJson({
      url: 'https://example.com/json',
      retry: 3,
    });
    expect(response).toEqual({
      key: 'value',
    });
  });
});
