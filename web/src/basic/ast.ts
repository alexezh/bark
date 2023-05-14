import { Token } from "./token";

export enum AstNodeKind {
  module = 0,
  paramDef,
  funcDef,
  typeDef,
  varDef,
  return,
  break,
  assingment,
  call,
  op,
  const,
  id,
  expression,
  block,
  if,
  for,
  foreach,
  while,
  on,
}

export type AstNode = {
  kind: AstNodeKind
}

export type ModuleNode = AstNode & {
  name: string | undefined,
  types: TypeDefNode[];
  children: AstNode[];
}


export type StatementNode = AstNode & {

}

export type ParamDefNode = AstNode & {
  name: Token;
  paramType: Token;
}

export type FuncDefNode = AstNode & {
  name: Token;
  returnType: Token | undefined;
  params: ParamDefNode[];
  isAsync: boolean;
  body: BlockNode | Function;
}

export type FieldDef = {
  name: Token;
  fieldType: Token;
}

export type TypeDefNode = AstNode & {
  digName: Token;
  systemName: string | undefined;
  fields: FieldDef[];
}

export type VarDefNode = AstNode & {
  name: Token;
  value: ExpressionNode | undefined;
}

export type ReturnNode = AstNode & {
  value: ExpressionNode | undefined;
}

export type AssingmentNode = StatementNode & {
  name: Token;
  value: ExpressionNode;
}

export type CallParamNode = ExpressionNode & {
  name: Token | undefined;
}

export type CallNode = StatementNode & {
  name: Token;
  params: CallParamNode[];
  funcDef?: FuncDefNode;
}

export type OnNode = StatementNode & {
  name: Token;
  params: CallParamNode[];
  funcDef?: FuncDefNode;
}

export type OpNode = AstNode & {
  op: Token;
}

export type ConstNode = AstNode & {
  value: Token;
}

export function makeConstNode(token: Token): ConstNode {
  return {
    kind: AstNodeKind.const,
    value: token
  }
}

export type IdNode = AstNode & {
  name: Token;
}

export function makeIdNode(token: Token): IdNode {
  return {
    kind: AstNodeKind.id,
    name: token
  }
}

export type ExpressionNode = AstNode & {
  left: AstNode | undefined;
  op: AstNode | undefined;
  right: AstNode | undefined;
}

export type BlockNode = AstNode & {
  statements: StatementNode[];
}

export type IfNode = StatementNode & {
  exp: ExpressionNode;
  th: BlockNode;
  elif: { exp: ExpressionNode, block: BlockNode }[];
  el: BlockNode | undefined;
}

export type ForNode = StatementNode & {
  name: Token;
  startExp: ExpressionNode;
  endExp: ExpressionNode;
  byExp: ExpressionNode | undefined;
  body: BlockNode
}

export type ForEachNode = StatementNode & {
  name: Token;
  exp: ExpressionNode;
  body: BlockNode
}

export type WhileNode = StatementNode & {
  exp: ExpressionNode;
  body: BlockNode
}

export function forEachChild(ast: AstNode, func: (ast: AstNode) => void) {
  switch (ast.kind) {
    case AstNodeKind.module:
      (ast as ModuleNode).children.forEach(func);
      break;
    case AstNodeKind.funcDef:
      let body = (ast as FuncDefNode).body;
      if (body instanceof Function) {
        ;
      } else {
        body.statements.forEach(func);
      }
      break;
    case AstNodeKind.return:
      break;
    case AstNodeKind.assingment:
      break;
    case AstNodeKind.call:
      break;
    case AstNodeKind.op:
      break;
    case AstNodeKind.const:
      break;
    case AstNodeKind.id:
      break;
    case AstNodeKind.expression:
      break;
    case AstNodeKind.block:
      break;
    case AstNodeKind.if:
      break;
    case AstNodeKind.for:
      break;
    case AstNodeKind.foreach:
      break;
    case AstNodeKind.while:
      break;
  }
}

