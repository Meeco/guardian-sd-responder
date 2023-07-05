import { log } from './logger.js';

/**
 * Perform a simple http fetch of JSON data - assumes we have global fetch
 * (requires node > 18)
 */
export async function fetchJson<T = any>(url: string) {
  return fetch(url, {
    headers: {
      accept: 'application/json',
    },
  })
    .then((result) => {
      if (result.ok) {
        return result.json() as Promise<T>;
      }

      throw new Error(`Could not fetch ${url} - status was "${result.status}"`);
    })
    .catch((err) => {
      log.error(err);
      throw new Error(`Could not fetch ${url}`);
    });
}
