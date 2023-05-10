import { AssingmentNode, AstNode, AstNodeKind, BlockNode, CallNode, ExpressionNode, ForEachNode, ForNode, FuncDefNode, IfNode, ModuleNode, ReturnNode, StatementNode, VarDefNode, WhileNode } from "./ast"
import { ParseError, ParseErrorCode } from "./parseerror";

class ValidationContext {
  parent: ValidationContext | undefined;
  readonly node: AstNode;

  public constructor(node: AstNode, parent: ValidationContext | undefined) {
    this.node = node;
    this.parent = parent;
  }
}

export function validateModule(ast: ModuleNode) {
  let ctx = new ValidationContext(ast, undefined);
  for (let node of ast.children) {
    validateNode(ctx, node);
  }
}

function validateNode(parentCtx: ValidationContext, ast: AstNode) {
  switch (ast.kind) {
    case AstNodeKind.funcDef:
      validateFuncDef(parentCtx, ast as FuncDefNode);
      break;
    case AstNodeKind.varDef:
      validateVarDef(parentCtx, ast as VarDefNode);
      break;
    case AstNodeKind.assingment:
      validateAssingment(parentCtx, ast as AssingmentNode);
      break;
    case AstNodeKind.if:
      validateIf(parentCtx, ast as IfNode);
      break;
    case AstNodeKind.for:
      validateFor(parentCtx, ast as ForNode);
      break;
    case AstNodeKind.foreach:
      validateForEach(parentCtx, ast as ForEachNode);
      break;
    case AstNodeKind.while:
      validateWhile(parentCtx, ast as WhileNode);
      break;
    case AstNodeKind.return:
      validateReturn(parentCtx, ast as ReturnNode);
      break;
    case AstNodeKind.break:
      validateBreak(parentCtx, ast as StatementNode);
      break;
    case AstNodeKind.block:
      validateBlock(parentCtx, ast as BlockNode);
      break;
    case AstNodeKind.call:
      validateCall(parentCtx, ast as CallNode);
      break;
    default:
      throw new ParseError(ParseErrorCode.NotImpl, undefined, 'Not implemented');
  }
}

function validateFuncDef(parentCtx: ValidationContext, ast: FuncDefNode) {
  if (ast.body instanceof Function) {
    ;
  } else {
    validateBlock(parentCtx, ast.body);
  }
}
function validateVarDef(parentCtx: ValidationContext, ast: VarDefNode) {
  if (ast.value) {
    validateExpression(parentCtx, ast.value);
  }
}

function validateAssingment(parentCtx: ValidationContext, ast: AssingmentNode) {
  validateExpression(parentCtx, ast.value);
}

function validateExpression(parentCtx: ValidationContext, ast: ExpressionNode) {
  if (ast.left) {
    validateNode(parentCtx, ast.left);
  }
  if (ast.right) {
    validateNode(parentCtx, ast.right);
  }
}

function validateIf(parentCtx: ValidationContext, ast: IfNode) {
  validateBlock(parentCtx, ast.th);
  if (ast.elif) {
    for (let node of ast.elif) {
      validateBlock(parentCtx, ast.th);
    }
  }
  if (ast.el) {
    validateBlock(parentCtx, ast.el);
  }
}

function validateFor(parentCtx: ValidationContext, ast: ForNode) {
  validateBlock(parentCtx, ast.body);
}

function validateWhile(parentCtx: ValidationContext, ast: WhileNode) {
  validateBlock(parentCtx, ast.body);
}

function validateForEach(parentCtx: ValidationContext, ast: ForEachNode) {
  validateBlock(parentCtx, ast.body);
}

function validateReturn(parentCtx: ValidationContext, ast: ReturnNode) {
  if (ast.value) {
    validateExpression(parentCtx, ast.value);
  }
}

function validateBreak(parentCtx: ValidationContext, ast: AstNode) {
}

function validateBlock(parentCtx: ValidationContext, ast: BlockNode) {
  for (let node of ast.statements) {
    validateNode(parentCtx, node);
  }
}

function validateCall(parentCtx: ValidationContext, ast: CallNode) {
  for (let param of ast.params) {
    validateExpression(parentCtx, param.value);
  }
}

