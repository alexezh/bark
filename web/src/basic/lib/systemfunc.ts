import { AstNodeKind, FieldDef, FuncDefNode, ModuleNode, ParamDefNode, TypeDefNode, makeAstId } from "../ast";
import { Token, TokenKind } from "../token";

function typeNameToTokenKind(name: string): TokenKind {
  switch (name) {
    case 'number': return TokenKind.Number;
    case 'string': return TokenKind.String;
    case 'boolean': return TokenKind.Boolean;
    default: return TokenKind.Id;
  }
}

export function createModuleNode(name: string): ModuleNode {
  let module: ModuleNode = {
    kind: AstNodeKind.module,
    id: makeAstId(),
    startToken: new Token(TokenKind.Id, name, 0),
    name: name,
    types: [],
    vars: [],
    funcs: [],
    on: []
  }

  return module;
}

export function addSystemType(digName: string, systemType: Function, fields: string[]): TypeDefNode {
  let fieldDefs: FieldDef[] = [];
  for (let field of fields) {
    let parts = field.split(':');

    let fieldType = typeNameToTokenKind(parts[1]);

    fieldDefs.push({
      name: new Token(TokenKind.Id, parts[0], 0),
      fieldType: new Token(fieldType, parts[1], 0)
    })
  }

  let name = new Token(TokenKind.Id, digName, 0);
  return {
    kind: AstNodeKind.typeDef,
    id: makeAstId(),
    startToken: name,
    digName: name,
    systemType: systemType,
    fields: fieldDefs,
  }
}

export function addSystemFunc(module: ModuleNode, name: string, params: string[], rval: string, isAsync: boolean, impl: Function): FuncDefNode {
  let paramDefs: ParamDefNode[] = [];
  for (let param of params) {
    let parts = param.split(':');

    let paramKind = typeNameToTokenKind(parts[1]);

    let name = new Token(TokenKind.Id, parts[0], 0)
    paramDefs.push({
      kind: AstNodeKind.paramDef,
      id: makeAstId(),
      startToken: name,
      name: name,
      paramType: new Token(paramKind, parts[1], 0)
    })
  }

  let returnType = new Token(typeNameToTokenKind(rval), rval, 0);
  let nameToken = new Token(TokenKind.Id, name, 0);

  return {
    kind: AstNodeKind.funcDef,
    id: makeAstId(),
    module: module,
    startToken: nameToken,
    name: nameToken,
    params: paramDefs,
    returnType: returnType,
    isAsync: isAsync,
    body: impl
  }
}
