import { expect, test } from '@jest/globals';
import { TokenKind, Tokenizer as Tokenizer } from '../../src/basic/basictokeniser';
import { parse } from 'path';
import { BasicParser, EolRule } from '../../src/basic/basicparser';
//import { test } from 'jest';

test("basic", () => {
  let tokenizer = Tokenizer.load('hello');
  let parser = new BasicParser(undefined, tokenizer, 0, { eolRule: EolRule.WhiteSpace, endTokens: [TokenKind.Eof] });
  expect(parser.read().value).toBe('hello');
  expect(parser.tryRead()).toBe(false);
});

test("sequence", () => {
  let tokenizer = Tokenizer.load('x + y = 11.2');
  let parser = new BasicParser(undefined, tokenizer, 0, { eolRule: EolRule.WhiteSpace, endTokens: [TokenKind.Eof] });

  expect(parser.read().value).toBe('x');
  expect(parser.read().value).toBe('+');
  expect(parser.read().value).toBe('y');
  expect(parser.read().value).toBe('=');
  expect(parser.read().value).toBe('11.2');
  expect(parser.tryRead()).toBe(false);
});
