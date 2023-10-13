import { fetchWithRetry } from './fetch-with-retry.js';
import { log } from './logger.js';

/**
 * Perform a simple http fetch of JSON data - assumes we have global fetch
 * (requires node > 18)
 */
export async function fetchJson({
  url,
  retry,
}: {
  url: string;
  retry?: number;
}) {
  const fetchFunction = retry ? fetchWithRetry({ url, retry }) : fetch(url);
  return fetchFunction
    .then(async (result) => {
      if (result.ok) {
        return await result.json();
      }

      throw new Error(
        `Could not fetch "${url}" - status was "${result.status}"`
      );
    })
    .catch((err) => {
      log.error(err);
      throw new Error(`Could not fetch from "${url}"`);
    });
}
