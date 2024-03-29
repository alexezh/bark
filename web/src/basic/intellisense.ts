import { AstNode, AstNodeKind, BlockNode, ExpressionNode, FuncDefNode, ModuleNode, OnNode, VarDefNode, makeAstId } from "./ast"
import { TextModule } from "./textblock";
import { Token, TokenKind } from "./token";

export type AstTemplate = {
  name: string;
  ast: (module: ModuleNode) => AstNode;
}

function idTokenPl(): Token {
  return new Token(TokenKind.IdPlaceholder, '', 0);
}

function idToken(name: string): Token {
  return new Token(TokenKind.Id, name, 0);
}

function expTokenPl(): Token {
  return new Token(TokenKind.ExpPlaceholder, '', 0);
}

function expNodePl(): ExpressionNode {
  return {
    kind: AstNodeKind.expressionPlaceholder,
    id: makeAstId(),
    startToken: expTokenPl(),
    left: { kind: AstNodeKind.idPlaceholder, id: makeAstId(), startToken: expTokenPl() },
    op: undefined,
    right: undefined
  }
}

function bodyNodePl(): BlockNode {
  return {
    kind: AstNodeKind.bodyPlaceholder,
    id: makeAstId(),
    startToken: expTokenPl(),
    statements: []
  }
}

export function varTemplateAst(module: ModuleNode): VarDefNode {
  return {
    kind: AstNodeKind.varDef,
    id: makeAstId(),
    startToken: idTokenPl(),
    name: idTokenPl(),
    value: expNodePl()
  }
}

export function functionTemplateAst(module: ModuleNode): FuncDefNode {
  return {
    module: module,
    kind: AstNodeKind.funcDef,
    id: makeAstId(),
    startToken: idTokenPl(),
    name: idTokenPl(),
    params: [{ kind: AstNodeKind.paramPlaceholder, id: makeAstId(), startToken: idTokenPl(), name: idTokenPl(), paramType: idTokenPl() }],
    returnType: undefined,
    isAsync: false,
    body: bodyNodePl(),
  }
}

export function eventTemplateAst(module: ModuleNode, name: string, filter?: string): OnNode {
  return {
    module: module,
    kind: AstNodeKind.funcDef,
    id: makeAstId(),
    startToken: idTokenPl(),
    name: undefined,
    event: idToken(name),
    filter: (filter) ? idToken(filter) : undefined,
    params: [{ kind: AstNodeKind.paramPlaceholder, id: makeAstId(), startToken: idTokenPl(), name: idTokenPl(), paramType: idTokenPl() }],
    returnType: undefined,
    isAsync: false,
    body: bodyNodePl(),
  }
}

export function eventTemplates(): AstTemplate[] {
  return [
    { name: 'load', ast: (module) => eventTemplateAst(module, 'load') },
    { name: 'start', ast: (module) => eventTemplateAst(module, 'start') },
    { name: 'message', ast: (module) => eventTemplateAst(module, 'message', 'YourMessage') }
  ]
}

export function statementInsertSuggestion() {
  return [
    {
      name: 'if',
      template: 'if __exp then __body end'
    },
    {
      name: 'for',
      template: 'for __var := __exp to __to by __by do __body end'
    },
    {
      name: 'foreach',
      template: 'foreach __ in __ do __ end'
    },
    {
      name: 'forever',
      template: 'foreach __ in __ do __ end'
    },
    {
      name: 'while'
    },
    {
      name: 'break'
    },
    {
      name: 'return'
    }
  ]
}

export function ifEditSuggestion() {
  return [
    {
      name: 'then'
    },
    {
      name: 'else'
    },
    {
      name: 'elif'
    }
  ]
}

