import { expect, test } from '@jest/globals';
import { TokenKind, Tokenizer } from '../../src/basic/basictokeniser';
import { BasicParser, EolRule } from '../../src/basic/basicparser';
import { parseModule } from '../../src/basic/basic';
import { AstNodeKind, ConstNode, ForNode, FuncDefNode } from '../../src/basic/ast';
import { Transpiler } from '../../src/basic/basictranspiler';

test("basic", () => {
  let tokenize = Tokenizer.load(`
proc foo()
begin
  var x := 3
  return x + 2
end`);
  let parser = new BasicParser(undefined, tokenize, 0, { eolRule: EolRule.WhiteSpace, endTokens: [TokenKind.Eof] });
  let ast = parseModule(parser);
  let trans = new Transpiler();
  let js = trans.generate(ast, 'foo');

  expect(eval(js)).toBe(5);
});

test("for_if", () => {
  let tokenize = Tokenizer.load(`
proc foo()
begin
  var x := 0
  for y := 0 to 3 by 1 do
    if y = 0 then
      x := 1;
    elif x < 2 then
      x := x + 2
    else 
      x := x + 3
    end
  end
  return x
end`);
  let parser = new BasicParser(undefined, tokenize, 0, { eolRule: EolRule.WhiteSpace, endTokens: [TokenKind.Eof] });
  let ast = parseModule(parser);
  let trans = new Transpiler();
  let js = trans.generate(ast, 'foo');

  let val = eval(js);
  expect(eval(js)).toBe(6);
});
