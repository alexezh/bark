import { Token } from "./token";

export enum AstNodeKind {
  module = 0,
  paramDef,
  funcDef,
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
  while
}

export type AstNode = {
  kind: AstNodeKind
}

export type ModuleNode = AstNode & {
  name: string | undefined,
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
  body: BlockNode | Function;
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
  value: ExpressionNode;
}

export type CallNode = StatementNode & {
  name: Token;
  params: CallParamNode[];
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