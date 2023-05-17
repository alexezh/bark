import { ICodeLoader } from "../engine/ivm";
import { AssingmentNode, AstNode, AstNodeKind, BlockNode, CallNode, ExpressionNode, ForEachNode, ForNode, FuncDefNode, IfNode, ModuleNode, OnNode, ReturnNode, StatementNode, VarDefNode, WhileNode } from "./ast"
import { ParseError, ParseErrorCode } from "./parseerror";

class ValidationContext {
  parent: ValidationContext | undefined;
  readonly node: AstNode;
  readonly funcDefs: Map<string, FuncDefNode>;
  readonly validated: WeakMap<AstNode, boolean>;

  public constructor(node: AstNode, parent: ValidationContext | undefined) {
    this.node = node;
    this.parent = parent;
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
    ctx = ctx.parent;
  }
}

function getRootContext(ctx: ValidationContext): ValidationContext {
  while (ctx) {
    if (ctx.parent === undefined) {
      return ctx;
    }
    ctx = ctx.parent;
  }
  throw 'Invalid chain';
}

export function validateModule(module: ModuleNode, loader: ICodeLoader | undefined) {
  let ctx = new ValidationContext(module, undefined);

  if (loader) {
    for (let proc of loader.functions()) {
      if (proc.kind === AstNodeKind.funcDef) {
        if (proc.module.name === undefined) {
          ctx.funcDefs.set(proc.name.value, proc);
        } else {
          ctx.funcDefs.set(proc.module.name + '.' + proc.name.value, proc);
        }
      }
    };
  } else {
    // first fill in method defs
    for (let node of module.procs) {
      if (node.kind === AstNodeKind.funcDef) {
        let fd = node as FuncDefNode;
        ctx.funcDefs.set(fd.name.value, fd);
      }
    }
  }

  for (let node of module.procs) {
    validateNode(ctx, node);
  }

  for (let node of module.on) {
    validateNode(ctx, node);
  }
}

function validateNode(parentCtx: ValidationContext, ast: AstNode) {
  if (parentCtx.validated.get(ast)) {
    return;
  }

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
    validateBlock(ctx, ast.body);
  }
}

function validateOn(parentCtx: ValidationContext, ast: OnNode) {
  if (ast.body instanceof Function) {
    ;
  } else {
    let ctx = new ValidationContext(ast, parentCtx);
    validateBlock(ctx, ast.body);
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
  let ctx = new ValidationContext(ast, parentCtx);

  let fd = ctx.funcDefs.get(ast.name.value);
  if (fd === undefined) {
    throw new ParseError(ParseErrorCode.UnknownFunctionName, ast.name, `Unknown function name ${ast.name.value}`);
  }

  ast.funcDef = fd;

  // first validate the method we are calling
  validateNode(getRootContext(parentCtx), fd);

  // now we have async flag, set it on our chain of calls
  if (fd.isAsync) {
    updateAsyncFlag(ctx);
  }

  for (let param of ast.params) {
    validateExpression(parentCtx, param);
  }
}

