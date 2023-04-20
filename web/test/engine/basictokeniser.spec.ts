import { expect, test } from '@jest/globals';
import { Tokeniser as Tokenizer } from '../../src/engine/basictokeniser';
//import { test } from 'jest';

test("basic", () => {
  let tokenizer = new Tokenizer('hello');
  let token = tokenizer.read();
  expect(token.value).toBe('hello');
  expect(tokenizer.hasToken()).toBe(false);
});

test("sequence", () => {
  let tokenizer = new Tokenizer('x + y = 11.2');
  expect(tokenizer.read().value).toBe('x');
  expect(tokenizer.read().value).toBe('+');
  expect(tokenizer.read().value).toBe('y');
  expect(tokenizer.read().value).toBe('=');
  expect(tokenizer.read().value).toBe('11.2');
  expect(tokenizer.hasToken()).toBe(false);
});
