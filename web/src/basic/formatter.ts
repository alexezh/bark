import { AssingmentNode, AstNode, AstNodeKind, BlockNode, CallNode, ExpressionNode, ForeachNode, ForNode, ForeverNode, FuncDefNode, IfNode, OnNode, ParamDefNode, ReturnNode, StatementNode, VarDefNode, WhileNode, ModuleNode, IdNode, AstErrorCode, AstError, ConstNode } from "./ast";
import { ParseError, ParseErrorCode } from "./parseerror";
import { ITextSegment, TextBlock, TextLine } from "./textblock";
import { Token, TokenKind } from "./token";


/**
 * convers tree to array of lines
 */
export function renderNode(rb: TextBlock, ast: AstNode) {

  switch (ast.kind) {
    case AstNodeKind.funcDef:
      renderFuncDef(rb, ast as FuncDefNode);
      break;
    case AstNodeKind.on:
      renderOn(rb, ast as OnNode);
      break;
    case AstNodeKind.varDef:
      renderVarDef(rb, ast as VarDefNode);
      break;
    case AstNodeKind.assingment:
      renderAssingment(rb, ast as AssingmentNode);
      break;
    case AstNodeKind.if:
      renderIf(rb, ast as IfNode);
      break;
    case AstNodeKind.for:
      renderFor(rb, ast as ForNode);
      break;
    case AstNodeKind.foreach:
      renderForeach(rb, ast as ForeachNode);
      break;
    case AstNodeKind.forever:
      renderForever(rb, ast as ForeverNode);
      break;
    case AstNodeKind.while:
      renderWhile(rb, ast as WhileNode);
      break;
    case AstNodeKind.return:
      renderReturn(rb, ast as ReturnNode);
      break;
    case AstNodeKind.break:
      renderBreak(rb, ast as StatementNode);
      break;
    case AstNodeKind.block:
      renderBlock(rb, ast as BlockNode);
      break;
    case AstNodeKind.const:
    case AstNodeKind.op:
    case AstNodeKind.id:
      break;
    case AstNodeKind.expression:
      //validateExpression(rb, ast as ExpressionNode);
      break;
    case AstNodeKind.call:
      renderCall(rb, ast as CallNode);
      break;
    default:
      throw new ParseError(ParseErrorCode.NotImpl, undefined, 'Not implemented');
  }
}

export function renderModule(ast: ModuleNode) {
  let modelBlock = new TextBlock(undefined, ast);

  for (let on of ast.on) {
    renderNode(modelBlock, on);
  }

  for (let p of ast.procs) {
    renderNode(modelBlock, p);
  }

  return modelBlock;
}

function renderFuncDef(parentBlock: TextBlock, ast: FuncDefNode) {
  let ctx = parentBlock.appendBlock(ast);

  let line = ctx.appendLine('proc');
  line.appendToken(ast.name);
  line.appendConst('(');

  renderParams(line, ast.params);
  if (ast.returnType) {
    line.appendConst((':'));
    line.appendToken(ast.returnType);
  }
  line.appendConst('begin');
  renderBlock(ctx, ast.body);
  ctx.appendLine('end');
}

function renderParams(line: TextLine, params: ParamDefNode[]) {
  let addComma = false;
  for (let param of params) {
    if (addComma) {
      line.appendConst((','));
    }
    line.appendToken(param.name);
    line.appendConst((':'));
    line.appendToken(param.paramType);
  }
}

function renderBlock(parentBlock: TextBlock, block: BlockNode | Function) {
  if (block instanceof Function) {
    // ???
  } else {
    let ctx = parentBlock.appendBlock(block);
    for (let node of block.statements) {
      renderNode(ctx, node);
    }
  }
}

function renderOn(parentBlock: TextBlock, ast: OnNode) {
  let ctx = parentBlock.appendBlock(ast);

  let line = ctx.appendLine('on');
  line.appendToken(ast.name);
  line.appendConst('(', false);
  if (ast.params.length > 0) {
    renderParams(line, ast.params);
    line.appendConst(')');
  } else {
    line.appendConst(')', false);
  }

  line.appendConst('begin');
  renderBlock(ctx, ast.body);

  ctx.appendLine('end');
}

function renderVarDef(parentBlock: TextBlock, ast: VarDefNode) {
  let ctx = new TextBlock(parentBlock, ast);
  let line = ctx.appendLine('var');
  line.appendToken(ast.name);
  if (ast.value) {
    line.appendConst(':=');
    renderExpression(line, ast.value);
  }
  return ctx;
}

