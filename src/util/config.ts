export interface EnvironmentConfig {
  responder: ResponderConfig;
  guardians: GuardianConfig[];
}

export interface GuardianConfig {
  id: string;
  passphrase_encryption_key: string;
  topic_ids: string[];
  trusted_issuers: TrustedIssuer[];
}

export interface TrustedIssuer {
  did: string;
  credential_types: string[];
}

export interface KeyConfig {
  key_id: string;
  type: string;
  public_key_hex: string;
  private_key_hex: string;
}

export interface ResponderConfig {
  did: string;
  edsa_key_config: KeyConfig;
  payer_account_id: string;
  payer_account_private_key: string;
  payer_account_public_key: string;
  hedera_encryption_private_key_hex: string;
  topic_ids: string[];
  log_level: string;
}
