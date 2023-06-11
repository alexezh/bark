import { AssingmentNode, AstNode, AstNodeKind, BlockNode, CallNode, ExpressionNode, ForeachNode, ForNode, ForeverNode, FuncDefNode, IfNode, OnNode, ParamDefNode, ReturnNode, StatementNode, VarDefNode, WhileNode, ModuleNode, IdNode, AstErrorCode, AstError, ConstNode } from "./ast";
import { ParseError, ParseErrorCode } from "./parseerror";
import { ATextSegment, TextBlock, TextLine, TextModule, TextSpan } from "./textblock";


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

type RenderCtx = {
  nodes: Map<string, TextBlock | ATextSegment | TextSpan>;
}

/**
 * convers tree to array of lines
 */
export function renderNode(rb: TextBlock, ast: AstNode): TextBlock | TextLine {

  switch (ast.kind) {
    case AstNodeKind.funcDef:
      return renderFuncDef(rb, ast as FuncDefNode);
    case AstNodeKind.on:
      return renderOn(rb, ast as OnNode);
    case AstNodeKind.varDef:
      return renderVarDef(rb, ast as VarDefNode);
    case AstNodeKind.assingment:
      return renderAssingment(rb, ast as AssingmentNode);
    case AstNodeKind.if:
      return renderIf(rb, ast as IfNode);
    case AstNodeKind.for:
      return renderFor(rb, ast as ForNode);
    case AstNodeKind.foreach:
      return renderForeach(rb, ast as ForeachNode);
    case AstNodeKind.forever:
      return renderForever(rb, ast as ForeverNode);
    case AstNodeKind.while:
      return renderWhile(rb, ast as WhileNode);
    case AstNodeKind.return:
      return renderReturn(rb, ast as ReturnNode);
    case AstNodeKind.break:
      return renderBreak(rb, ast as StatementNode);
    case AstNodeKind.block:
      return renderBlock(rb, ast as BlockNode);
    case AstNodeKind.call:
      return renderCall(rb, ast as CallNode);
    case AstNodeKind.comment:
      return renderComment(rb, ast as CallNode);
    case AstNodeKind.placeholder:
      return renderPlaceholder(rb, ast as CallNode);
    default:
      throw new ParseError(ParseErrorCode.NotImpl, undefined, 'Not implemented');
  }
}

export function renderModule(ast: ModuleNode): TextModule {
  let tm = new TextModule();
  let modelBlock = new TextBlock(tm, undefined, ast);
  tm.setRoot(modelBlock);
  let ctx: RenderCtx = { nodes: new Map<string, TextBlock | ATextSegment | TextSpan>() };

  for (let v of ast.vars) {
    renderNode(modelBlock, v);
  }

  for (let on of ast.on) {
    renderNode(modelBlock, on);
  }

  for (let p of ast.funcs) {
    renderNode(modelBlock, p);
  }

  return tm;
}

function renderFuncDef(parentBlock: TextBlock, ast: FuncDefNode): TextBlock {
  let funcBlock = parentBlock.appendBlock(ast, { css: 'code-function' });

  let line = funcBlock.appendLine('function', ast, { selectable: false });
  line.appendToken(ast.name!, { selectable: true });
  line.appendConst('(', { selectable: false });

  renderParams(line, ast.params);
  if (ast.returnType) {
    line.appendConst(':', { selectable: false });
    line.appendToken(ast.returnType, {});
  }
  line.appendConst('begin', { selectable: false });
  renderBlock(funcBlock, ast.body);
  funcBlock.appendLine('end', undefined, { selectable: false });
  parentBlock.appendEmptyLine(undefined, { selectable: false });
  return funcBlock;
}

