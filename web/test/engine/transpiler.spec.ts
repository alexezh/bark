import { expect, test } from '@jest/globals';
import { Tokenizer } from '../../src/basic/basictokeniser';
import { BasicParser, EolRule } from '../../src/basic/basicparser';
import { parseModule } from '../../src/basic/basic';
import { Transpiler } from '../../src/basic/basictranspiler';
import { ParseError } from '../../src/basic/parseerror';

function runProg(text: string): any {
  try {
    let tokenize = Tokenizer.load(text);
    let parser = new BasicParser(tokenize);
    let ast = parseModule(parser);
    let trans = new Transpiler();
    let js = trans.generate(ast, 'foo');

    let val = eval(js);
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
  let res = runProg(`

  proc bar(val: number, val2: number): number
  begin
    return val + val2
  end

  proc foo(val: number): number
  begin
    return bar Math.min(1, 2) 10
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

test("bomb", () => {
  let res = runProg(`

  proc foo() begin
    var bomb:= createSprite 'vox/bomb.vox'
    setPosition bomb randInt(50, 150) 50 randInt(50, 150)

    var speed:= 10;
    setSpeed bomb x:=0 y:=-speed z:=0

    var monky:= createSprite 'vox/monky.vox'

    var ma:= addAnimation monky 'move'
    addFrame ma idx:= 1 dur:=0.1 
    addFrame ma idx:= 2 dur:=0.1

    var ma:= addAnimation monky 'stand'
    addFrame ma idx:= 0 dur:=0

    var level:= vm.loadLevel 'default'

    while true do
      var collision := Level.waitCollide bomb 0.1
      if collision = null then
        speed := Math.min speed * 1.1 100;
        changeSpeedBy bomb 0 -speed 0
      else
        if collision typeof Sprite then
          vm.send "KilledMonkey"
        elif collision typeof MapBlock then
          foreach b in collision.blocks do
            Level.deleteBlock level b
            Level.createExplosion collision.position;
          end
          removeSprite bomb
        else
          removeSprite bomb
        end
        break;
      end
    end
  end 
    `);

  expect(res).toBe(11);
})