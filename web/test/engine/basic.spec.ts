import { expect, test } from '@jest/globals';
import { BasicParser, EolOptions, parseModule } from '../../src/engine/basic/basic';
import { TokenKind, Tokenizer } from '../../src/engine/basic/basictokeniser';
//import { test } from 'jest';

test("basic", () => {
  let tokenize = Tokenizer.load(`
proc foo()
begin
  var x := 3
  print \"hello world\" + x
end prod`);
  let parser = new BasicParser(tokenize, 0, EolOptions.WhiteSpace, TokenKind.Eof);
  let ast = parseModule(parser);
  expect(ast.children.length).toBe(3);
});

