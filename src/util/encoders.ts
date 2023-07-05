export const jsonToBase64 = (value: any): string =>
  Buffer.from(JSON.stringify(value)).toString('base64');

export const stringToBase64 = (value: string): string =>
  Buffer.from(value, 'utf-8').toString('base64');

export const decodeBase64String = (value: string | Uint8Array): string =>
  Buffer.from(value as any, 'base64').toString('utf-8');

export const decodeBase64Json = (value: string | Uint8Array): any =>
  JSON.parse(Buffer.from(value as any, 'base64').toString('utf-8'));
