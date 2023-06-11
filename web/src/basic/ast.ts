import { Block } from "typescript";
import { Token } from "./token";
import { ParseError, ParseErrorCode } from "./parseerror";

export enum AstErrorCode {
  generic,
  invalidNode,
}

export class AstError {
  public readonly msg: string;
  public readonly code: AstErrorCode;
  public readonly ast: AstNode | undefined;

  public constructor(code: AstErrorCode, ast: AstNode | undefined, msg: string) {
    this.msg = msg;
    this.code = code;
    this.ast = ast;
  }
}

export enum AstNodeKind {
  module = 0,
  paramDef = 1,
  funcDef = 2,
  typeDef = 3,
  varDef = 4,
  return = 5,
  break = 6,
  assingment = 7,
  call = 8,
  op = 9,
  const = 10,
  id = 11,
  expression = 12,
  block = 13,
  if = 14,
  for = 16,
  forever = 17,
  foreach = 18,
  while = 19,
  on = 20,
  comment = 21,
  placeholder = 100
}

let nextId: number = 1;

function makeAstId(): number {
  let id = nextId++;
  return id;
}

export type AstNode = {
  kind: AstNodeKind;
  startToken: Token;
  id: number;
  parent?: AstNode;
}

export type CommentNode = AstNode & {
  text?: string;
}

export type PlaceholderNode = AstNode & {
  text?: string;
}

export type ModuleNode = AstNode & {
  name: string | undefined,
  types: TypeDefNode[];
  funcs: FuncDefNode[];
  vars: VarDefNode[];
  on: OnNode[];
}


export type StatementNode = AstNode & {

}

export type ParamDefNode = AstNode & {
  name: Token;
  paramType: Token;
}

export type FuncDefNode = AstNode & {
  module: ModuleNode;
  name: Token | undefined;
  returnType: Token | undefined;
  params: ParamDefNode[];
  isAsync: boolean;
  body: BlockNode | Function;
}

export type OnNode = FuncDefNode & {
  event: Token;
  filter: Token | undefined;
}

export type FieldDef = {
  name: Token;
  fieldType: Token;
}

export type TypeDefNode = AstNode & {
  digName: Token;
  systemType: Function | undefined;
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

export type OpNode = AstNode & {
  op: Token;
}

export type ConstNode = AstNode & {
  value: Token;
}

export function makeConstNode(token: Token): ConstNode {
  return {
    kind: AstNodeKind.const,
    id: makeAstId(),
    startToken: token,
    value: token
  }
}

export type IdNode = AstNode & {
  name: Token;
}

export function makeIdNode(token: Token): IdNode {
  return {
    kind: AstNodeKind.id,
    id: makeAstId(),
    startToken: token,
    name: token
  }
}

export type ExpressionNode = AstNode & {
  left: AstNode | undefined;
  op: OpNode | undefined;
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

export type ForeverNode = StatementNode & {
  body: BlockNode
}

export type ForeachNode = StatementNode & {
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
      (ast as ModuleNode).funcs.forEach(func);
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

export function insertPlaceholderBefore(before: AstNode): AstNode {
  if (!before.parent) {
    throw new ParseError(ParseErrorCode.InvalidArg, undefined, 'Cannot get parent');
  }

  // we can only insert empty line if there is a block
  if (before.parent.kind === AstNodeKind.block) {
    let ph: PlaceholderNode = {
      kind: AstNodeKind.placeholder,
      id: makeAstId(),
      startToken: Token.makeWs()
    };

    let block = before.parent as BlockNode;
    let idx = block.statements.findIndex((e) => e === before);
    if (idx === -1) {
      throw new ParseError(ParseErrorCode.InvalidArg, undefined, 'Cannot find node');
    }
    ph.parent = block;
    block.statements.splice(idx, 0, ph);
    return ph;
  } else {
    return insertPlaceholderBefore(before.parent);
  }
}