function renderAssingment(parentBlock: TextBlock, ast: AssingmentNode) {
  let line = parentBlock.appendLine(undefined);
  line.appendToken(ast.name);
  line.appendConst(':=');
  renderExpression(line, ast.value);
}

function renderIf(parentBlock: TextBlock, ast: IfNode): TextBlock {
  let ctx = new TextBlock(parentBlock, ast);
  let ifline = ctx.appendLine(undefined);
  ctx.appendLine(ifline);
  ifline.appendConst('if');
  renderExpression(ifline, ast.exp);
  ifline.appendConst('then');
  renderBlock(parentBlock, ast.th);
  if (ast.elif.length > 0) {
    for (let block of ast.elif) {
      ifline.appendConst('elif');
      renderExpression(ifline, ast.exp);
      ifline.appendConst('then');
      renderBlock(ctx, block.block);
    }
  }
  if (ast.el) {
    ifline.appendConst('else');
    renderBlock(ctx, ast.el);
  }
  ctx.appendLine('end');
  return ctx;
}

function renderFor(parentBlock: TextBlock, ast: ForNode) {
  let ctx = parentBlock.appendBlock(ast);
  let line = ctx.appendLine('for');
  line.appendToken(ast.name)
  line.appendConst(':=');
  renderExpression(line, ast.startExp);
  line.appendConst('to');
  renderExpression(line, ast.endExp);
  if (ast.byExp) {
    line.appendConst('by');
    renderExpression(line, ast.byExp);
  }
  line.appendConst('do');

  renderBlock(ctx, ast.body);

  ctx.appendLine('end');
}

function renderForeach(parentBlock: TextBlock, ast: ForeachNode) {
  let ctx = parentBlock.appendBlock(ast);
  let line = ctx.appendLine('foreach');
  line.appendToken(ast.name)
  line.appendConst('in');
  renderExpression(line, ast.exp);
  line.appendConst('do');

  renderBlock(ctx, ast.body);

  ctx.appendLine('end');
}

function renderForever(parentBlock: TextBlock, ast: ForeverNode) {
  let ctx = parentBlock.appendBlock(ast);
  let line = ctx.appendLine('forever');
  line.appendConst('do');

  renderBlock(ctx, ast.body);

  ctx.appendLine('end');
}
function renderExpressionPart(line: ITextSegment, ast: AstNode) {
  if (ast.kind === AstNodeKind.id) {
    line.appendToken((ast as IdNode).name);
  } else if (ast.kind === AstNodeKind.const) {
    line.appendToken((ast as ConstNode).value);
  } else if (ast.kind === AstNodeKind.call) {
    renderCall(line, ast as CallNode);
  } else if (ast.kind === AstNodeKind.expression) {
    renderExpression(line, ast as ExpressionNode);
  } else {
    throw new AstError(AstErrorCode.invalidNode, ast, 'Unsupported formatting code');
  }
}

function renderExpression(line: ITextSegment, ast: ExpressionNode) {
  if (ast.left) {
    renderExpressionPart(line, ast.left);
  }

  if (ast.op) {
    line.appendToken(ast.op.op);
  }

  if (ast.right) {
    renderExpressionPart(line, ast.right);
  }
}
function renderBreak(parentBlock: TextBlock, arg1: AstNode) {
  parentBlock.appendLine('break');
}

function renderReturn(parentBlock: TextBlock, ast: ReturnNode) {
  let line = parentBlock.appendLine('return');
  if (ast.value) {
    renderExpression(line, ast.value);
  }
}

function renderWhile(parentBlock: TextBlock, ast: WhileNode) {
  let ctx = parentBlock.appendBlock(ast);
  let line = ctx.appendLine('while');
  renderExpression(line, ast.exp);
  line.appendConst('do');

  renderBlock(ctx, ast.body);

  ctx.appendLine('end');
}

function renderCall(block: ITextSegment | TextBlock, ast: CallNode) {

  let line: ITextSegment;
  if (block instanceof TextBlock) {
    line = block.appendLine(undefined);
  } else {
    line = block as TextLine;
  }

  line.appendToken(ast.name);

  // wrap parameters to span
  let seg = line.appendSegment(false);

  // 
  for (let param of ast.params) {
    renderExpressionPart(seg, param);
  }
}

