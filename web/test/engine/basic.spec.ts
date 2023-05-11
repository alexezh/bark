import { expect, test } from '@jest/globals';
import { Tokenizer } from '../../src/basic/basictokeniser';
import { BasicParser, EndRule, EolRule } from '../../src/basic/basicparser';
import { parseModule } from '../../src/basic/basic';
import { AstNodeKind, ConstNode, ForNode, FuncDefNode, IfNode, ModuleNode } from '../../src/basic/ast';

function loadModule(text: string): ModuleNode {
  try {
    let tokenize = Tokenizer.load(text);
    let parser = new BasicParser(tokenize);
    let ast = parseModule(parser);
    return ast;
  }
  catch (e) {
    console.log(e);
    throw e;
  }
}
test("basic", () => {
  let ast = loadModule(`
proc foo()
begin
  var x := 3
  print \"hello world\" + x
end`);
  expect(ast.children.length).toBe(1);
  let func = ast.children[0] as FuncDefNode;
  expect(func.name.value).toBe('foo');
  if (!(func.body instanceof Function)) {
    expect(func.body.statements.length).toBe(2);
  }
});

test("for", () => {
  let ast = loadModule(`
proc foo()
begin
  for x := 1 to 5 by 4 do
    print \"hello world\" + x
  end
end`);
  let func = ast.children[0] as FuncDefNode;
  if (!(func.body instanceof Function)) {
    let fr = func.body.statements[0] as ForNode;

    expect(fr.kind).toBe(AstNodeKind.for);
    expect((fr.startExp.left as ConstNode).value.value).toBe('1');
    expect((fr.endExp.left as ConstNode).value.value).toBe('5');
  }
});

test("foreach", () => {
  let ast = loadModule(`
proc foo()
begin
  foreach x in bar do
    print \"hello world\" + x
  end
end`);
  let func = ast.children[0] as FuncDefNode;
  if (!(func.body instanceof Function)) {
    let fr = func.body.statements[0] as ForNode;

    expect(fr.kind).toBe(AstNodeKind.foreach);
  }
});

test("nestedblocks", () => {
  let ast = loadModule(`
proc foo()
begin
  var x := 1;
  var y := 2;
  var z := 0;

  if x = 1 then
    if y = 2 then
      z := 1;
    end
  else
    z := 2;
  end
  return z;
end`);
  let func = ast.children[0] as FuncDefNode;
  if (!(func.body instanceof Function)) {
    let if1 = func.body.statements[3] as IfNode;

    expect(if1.kind).toBe(AstNodeKind.if);
    let if2 = if1.th.statements[0] as IfNode;
    expect(if2.kind).toBe(AstNodeKind.if);
  }
});

test("calls", () => {
  let ast = loadModule(`
  proc seq() begin
    var bomb:= createSprite 'vox/bomb.vox'
    setPosition bomb randInt(50, 150) 50 randInt(50, 150)

    var speed:= 10;
    setSpeed bomb x:=0 y:=-speed z:=0
  end
`);
  let func = ast.children[0] as FuncDefNode;
  if (!(func.body instanceof Function)) {
    expect(func.body.statements.length).toBe(4);
  }
})

