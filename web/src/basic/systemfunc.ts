import { AstNodeKind, FuncDefNode, ParamDefNode } from "./ast";
import { Token, TokenKind } from "./token";

function typeNameToTokenKind(name: string): TokenKind {
  switch (name) {
    case 'number': return TokenKind.Number;
    case 'string': return TokenKind.String;
    case 'boolean': return TokenKind.Boolean;
    default: return TokenKind.Id;
  }
}

export function addSystemFunc(name: string, params: string[], rval: string, impl: Function): FuncDefNode {
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

  let returnType = new Token(typeNameToTokenKind(rval), rval, 0);

  return {
    kind: AstNodeKind.funcDef,
    name: new Token(TokenKind.Id, name, 0),
    params: paramDefs,
    returnType: returnType,
    body: impl
  }
}
