export interface EnvironmentConfig {
  responder: ResponderConfig;
  guardians: GuardianConfig[];
}

export interface GuardianConfig {
  id: string;
  master_passphrase: string;
  topic_ids: string[];
  trusted_issuers: TrustedIssuer[];
}

export interface TrustedIssuer {
  did: string;
  credential_types: string[];
}

export interface ResponderConfig {
  did: string;
  did_key_id: string;
  did_public_key_hex: string;
  did_private_key_hex: string;
  payer_account_id: string;
  payer_account_private_key: string;
  hedera_encryption_private_key_hex: string;
  topic_ids: string[];
  log_level: string;
}
