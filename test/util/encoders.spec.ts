import { describe, expect, it } from '@jest/globals';
import {
  decodeBase64Json,
  decodeBase64String,
  jsonToBase64,
  stringToBase64,
} from '../../src/util/encoders.js';

describe('encoders', () => {
  describe('jsonToBase64', () => {
    it('encodes a JSON object to base64', () => {
      const obj = { name: 'John Doe', age: 25 };
      const expected = 'eyJuYW1lIjoiSm9obiBEb2UiLCJhZ2UiOjI1fQ==';
      const result = jsonToBase64(obj);
      expect(result).toBe(expected);
    });
  });

  describe('stringToBase64', () => {
    it('encodes a string to base64', () => {
      const str = 'Hello, World!';
      const expected = 'SGVsbG8sIFdvcmxkIQ==';
      const result = stringToBase64(str);
      expect(result).toBe(expected);
    });
  });

  describe('decodeBase64String', () => {
    it('decodes a base64 string to its original value', () => {
      const base64String = 'SGVsbG8sIFdvcmxkIQ==';
      const expected = 'Hello, World!';
      const result = decodeBase64String(base64String);
      expect(result).toBe(expected);
    });
  });

  describe('decodeBase64Json', () => {
    it('decodes a base64 string to its original value', () => {
      const base64String = 'eyJuYW1lIjoiSm9obiBEb2UiLCJhZ2UiOjI1fQ==';
      const expected = { name: 'John Doe', age: 25 };
      const result = decodeBase64Json(base64String);
      expect(result).toEqual(expected);
    });
  });
});
