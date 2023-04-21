import { expect, test } from '@jest/globals';
import { BasicParser } from '../../src/engine/basic';
//import { test } from 'jest';

test("basic", () => {
  let parser = new BasicParser(`
proc foo()
begin
  var x := 3
  print (\"hello world\" + x)
end prod`);
  let ast = parser.parse();
  expect(ast.children.length).toBe(3);
});

