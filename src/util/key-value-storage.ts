import { RootDatabase, open } from 'lmdb';

export abstract class KeyValueStorage {
  abstract write(key: string, value: any): Promise<any>;
  abstract read<T = any>(key: string): Promise<T>;
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
