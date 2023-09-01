import { fetchJson } from '../util/fetch-json.js';

const HEDERA_RESOLVER_HOST =
  process.env.HEDERA_RESOLVER_HOST ?? `http://localhost:5000/1.0/identifiers`;

/**
 * Placeholder did resolver.
 * Since universal resolvers don't yet typically support Hedera DIDs, assumes a
 * universal did resolver running at localhost:5000 that will resolve Hedera DIDs and other DIDs
 */
export const resolveDidDocument = (did: string) =>
  fetchJson(`${HEDERA_RESOLVER_HOST}/${did}`);
