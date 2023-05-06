import { expect, test } from '@jest/globals';
import { TokenKind, Tokenizer } from '../../src/basic/basictokeniser';
import { BasicParser, EndRule, EolRule } from '../../src/basic/basicparser';
import { parseModule } from '../../src/basic/basic';
import { AstNodeKind, ConstNode, ForNode, FuncDefNode } from '../../src/basic/ast';

test("basic", () => {
  let tokenize = Tokenizer.load(`
proc foo()
begin
  var x := 3
  print \"hello world\" + x
end`);
  let parser = new BasicParser(tokenize);
  let ast = parseModule(parser);
  expect(ast.children.length).toBe(1);
  let func = ast.children[0] as FuncDefNode;
  expect(func.name.value).toBe('foo');
  expect(func.body.children.length).toBe(2);
});

test("for", () => {
  let tokenize = Tokenizer.load(`
proc foo()
begin
  for x := 1 to 5 by 4 do
    print \"hello world\" + x
  end
end`);
  let parser = new BasicParser(tokenize);
  let ast = parseModule(parser);
  let func = ast.children[0] as FuncDefNode;
  let fr = func.body.children[0] as ForNode;

  expect(fr.kind).toBe(AstNodeKind.for);
  expect((fr.startExp.left as ConstNode).value.value).toBe('1');
  expect((fr.endExp.left as ConstNode).value.value).toBe('5');
});

