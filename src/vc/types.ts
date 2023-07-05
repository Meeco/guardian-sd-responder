// Types copied from paths not exported by transmute/vc:

// DocumentLoader from '@transmute/vc.js/dist/types/DocumentLoader.js';
// VerifiableCredential from '@transmute/vc.js/dist/types/VerifiableCredential.js';
// VerifiablePresentation from '@transmute/vc.js/dist/types/VerifiablePresentation.js';

export interface LinkedDataDocument {
  '@context': any;
}

export declare type Type = string | string[];

declare type HolderId = string;
interface HolderNode {
  id: string;
  [x: string]: any;
}
export declare type Holder = HolderId | HolderNode;
declare type IssuerId = string;
interface IssuerNode {
  id: string;
  [x: string]: any;
}
export declare type Issuer = IssuerId | IssuerNode;

export declare type DocumentLoader = (iri: string) => Promise<{
  documentUrl?: string;
  document: any;
}>;

export interface VerifiablePresentation extends LinkedDataDocument {
  type: Type;
  holder?: Holder;
  verifiableCredential?: any;
  proof?: any;
  [x: string]: any;
}

export interface VerifiableCredential extends LinkedDataDocument {
  issuer: Issuer;
  type: Type;
  issuanceDate: string;
  proof?: any;
  [x: string]: any;
}
