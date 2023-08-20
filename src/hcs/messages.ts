export enum MessageType {
  PRESENTATION_QUERY = 'presentation-query',
  QUERY_RESPONSE = 'query-response',
  PRESENTATION_REQUEST = 'presentation-request',
  PRESENTATION_RESPONSE = 'presentation-response',
  REGISTER_CREDENTIAL = 'register-credential',
}

/**
 * A message from a verifier to identify a responder that can fulfil to the given request
 */
export interface PresentationQueryMessage {
  operation: MessageType.PRESENTATION_QUERY;
  request_id: string;
  vc_id: string;
  requester_did: string;
  limit_hbar: number;
}

/**
 * A message from a PEx responder to identify themselves as responder able to fulfil the request
 */
export interface QueryResponseMessage {
  operation: MessageType.QUERY_RESPONSE;
  request_id: string;
  responder_did: string;
  response_ephem_public_key: string; // base64 encoded
  offer_hbar: number;
}

/**
 * A message from a verifier to a responder requesting a presentation
 */
export interface PresentationRequestMessage {
  operation: MessageType.PRESENTATION_REQUEST;
  request_id: string;
  recipient_did: string;
  request_file_id: string;
  request_file_nonce: string; // base64 encoded
  request_ephem_public_key: string; // base64 encoded
  version: string;
}

type SuccessResponse = {
  operation: MessageType.PRESENTATION_RESPONSE;
  request_id: string;
  recipient_did: string;
  response_file_id: string;
  response_file_nonce: string;
  response_ephem_public_key: string; // base64 encoded
};

type ErrorResponse = {
  operation: MessageType.PRESENTATION_RESPONSE;
  request_id: string;
  error: {
    code: string;
    message: string;
  };
};

/**
 * A message from a PEx responder to a verifier fulfilling a presentation request
 */
export type PresentationResponseMessage = SuccessResponse | ErrorResponse;

export interface RegisterCredentialMessage {
  operation: MessageType.REGISTER_CREDENTIAL;
  vc_id: string;
  ipfs_cid: string;
  encrypted_passphrase: string;
}
