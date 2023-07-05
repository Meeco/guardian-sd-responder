import { fetchJson } from '../util/fetch-json.js';

const RESOLVER_HOST = `http://localhost:5000`;

/**
 * Placeholder did resolver.
 * Assumes a universal did resolver running at localhost:5000
 */
export const resolveDidDocument = (did: string) =>
  fetchJson(`${RESOLVER_HOST}/1.0/identifiers/${did}`);
