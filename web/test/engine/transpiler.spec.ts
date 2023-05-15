import { expect, test } from '@jest/globals';
import { BasicLexer } from '../../src/basic/lexer';
import { BasicParser, EolRule } from '../../src/basic/basicparser';
import { parseModule } from '../../src/basic/basic';
import { ParseError } from '../../src/basic/parseerror';
import { ModuleCache } from '../../src/basic/modulecache';
import { createAllModules } from '../../src/basic/lib/all';
import { validateModule } from '../../src/basic/checker';
import { transpile } from '../../src/basic/basictranspiler';
import { setVM, vm } from '../../src/engine/ivm';
import { GameLoader as CodeLoader } from '../../src/engine/vm';


function runProg(text: string, moduleCache: ModuleCache | undefined = undefined): any {
  try {
    let tokenize = BasicLexer.load(text);
    let parser = new BasicParser(tokenize);
    let ast = parseModule(parser);
    validateModule(ast, moduleCache);
    let js = transpile(ast, 'foo', moduleCache);

    let val = js(moduleCache);
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

function runVm(text: string, moduleCache: ModuleCache | undefined = undefined) {
  try {
    // game loader has similar API as VM; use them directly
    setVM(new CodeLoader() as any);

    let tokenize = BasicLexer.load(text);
    let parser = new BasicParser(tokenize);
    let ast = parseModule(parser);
    validateModule(ast, moduleCache);
    let js = transpile(ast, undefined, moduleCache);

    js(moduleCache);
    vm.lox``
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
  let cache = createAllModules();
  let res = runProg(`

  proc bar(val: number, val2: number): number
  begin
    return val + val2
  end

  proc foo(val: number): number
  begin
    return bar Math.min(1, 2) 10
  end
`, cache)
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
  let cache = createAllModules();
  let res = runProg(`

  proc foo(): Sprite
  begin
    Vm.createSprite 'test'
    return 42;
  end
`, cache);
  expect(res).toBe(42);
});

test('asynccall', async () => {
  let cache = createAllModules();
  let res = runProg(`

  proc foo(): Sprite
  begin
    Vm.waitCollide 'test'
    return 42;
  end
`, cache);
  expect(res instanceof Promise).toBe(true);
  expect(await res).toBe(42);
});

test("events", async () => {
  let cache = createAllModules();
  let promise = new Promise((resolve) => {
    vm.onMessage("hello", async (msg: any) => {
      resolve(msg);
    });
  });

  runVm(`

  var x: number := 3;
  
  on load() begin
    x := 4;
  end

  on start() begin
    vm.send("hello", x);
  end
);`, cache);

  let msg = await promise;
  expect(msg).toBe(4);
});

test("bomb", () => {
  let res = runProg(`

  var monky: Sprite;
  
  on load() begin
    var level:= App.loadLevel 'default'
    App.setMoveController2D(10, 10, 10, 10, 0.1)
  end

  on start() begin
    monky:= App.createSprite 'monky' 'vox/monky.vox'

    var ma:= Sprite.addAnimation monky 'move'
    Sprite.addFrame ma idx:= 1 dur:=0.1 
    Sprite.addFrame ma idx:= 2 dur:=0.1

    ma:= Sprite.addAnimation monky 'stand'
    Sprite.addFrame ma idx:= 0 dur:=0

    App.send()
  end

  event startBomb() begin

    var bomb:= App.createSprite 'bomb' 'vox/bomb.vox'
    Sprite.setPosition bomb randInt(50, 150) 50 randInt(50, 150)

    var speed:= 10;
    Sprite.setSpeed bomb x:=0 y:=-speed z:=0

    while true do
      var collision := App.waitCollide bomb 0.1
      if collision = null then
        speed := Math.min speed * 1.1 100;
        Sprite.changeSpeedBy bomb 0 -speed 0
      else
        if collision is Sprite then
          App.send "KilledMonkey"
        elif collision is Block then
          foreach b in collision.blocks do
            App.deleteBlock b
            App.createExplosion collision.position;
          end
          App.removeSprite bomb
        else
          App.removeSprite bomb
        end
        break;
      end
    end
  end 
    `);

  expect(res).toBe(11);
})