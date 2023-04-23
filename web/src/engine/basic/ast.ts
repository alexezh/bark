import { Token } from "./basictokeniser";

export type AstNode = {

}

export type ModuleNode = AstNode & {
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
  returnValue: Token | undefined;
  params: ParamDefNode[];
  body: StatementNode[];
}

export type VarDefNode = AstNode & {
  name: Token;
  value: ExpressionNode | undefined;
}

export type AssingmentNode = StatementNode & {
  name: Token;
  value: ExpressionNode;
}

export type CallNode = StatementNode & {
  name: Token;
  params: ExpressionNode[];
}

export type OpNode = AstNode & {
  op: Token;
}

export type ConstNode = AstNode & {
  value: Token;
}

export type IdNode = AstNode & {
  name: Token;
}

export type ExpressionNode = AstNode & {
  children: AstNode[];
}

export type IfNode = StatementNode & {
  exp: AstNode;
  th: AstNode;
  // elif translated to el -> IfNode
  el: AstNode | undefined;
}
