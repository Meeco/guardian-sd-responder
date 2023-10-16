import { promiseWithTimeout } from './promise-with-timeout.js';

export async function fetchWithRetry({
  url,
  retry,
  retryCount,
}: {
  url: string;
  retry: number;
  retryCount?: number;
}): Promise<any> {
  try {
    const result = await promiseWithTimeout({
      promise: fetch(url),
      time: 1000,
    });

    if (result.ok) {
      return result;
    }

    const count = retryCount || 0;
    if (count <= retry - 1) {
      return fetchWithRetry({ url, retry, retryCount: count + 1 });
    } else {
      throw new Error(
        `Could not fetch "${url}" - status was "${result.status}"`
      );
    }
  } catch (error) {
    const count = retryCount || 0;
    if (count <= retry - 1) {
      return fetchWithRetry({ url, retry, retryCount: count + 1 });
    } else {
      console.log(error);
      throw new Error(`Could not fetch from "${url}"`);
    }
  }
}
