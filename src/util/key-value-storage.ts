import { RootDatabase, open } from 'lmdb';

export abstract class KeyValueStorage {
  abstract write(key: string, value: any): Promise<any>;
  abstract read(key: string): Promise<any>;
}

export class LmdbStorage implements KeyValueStorage {
  db: RootDatabase;

  constructor() {
    this.db = open({
      path: '_data',
      compression: true,
    });
  }

  async write(key: string, value: any) {
    return this.db.put(key, value);
  }

  async read(key: string) {
    return this.db.get(key);
  }
}
