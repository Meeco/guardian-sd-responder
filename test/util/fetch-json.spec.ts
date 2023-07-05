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

    const response = await fetchJson('https://example.com/json');
    expect(response).toEqual({
      key: 'value',
    });
  });
});
