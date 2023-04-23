import { expect, test } from '@jest/globals';
import { TokenKind, Tokenizer as Tokenizer } from '../../src/engine/basic/basictokeniser';
import { BasicParser, EolOptions } from '../../src/engine/basic/basic';
import { parse } from 'path';
//import { test } from 'jest';

test("basic", () => {
  let tokenizer = Tokenizer.load('hello');
  let parser = new BasicParser(tokenizer, 0, EolOptions.WhiteSpace, TokenKind.Eof);
  parser.tryRead();
  expect(parser.token.value).toBe('hello');
  expect(parser.tryRead()).toBe(false);
});

test("sequence", () => {
  let tokenizer = Tokenizer.load('x + y = 11.2');
  let parser = new BasicParser(tokenizer, 0, EolOptions.WhiteSpace, TokenKind.Eof);

  parser.tryRead();
  expect(parser.token.value).toBe('x');
  expect(parser.token.value).toBe('+');
  expect(parser.token.value).toBe('y');
  expect(parser.token.value).toBe('=');
  expect(parser.token.value).toBe('11.2');
  expect(parser.tryRead()).toBe(false);
});
