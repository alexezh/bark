import { expect, test } from '@jest/globals';
import { BasicLexer } from '../../src/basic/lexer';
import { BasicParser, EolRule } from '../../src/basic/basicparser';
import { parseModule } from '../../src/basic/basic';
import { ParseError } from '../../src/basic/parseerror';
import { validateModule } from '../../src/basic/checker';
import { transpile } from '../../src/basic/basictranspiler';
import { ICodeLoader, setVM, vm } from '../../src/engine/ivm';
import { CodeLoader } from '../../src/basic/codeloader';
import { CodeRunner } from '../../src/basic/coderunner';
import { AstNodeKind, FuncDefNode, ModuleNode, TypeDefNode } from '../../src/basic/ast';
import { addSystemFunc } from '../../src/basic/systemfunc';


async function waitCollideMock(): Promise<number> {
  return 42;
}

function createSpriteMock() {
}

function sendMessageMock(address: string, msg: any) {
  vm.sendMesssage(address, msg);
}

function minMock(v1: number, v2: number): number {
  return (v1 > v2) ? v2 : v1;
}

function createSystemModule(): ModuleNode {
  let funcs: FuncDefNode[] = [];
  let types: TypeDefNode[] = [];

  let module: ModuleNode = {
    kind: AstNodeKind.module,
    name: 'System',
    types: types,
    procs: funcs,
    on: []
  }

  funcs.push(addSystemFunc(module, 'waitCollide', ['sprite: Sprite', 'timeout: number'], 'Sprite | Block | null', true, waitCollideMock));
  funcs.push(addSystemFunc(module, 'sendMessage', ['address: string', 'text: string'], 'void', true, sendMessageMock));
  funcs.push(addSystemFunc(module, 'createSprite', ['name: string'], 'void', false, createSpriteMock));
  funcs.push(addSystemFunc(module, 'min', ['v1: number', 'v2: number'], 'number', false, minMock));

  return module;
}

function runProg(text: string, loader: ICodeLoader | undefined = undefined): any {
  try {
    if (loader === undefined) {
      loader = new CodeLoader();
    }
    loader.addSystemModule('System', createSystemModule());

    let runner = new CodeRunner();

    let tokenize = BasicLexer.load(text);
    let parser = new BasicParser(tokenize);
    let ast = parseModule(parser);
    loader.addUserModule('default', ast);
    validateModule(ast, loader);
    let js = transpile('foo', loader);

    let val = js(loader);
    return val;
  }
  catch (e) {
    if (e instanceof ParseError) {
      console.log(e.msg);
    } else {
      console.log(e);
    }
    throw e;
  }
}

async function runVm(text: string, address: string) {
  try {
    let runner = new CodeRunner();
    let loader = new CodeLoader();
    loader.addSystemModule('System', createSystemModule());

    // game loader has similar API as VM; use them directly
    setVM(runner as any);

    let promise = new Promise((resolve) => {
      vm.onMessage(address, async (msg: any) => {
        resolve(msg);
      });
    });

    loader.addUserModule('default', text);
    await runner.load(loader);

    await runner.start();

    return await promise;
  }
  catch (e) {
    if (e instanceof ParseError) {
      console.log(e.msg);
    } else {
      console.log(e);
    }
    throw e;
  }
}

test("basic", () => {
  let res = runProg(`
proc foo()
begin
  var x := 3
  return x + 2
end`);

  expect(res).toBe(5);
});

test("for_if", () => {
  let res = runProg(`
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

  expect(res).toBe(6);
});

test("while_break", () => {
  let res = runProg(`
proc foo()
begin
  var x := 0
  while true do
    x := x + 3
    break
  end
  return x
end`);

  expect(res).toBe(3);
});

test("if_or", () => {
  let res = runProg(`
proc foo()
begin
  var x := 0
  if x = 0 or x = 1 then
    x := 1
  end
  return x
end`);

  expect(res).toBe(1);
});

test('multipleparams', () => {
  let res = runProg(`

  proc bar(val: number, val2: number): number
  begin
    return val + val2
  end

  proc foo(val: number): number
  begin
    return bar 1+1 10
  end
`)
  expect(res).toBe(12);
});

test('nestedcalls', () => {
  let res = runProg(`

  proc bar(val: number, val2: number): number
  begin
    return val + val2
  end

  proc foo(val: number): number
  begin
    return bar System.min(1, 2) 10
  end
`)
  expect(res).toBe(11);
});

test('namedargs', () => {
  let res = runProg(`

  proc bar(val: number, val2: number): number
  begin
    return val + val2
  end

  proc foo(val: number): number
  begin
    return bar val1:=1 val2:=10
  end
`)
  expect(res).toBe(11);
});

test('systemcalls', () => {
  let res = runProg(`

  proc foo(): Sprite
  begin
    System.createSprite 'test'
    return 42;
  end
`);
  expect(res).toBe(42);
});

test('asynccall', async () => {
  let res = runProg(`

  proc foo(): Sprite
  begin
    System.waitCollide 'test'
    return 42;
  end
`);
  expect(res instanceof Promise).toBe(true);
  expect(await res).toBe(42);
});

test("events", async () => {
  let res = await runVm(`

  var x := 3;
  
  on load() begin
    x := 4;
  end

  on start() begin
    System.sendMessage("hello", x);
  end
);`, "hello");

  expect(res).toBe(4);
});


