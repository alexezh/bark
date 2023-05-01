import { AstNode, AstNodeKind, FuncDefNode, ModuleNode, ParamDefNode, StatementNode } from "./ast";
import { Token, TokenKind } from "./basictokeniser";

function typeNameToTokenKind(name: string): TokenKind {
  switch (parts[1]) {
    case 'number': return TokenKind.Number;
    case 'string': return TokenKind.String;
    case 'boolean': return TokenKind.Boolean;
    default: return TokenKind.Id;
  }
}

export function addSystemFunc(name: string, params: string[], rval: string, impl: any): FuncDefNode {
  let paramDefs: ParamDefNode[] = [];
  for (let param of params) {
    let parts = param.split(':');

    let paramKind = typeNameToTokenKind(parts[1]);

    paramDefs.push({
      kind: AstNodeKind.paramDef,
      name: new Token(TokenKind.Id, parts[0], 0),
      paramType: new Token(paramKind, parts[1], 0)
    })
  }

  return {
    kind: AstNodeKind.funcDef,
    name: new Token(TokenKind.Id, name, 0),
    params: paramDefs,
    returnValue:
      body:
  }
}

export function createMath(): ModuleNode {
  let funcs: FuncDefNode[] = [];

  funcs.push(addSystemFunc('min', ['val:number'], 'number', Math.min))
  return {
    kind: AstNodeKind.module,
    name: 'Math',
    children: funcs
  }
}