function renderOn(parentBlock: TextBlock, ast: OnNode): TextBlock {
  let onBlock = parentBlock.appendBlock(ast, { css: 'code-on' });

  let line = onBlock.appendLine('on', undefined, { selectable: false });
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
  renderBlock(onBlock, ast.body);

  onBlock.appendLine('end', undefined, { selectable: false });
  parentBlock.appendEmptyLine(undefined, { selectable: false });

  return onBlock;
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

function renderBlock(parentBlock: TextBlock, block: BlockNode | Function): TextBlock | TextLine {
  if (block instanceof Function) {
    // ???
    console.warn('renderBlock: cannot render system call');
    let ctx = parentBlock.appendLine('native function', undefined, {});
    return ctx;
  } else {
    let blockBlock = parentBlock.appendBlock(block);
    blockBlock.renderBlock = () => {
      for (let node of block.statements) {
        let nodeBlock = renderNode(blockBlock, node);
        nodeBlock.style.insertAbove = true;
        nodeBlock.style.insertBelow = true;
      }
    };
    blockBlock.renderBlock();
    return blockBlock;
  }
}

function renderVarDef(parentBlock: TextBlock, ast: VarDefNode): TextLine {
  let line = parentBlock.appendLine('var', ast, { css: 'code-var' });
  line.appendToken(ast.name, {});
  if (ast.value) {
    line.appendConst(':=', { selectable: false });
    renderExpression(line, ast.value);
  }
  return line;
}

function renderAssingment(parentBlock: TextBlock, ast: AssingmentNode): TextLine {
  let line = parentBlock.appendLine(undefined, ast, { css: 'code-var' });
  line.appendToken(ast.name, {});
  line.appendConst(':=', { selectable: false });
  renderExpression(line, ast.value);
  return line;
}

function renderIf(parentBlock: TextBlock, ast: IfNode): TextBlock {
  let ifBlock = parentBlock.appendBlock(ast, { css: 'code-block' });
  ifBlock.renderBlock = () => {
    let ifline = ifBlock.appendLine(undefined, ast.exp, {});
    ifline.appendConst('if', {});
    renderExpression(ifline, ast.exp);
    ifline.appendConst('then', {});

    renderBlock(ifBlock, ast.th);
    if (ast.elif.length > 0) {
      for (let block of ast.elif) {
        let eifline = ifBlock.appendLine(undefined, block.exp, {});
        eifline.appendConst('elif', {});
        renderExpression(eifline, ast.exp);
        eifline.appendConst('then', {});
        renderBlock(ifBlock, block.block);
      }
    }
    if (ast.el) {
      let eline = ifBlock.appendLine(undefined, ast.el, {});
      eline.appendConst('else', {});
      renderBlock(ifBlock, ast.el);
    }
    ifBlock.appendLine('end', undefined, {});
  }
  ifBlock.renderBlock();

  return ifBlock;
}

function renderFor(parentBlock: TextBlock, ast: ForNode): TextBlock {
  let forBlock = parentBlock.appendBlock(ast, { css: 'code-block' });
  forBlock.renderBlock = () => {
    let line = forBlock.appendLine('for', undefined, {});
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

    renderBlock(forBlock, ast.body);

    forBlock.appendLine('end', undefined, { selectable: false });
  }
  forBlock.renderBlock();
  return forBlock;
}

function renderForeach(parentBlock: TextBlock, ast: ForeachNode): TextBlock {
  let foreachBlock = parentBlock.appendBlock(ast);
  foreachBlock.renderBlock = () => {
    let line = foreachBlock.appendLine('foreach', undefined, {});
    line.appendToken(ast.name, {})
    line.appendConst('in', { selectable: false });
    renderExpression(line, ast.exp);
    line.appendConst('do', { selectable: false });

    renderBlock(foreachBlock, ast.body);

    foreachBlock.appendLine('end', undefined, {});
  }
  foreachBlock.renderBlock();

  return foreachBlock;
}

function renderForever(parentBlock: TextBlock, ast: ForeverNode): TextBlock {
  let foreverBlock = parentBlock.appendBlock(ast);
  foreverBlock.renderBlock = () => {
    let line = foreverBlock.appendLine('forever', undefined, {});
    line.appendConst('do', { selectable: false });

    renderBlock(foreverBlock, ast.body);

    foreverBlock.appendLine('end', undefined, { selectable: false });
  }
  foreverBlock.renderBlock();
  return foreverBlock;
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
function renderBreak(parentBlock: TextBlock, ast: AstNode): TextLine {
  return parentBlock.appendLine('break', ast, {});
}

function renderPlaceholder(parentBlock: TextBlock, ast: AstNode): TextLine {
  return parentBlock.appendLine(undefined, ast, {});
}

function renderComment(parentBlock: TextBlock, ast: AstNode): TextLine {
  return parentBlock.appendLine('//', ast, {});
}

function renderReturn(parentBlock: TextBlock, ast: ReturnNode): TextLine {
  let line = parentBlock.appendLine('return', ast, {});
  if (ast.value) {
    renderExpression(line, ast.value);
  }
  return line;
}

function renderWhile(parentBlock: TextBlock, ast: WhileNode): TextBlock {
  let whileBlock = parentBlock.appendBlock(ast);
  whileBlock.renderBlock = () => {
    let line = whileBlock.appendLine('while', undefined, {});
    renderExpression(line, ast.exp);
    line.appendConst('do', {});

    renderBlock(whileBlock, ast.body);

    whileBlock.appendLine('end', undefined, {});
  }
  whileBlock.renderBlock();

  return whileBlock;
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

function renderCall(block: ATextSegment | TextBlock, ast: CallNode, spaceLeft: boolean | undefined = undefined): TextLine {

  let line: ATextSegment;
  if (block instanceof TextBlock) {
    line = block.appendLine(undefined, ast, {});
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

  return line;
}

