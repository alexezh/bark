import { AssingmentNode, AstNode, AstNodeKind, BlockNode, CallNode, ExpressionNode, ForeachNode, ForNode, ForeverNode, FuncDefNode, IfNode, OnNode, ParamDefNode, ReturnNode, StatementNode, VarDefNode, WhileNode, ModuleNode, IdNode, AstErrorCode, AstError, ConstNode } from "./ast";
import { ParseError, ParseErrorCode } from "./parseerror";
import { ATextSegment, TextBlock, TextLine, TextSpan } from "./textblock";
import { Token, TokenKind } from "./token";


export function isParentNode(parent: TextBlock | ATextSegment | TextSpan, node: TextBlock | ATextSegment | TextSpan): boolean {
  if (parent === node) {
    return true;
  }

  if (parent instanceof TextSpan) {
    return false;
  }

  let cur = node.parent;
  while (cur) {
    if (cur === parent) {
      return true;
    }
    cur = cur.parent;
  }

  return false;
}

export function findParentNode(node: TextBlock | ATextSegment | TextSpan): TextBlock | ATextSegment | undefined {
  if (!node) {
    return undefined;
  }

  let cur: TextBlock | ATextSegment | undefined = node.parent;
  while (cur) {
    if (cur.ast !== undefined) {
      return cur;
    }
    cur = cur.parent;
  }

  return undefined;
}

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

  for (let p of ast.funcs) {
    renderNode(modelBlock, p);
  }

  return modelBlock;
}

function renderFuncDef(parentBlock: TextBlock, ast: FuncDefNode) {
  let ctx = parentBlock.appendBlock(ast, { css: 'code-function' });

  let line = ctx.appendLine('function', ast, { selectable: false });
  line.appendToken(ast.name!, { selectable: true });
  line.appendConst('(', { selectable: false });

  renderParams(line, ast.params);
  if (ast.returnType) {
    line.appendConst(':', { selectable: false });
    line.appendToken(ast.returnType, {});
  }
  line.appendConst('begin', { selectable: false });
  renderBlock(ctx, ast.body);
  ctx.appendLine('end', undefined, { selectable: false });
  parentBlock.appendEmptyLine(undefined, { selectable: false });
}

function renderOn(parentBlock: TextBlock, ast: OnNode) {
  let ctx = parentBlock.appendBlock(ast, { css: 'code-on' });

  let line = ctx.appendLine('on', undefined, { selectable: false });
  line.appendToken(ast.event, {});
  if (ast.filter) {
    line.appendConst('=', { spaceLeft: false, selectable: false });
    line.appendToken(ast.filter, { spaceLeft: false });
  }


  line.appendConst('function', { spaceLeft: true, selectable: false });
  line.appendConst('(', { spaceLeft: false, selectable: false });
  if (ast.params.length > 0) {
    renderParams(line, ast.params);
    line.appendConst(')', { selectable: false });
  } else {
    line.appendConst(')', { selectable: false });
  }

  line.appendConst('begin', { selectable: false });
  renderBlock(ctx, ast.body);

  ctx.appendLine('end', undefined, { selectable: false });
  parentBlock.appendEmptyLine(undefined, { selectable: false });
}

