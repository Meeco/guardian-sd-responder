import { jest } from '@jest/globals';

jest.clearAllMocks();

// Not exactly sure how to import this in ESM-land
type JestFn = ReturnType<typeof jest.fn>;

export type SpyObject<T> = T & {
  [key in keyof T]: JestFn;
};

/**
 * Util to create an object that will respond to any getter with a jest spy by
 * default (unless the value has manually been set already)
 *
 * https://medium.com/nextfaze/proxy-objects-for-quick-and-dirty-service-mocks-in-jest-975c69a83809
 */
export function createSpyObject<T = any>() {
  return new Proxy(
    { proxies: {} },
    {
      get(target: any, name: string) {
        target.proxies ??= {};
        target.proxies[name] ??= jest.fn();
        return target.proxies[name];
      },
      set(target: any, key: string, value: any) {
        target.proxies[key] = value;
        return true;
      },
    }
  ) as any as SpyObject<T>;
}
