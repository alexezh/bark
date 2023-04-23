import { expect, test } from '@jest/globals';
import { TokenKind, Tokenizer } from '../../src/engine/basic/basictokeniser';
import { BasicParser, EolRule } from '../../src/engine/basic/basicparser';
import { parseModule } from '../../src/engine/basic/basic';
//import { test } from 'jest';

test("basic", () => {
  let tokenize = Tokenizer.load(`
proc foo()
begin
  var x := 3
  print \"hello world\" + x
end prod`);
  let parser = new BasicParser(undefined, tokenize, 0, { eolRule: EolRule.WhiteSpace, endTokens: [TokenKind.Eof] });
  let ast = parseModule(parser);
  expect(ast.children.length).toBe(3);
});

