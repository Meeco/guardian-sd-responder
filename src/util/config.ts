export interface EnvironmentConfig {
  responder: ResponderConfig;
  guardians: GuardianConfig[];
}

export interface GuardianConfig {
  id: string;
  passphrase_encryption_key: string;
  topic_ids: string[];
  issued_credentials: IssuedCredential[];
}

export interface IssuedCredential {
  credential_type: string;
  accepted_authorization_credentials: AuthorizedCredential[];
}

export interface AuthorizedCredential {
  credential_type: string;
  accepted_issuer_dids: string[];
}

export interface KeyConfig {
  id: string;
  type: string;
  public_key_hex: string;
  private_key_hex: string;
}

export type HederaNetwork = 'testnet' | 'previewnet' | 'mainnet';

export interface ResponderConfig {
  did: string;
  hedera_network: HederaNetwork;
  edsa_key_config: KeyConfig;
  payer_account_id: string;
  payer_account_private_key: string;
  payer_account_public_key: string;
  hedera_encryption_private_key_hex: string;
  topic_ids: string[];
  log_level: string;
}
