import { expect, test } from '@jest/globals';
import { TokenKind, Tokenizer } from '../../src/engine/basic/basictokeniser';
import { BasicParser, EolRule } from '../../src/engine/basic/basicparser';
import { parseModule } from '../../src/engine/basic/basic';
import exp from 'constants';
import { FuncDefNode } from '../../src/engine/basic/ast';
//import { test } from 'jest';

test("basic", () => {
  let tokenize = Tokenizer.load(`
proc foo()
begin
  var x := 3
  print \"hello world\" + x
end`);
  let parser = new BasicParser(undefined, tokenize, 0, { eolRule: EolRule.WhiteSpace, endTokens: [TokenKind.Eof] });
  let ast = parseModule(parser);
  expect(ast.children.length).toBe(1);
  let func = ast.children[0] as FuncDefNode;
  expect(func.name.value).toBe('foo');
  expect(func.body.length).toBe(2);
});

test("for", () => {
  let tokenize = Tokenizer.load(`
proc foo()
begin
  for x := 1 to 5 by 4 do
    print \"hello world\" + x
  end
end`);
  let parser = new BasicParser(undefined, tokenize, 0, { eolRule: EolRule.WhiteSpace, endTokens: [TokenKind.Eof] });
  let ast = parseModule(parser);
  let func = ast.children[0] as FuncDefNode;
  expect(func.name.value).toBe('foo');
  expect(func.body.length).toBe(2);
});