function renderParams(line: TextLine, params: ParamDefNode[]) {
  let addComma = false;
  for (let param of params) {
    if (addComma) {
      line.appendConst(',', { selectable: false });
    }
    line.appendToken(param.name, {});
    line.appendConst(':', { selectable: false });
    line.appendToken(param.paramType, {});
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

function renderVarDef(parentBlock1: TextBlock, ast: VarDefNode) {
  let line = parentBlock1.appendLine('var', ast, { css: 'code-var' });
  line.appendToken(ast.name, {});
  if (ast.value) {
    line.appendConst(':=', { selectable: false });
    renderExpression(line, ast.value);
  }
}

function renderAssingment(parentBlock: TextBlock, ast: AssingmentNode) {
  let line = parentBlock.appendLine(undefined, ast, { css: 'code-var' });
  line.appendToken(ast.name, {});
  line.appendConst(':=', { selectable: false });
  renderExpression(line, ast.value);
}

function renderIf(parentBlock: TextBlock, ast: IfNode) {
  let ctx = parentBlock.appendBlock(ast, { css: 'code-block' });
  let ifline = ctx.appendLine(undefined, undefined, {});
  ifline.appendConst('if', {});
  renderExpression(ifline, ast.exp);
  ifline.appendConst('then', {});

  renderBlock(ctx, ast.th);
  if (ast.elif.length > 0) {
    for (let block of ast.elif) {
      let eifline = ctx.appendLine(undefined, undefined, {});
      eifline.appendConst('elif', {});
      renderExpression(eifline, ast.exp);
      eifline.appendConst('then', {});
      renderBlock(ctx, block.block);
    }
  }
  if (ast.el) {
    let eline = ctx.appendLine(undefined, undefined, {});
    eline.appendConst('else', {});
    renderBlock(ctx, ast.el);
  }
  ctx.appendLine('end', undefined, {});
}

function renderFor(parentBlock: TextBlock, ast: ForNode) {
  let ctx = parentBlock.appendBlock(ast, { css: 'code-block' });
  let line = ctx.appendLine('for', undefined, {});
  line.appendToken(ast.name, {})
  line.appendConst(':=', { selectable: false });
  renderExpression(line, ast.startExp);
  line.appendConst('to', { selectable: false });
  renderExpression(line, ast.endExp);
  if (ast.byExp) {
    line.appendConst('by', { selectable: false });
    renderExpression(line, ast.byExp);
  }
  line.appendConst('do', { selectable: false });

  renderBlock(ctx, ast.body);

  ctx.appendLine('end', undefined, { selectable: false });
}

function renderForeach(parentBlock: TextBlock, ast: ForeachNode) {
  let ctx = parentBlock.appendBlock(ast);
  let line = ctx.appendLine('foreach', undefined, {});
  line.appendToken(ast.name, {})
  line.appendConst('in', { selectable: false });
  renderExpression(line, ast.exp);
  line.appendConst('do', { selectable: false });

  renderBlock(ctx, ast.body);

  ctx.appendLine('end', undefined, {});
}

function renderForever(parentBlock: TextBlock, ast: ForeverNode) {
  let ctx = parentBlock.appendBlock(ast);
  let line = ctx.appendLine('forever', undefined, {});
  line.appendConst('do', { selectable: false });

  renderBlock(ctx, ast.body);

  ctx.appendLine('end', undefined, { selectable: false });
}
function renderExpressionPart(line: ATextSegment, ast: AstNode, spaceLeft: boolean | undefined = undefined) {
  if (ast.kind === AstNodeKind.id) {
    line.appendToken((ast as IdNode).name, { spaceLeft: spaceLeft });
  } else if (ast.kind === AstNodeKind.const) {
    line.appendToken((ast as ConstNode).value, { spaceLeft: spaceLeft });
  } else if (ast.kind === AstNodeKind.call) {
    renderCall(line, ast as CallNode);
  } else if (ast.kind === AstNodeKind.expression) {
    renderExpression(line, ast as ExpressionNode);
  } else {
    throw new AstError(AstErrorCode.invalidNode, ast, 'Unsupported formatting code');
  }
}

function renderExpression(line: ATextSegment, ast: ExpressionNode, spaceLeft: boolean | undefined = undefined) {
  if (ast.left) {
    renderExpressionPart(line, ast.left);
  }

  if (ast.op) {
    line.appendToken(ast.op.op, { spaceLeft: spaceLeft });
  }

  if (ast.right) {
    renderExpressionPart(line, ast.right);
  }
}
function renderBreak(parentBlock: TextBlock, ast: AstNode) {
  parentBlock.appendLine('break', ast, {});
}

function renderReturn(parentBlock: TextBlock, ast: ReturnNode) {
  let line = parentBlock.appendLine('return', ast, {});
  if (ast.value) {
    renderExpression(line, ast.value);
  }
}

function renderWhile(parentBlock: TextBlock, ast: WhileNode) {
  let ctx = parentBlock.appendBlock(ast);
  let line = ctx.appendLine('while', undefined, {});
  renderExpression(line, ast.exp);
  line.appendConst('do', {});

  renderBlock(ctx, ast.body);

  ctx.appendLine('end', undefined, {});
}

/**
 * return true if call requires parenthesis
 * this happens if call is second in chain, or if call has parameter starting with operator
 */
function requireParenthesis(block: ATextSegment | TextBlock): boolean {
  let node: ATextSegment | TextBlock | undefined = block;
  while (node) {
    if (node.ast !== undefined) {
      if (node.ast.kind === AstNodeKind.call) {
        return true;
      }
    }
    node = node.parent;
  }
  return false;
}

function renderCall(block: ATextSegment | TextBlock, ast: CallNode, spaceLeft: boolean | undefined = undefined) {

  let line: ATextSegment;
  if (block instanceof TextBlock) {
    line = block.appendLine(undefined, undefined, {});
  } else {
    line = block as TextLine;
  }

  // wrap parameters to span
  let seg = line.appendSegment(ast, { spaceLeft: true, css: 'code-call' });

  seg.appendToken(ast.name, { spaceLeft: spaceLeft });

  // check if it is safe to render without parentesys
  let parenthesis = requireParenthesis(block);
  if (parenthesis) {
    seg.appendConst('(', { spaceLeft: false, selectable: false });
  }

  let addComma = false;
  for (let param of ast.params) {
    if (parenthesis && addComma) {
      seg.appendConst(',', { spaceLeft: false, selectable: false });
    }
    addComma = true;
    renderExpressionPart(seg, param);
  }

  if (parenthesis) {
    seg.appendConst(')', { spaceLeft: false, selectable: false });
  }
}

