import { expect, test } from '@jest/globals';
import { TokenKind, Tokenizer } from '../../src/engine/basic/basictokeniser';
import { BasicParser, EolRule } from '../../src/engine/basic/basicparser';
import { parseModule } from '../../src/engine/basic/basic';
import { AstNodeKind, ConstNode, ForNode, FuncDefNode } from '../../src/engine/basic/ast';
import { Transpiler } from '../../src/engine/basic/basictranspiler';

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
