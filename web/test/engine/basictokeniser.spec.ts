import { expect, test } from '@jest/globals';
import { Tokenizer as Tokenizer } from '../../src/basic/basictokeniser';
import { BasicParser, EolRule } from '../../src/basic/basicparser';
//import { test } from 'jest';

test("basic", () => {
  let tokenizer = Tokenizer.load('hello');
  let parser = new BasicParser(tokenizer);
  expect(parser.read().value).toBe('hello');
  expect(parser.tryRead()).toBe(false);
});

test("sequence", () => {
  let tokenizer = Tokenizer.load('x + y = 11.2');
  let parser = new BasicParser(tokenizer);

  expect(parser.read().value).toBe('x');
  expect(parser.read().value).toBe('+');
  expect(parser.read().value).toBe('y');
  expect(parser.read().value).toBe('=');
  expect(parser.read().value).toBe('11.2');
  expect(parser.tryRead()).toBe(false);
});
