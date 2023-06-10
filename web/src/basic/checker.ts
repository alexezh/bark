import { ICodeLoader } from "../engine/ivm";
import { AssingmentNode, AstNode, AstNodeKind, BlockNode, CallNode, ExpressionNode, ForeachNode, ForNode, ForeverNode, FuncDefNode, IfNode, ModuleNode, OnNode, ReturnNode, StatementNode, VarDefNode, WhileNode, AstError } from "./ast"
import { ParseError, ParseErrorCode, throwUnexpectedError } from "./parseerror";

class ValidationContext {
  readonly parentCtx: ValidationContext | undefined;
  readonly node: AstNode;
  readonly funcDefs: Map<string, FuncDefNode>;
  readonly validated: WeakMap<AstNode, boolean>;

  public constructor(node: AstNode, parent: ValidationContext | undefined) {
    this.node = node;
    this.parentCtx = parent;
    if (parent) {
      this.funcDefs = parent.funcDefs;
      this.validated = parent.validated;
    } else {
      this.funcDefs = new Map<string, FuncDefNode>();
      this.validated = new WeakMap<AstNode, boolean>();
    }
  }
}

function updateAsyncFlag(ctx: ValidationContext | undefined) {
  while (ctx) {
    if (ctx.node.kind === AstNodeKind.funcDef) {
      let fd = ctx.node as FuncDefNode;
      if (fd.isAsync) {
        break;
      }
      fd.isAsync = true;
    }
    else if (ctx.node.kind === AstNodeKind.on) {
      let on = ctx.node as OnNode;
      if (on.isAsync) {
        break;
      }
      on.isAsync = true;
    }
    ctx = ctx.parentCtx;
  }
}

function getRootContext(ctx: ValidationContext): ValidationContext {
  while (ctx) {
    if (ctx.parentCtx === undefined) {
      return ctx;
    }
    ctx = ctx.parentCtx;
  }
  throw 'Invalid chain';
}

export function validateModule(module: ModuleNode, loader: ICodeLoader | undefined) {
  let ctx = new ValidationContext(module, undefined);

  if (loader) {
    for (let func of loader.functions()) {
      if (func.name) {
        if (func.module.name === undefined) {
          ctx.funcDefs.set(func.name.value, func);
        } else {
          ctx.funcDefs.set(func.module.name + '.' + func.name.value, func);
        }
      }
    };
  } else {
    // first fill in method defs
    for (let func of module.funcs) {
      if (func.name) {
        ctx.funcDefs.set(func.name.value, func);
      }
    }
  }

  for (let node of module.funcs) {
    validateNode(ctx, node, module);
  }

  for (let node of module.on) {
    validateNode(ctx, node, module);
  }
}

/**
 * we only create parent context when there are local values (which means any block)
 * but we want to link nodes in a tree, so we are going to pass parentAst node
 */
function validateNode(parentCtx: ValidationContext, ast: AstNode, parentAst: AstNode) {
  if (parentCtx.validated.get(ast)) {
    return;
  }

  ast.parent = parentAst;

  parentCtx.validated.set(ast, true);
  switch (ast.kind) {
    case AstNodeKind.funcDef:
      validateFuncDef(parentCtx, ast as FuncDefNode);
      break;
    case AstNodeKind.on:
      validateOn(parentCtx, ast as OnNode);
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
      validateForeach(parentCtx, ast as ForeachNode);
      break;
    case AstNodeKind.forever:
      validateForever(parentCtx, ast as ForeverNode);
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
      validateBlock(parentCtx, ast as BlockNode, parentAst);
      break;
    case AstNodeKind.const:
    case AstNodeKind.op:
    case AstNodeKind.id:
      break;
    case AstNodeKind.expression:
      validateExpression(parentCtx, ast as ExpressionNode);
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
    let ctx = new ValidationContext(ast, parentCtx);
    validateBlock(ctx, ast.body, ast);
  }
}

function validateOn(parentCtx: ValidationContext, ast: OnNode) {
  if (!(ast.event.value === 'start' || ast.event.value === 'load' || ast.event.value === 'message')) {
    throwUnexpectedError(ast.event, 'start|load|message');
  }

  if (ast.body instanceof Function) {
    ;
  } else {
    let ctx = new ValidationContext(ast, parentCtx);
    validateBlock(ctx, ast.body, ast);
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
    validateNode(parentCtx, ast.left, ast);
  }
  if (ast.right) {
    validateNode(parentCtx, ast.right, ast);
  }
}

function validateIf(parentCtx: ValidationContext, ast: IfNode) {
  validateExpression(parentCtx, ast.exp);
  validateBlock(parentCtx, ast.th, ast);
  if (ast.elif) {
    for (let node of ast.elif) {
      validateExpression(parentCtx, node.exp);
      validateBlock(parentCtx, node.block, ast);
    }
  }
  if (ast.el) {
    validateBlock(parentCtx, ast.el, ast);
  }
}

function validateFor(parentCtx: ValidationContext, ast: ForNode) {
  validateBlock(parentCtx, ast.body, ast);
}

function validateWhile(parentCtx: ValidationContext, ast: WhileNode) {
  validateBlock(parentCtx, ast.body, ast);
}

function validateForeach(parentCtx: ValidationContext, ast: ForeachNode) {
  validateBlock(parentCtx, ast.body, ast);
}

function validateForever(parentCtx: ValidationContext, ast: ForeverNode) {
  validateBlock(parentCtx, ast.body, ast);
  updateAsyncFlag(parentCtx);
}

function validateReturn(parentCtx: ValidationContext, ast: ReturnNode) {
  if (ast.value) {
    validateExpression(parentCtx, ast.value);
  }
}

function validateBreak(parentCtx: ValidationContext, ast: AstNode) {
  // nothing to do
}

function validateBlock(parentCtx: ValidationContext, ast: BlockNode, parentAst: AstNode) {
  ast.parent = parentAst;

  for (let node of ast.statements) {
    validateNode(parentCtx, node, ast);
  }
}

function validateCall(parentCtx: ValidationContext, ast: CallNode) {
  let ctx = new ValidationContext(ast, parentCtx);

  let fd = ctx.funcDefs.get(ast.name.value);
  if (fd === undefined) {
    throw new ParseError(ParseErrorCode.UnknownFunctionName, ast.name, `Unknown function name ${ast.name.value}`);
  }

  ast.funcDef = fd;

  // first validate the method we are calling
  let rootCtx = getRootContext(parentCtx);

  // pass root node (which should be module as root)
  validateNode(getRootContext(parentCtx), fd, rootCtx.node);

  // now we have async flag, set it on our chain of calls
  if (fd.isAsync) {
    updateAsyncFlag(ctx);
  }

  for (let param of ast.params) {
    validateExpression(parentCtx, param);
  }
}

