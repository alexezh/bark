import { ModuleName } from "webpack-cli";
import { AssingmentNode, AstNode, AstNodeKind, BlockNode, CallNode, ExpressionNode, ForeachNode, ForNode, ForeverNode, FuncDefNode, IfNode, OnNode, ParamDefNode, ReturnNode, StatementNode, VarDefNode, WhileNode, ModuleNode, IdNode } from "./ast";
import { ParseError, ParseErrorCode } from "./parseerror";
import { Token, TokenKind } from "./token";
import { isConstTokenKind } from "./lexer";

export class RenderSpan {
  private data: Token | RenderSpan[];
  private spaceLeft: boolean = false;

  public static fromString(val: string, spaceLeft: boolean = false): RenderSpan {
    return new RenderSpan(new Token(TokenKind.String, val, 0), spaceLeft);
  }

  public constructor(token: Token, spaceLeft: boolean = false) {
    this.data = token;
  }

  public render(elem: HTMLSpanElement | HTMLDivElement) {
    if (this.spaceLeft) {
      let space = document.createElement('span');
      space.textContent = ' ';
      elem.appendChild(space);
    }

    let t = document.createElement('span');
    if (this.data instanceof Token) {
      t.textContent = this.data.value;
    } else {
      for (let child of this.data) {
        child.render(t);
      }
    }
    elem.appendChild(t);
  }
}

// block is either line or collection of blocks and lines
export class RenderBlock {
  private parent: RenderBlock | undefined;
  private ast: AstNode;
  private children: (RenderLine | RenderBlock)[] = [];

  public constructor(parent: RenderBlock | undefined, root: AstNode) {
    this.parent = parent;
    this.ast = root;
  }

  public appendBlock(ast: AstNode): RenderBlock {
    let block = new RenderBlock(this, ast);
    this.children.push(block);
    return block;
  }

  public appendLine(line: RenderLine | string | Token | undefined): RenderLine {
    if (line === undefined) {
      let lc = new RenderLine();
      this.children.push(lc);
      return lc;
    } else if (typeof (line) === 'string') {
      let lc = new RenderLine();
      lc.appendConst(line);
      this.children.push(lc);
      return lc;
    } else if (line instanceof Token) {
      let lc = new RenderLine();
      lc.appendToken(line);
      this.children.push(lc);
      return lc;
    } else {
      this.children.push(line);
      return line;
    }
  }

  public render(parent: HTMLDivElement) {
    let div = document.createElement('div');
    for (let child of this.children) {
      if (child instanceof RenderBlock) {
        child.render(div);
      } else if (child instanceof RenderLine) {
        child.render(parent);
      }
    }

    parent.appendChild(div);
  }
}

export class RenderLine {
  private tokens: RenderSpan[] = [];

  public appendConst(val: string): void {
    let spaceLeft = this.tokens.length > 0;
    this.tokens.push(RenderSpan.fromString(val, spaceLeft));
  }

  public appendToken(token: Token) {
    let spaceLeft = this.tokens.length > 0;
    this.tokens.push(new RenderSpan(token, spaceLeft))
  }

  public render(elem: HTMLDivElement) {
    let line = document.createElement('div');
    for (let token of this.tokens) {
      token.render(line);
    }
    elem.appendChild(line);
  }
}

/**
 * convers tree to array of lines
 */
export function renderNode(rb: RenderBlock, ast: AstNode) {

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
  let modelBlock = new RenderBlock(undefined, ast);

  for (let on of ast.on) {
    renderNode(modelBlock, on);
  }

  for (let p of ast.procs) {
    renderNode(modelBlock, p);
  }

  return modelBlock;
}

function renderFuncDef(parentBlock: RenderBlock, ast: FuncDefNode) {
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

function renderParams(line: RenderLine, params: ParamDefNode[]) {
  let addComma = false;
  for (let param of params) {
    if (addComma) {
      line.appendConst((','));
    }
    line.appendToken(param.name);
    line.appendConst((':'));
    line.appendToken(param.paramType);
  }
  line.appendConst((')'));
}

function renderBlock(parentBlock: RenderBlock, block: BlockNode | Function) {
  if (block instanceof Function) {
    // ???
  } else {
    let ctx = parentBlock.appendBlock(block);
    for (let node of block.statements) {
      renderNode(ctx, node);
    }
  }
}

function renderOn(parentBlock: RenderBlock, ast: OnNode) {
  let ctx = parentBlock.appendBlock(ast);

  let line = ctx.appendLine('on');
  line.appendToken(ast.name);
  line.appendConst('(');
  renderParams(line, ast.params);
  line.appendConst(')');

  line.appendConst('begin');
  renderBlock(ctx, ast.body);

  ctx.appendLine('end');
}

function renderVarDef(parentBlock: RenderBlock, ast: VarDefNode) {
  let ctx = new RenderBlock(parentBlock, ast);
  let line = ctx.appendLine('var');
  line.appendToken(ast.name);
  if (ast.value) {
    line.appendConst(':=');
    renderExpression(line, ast.value);
  }
  return ctx;
}

function renderAssingment(parentBlock: RenderBlock, ast: AssingmentNode) {
  let line = parentBlock.appendLine(undefined);
  line.appendToken(ast.name);
  line.appendConst(':=');
  renderExpression(line, ast.value);
}

function renderIf(parentBlock: RenderBlock, ast: IfNode): RenderBlock {
  let ctx = new RenderBlock(parentBlock, ast);
  let ifline = new RenderLine();
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

function renderFor(parentBlock: RenderBlock, ast: ForNode) {
  parentBlock.appendLine('while');
}

function renderForeach(parentBlock: RenderBlock, ast: ForeachNode) {
  parentBlock.appendLine('while');
}

function renderForever(parentBlock: RenderBlock, ast: ForeverNode) {
  parentBlock.appendLine('while');
}

function renderExpressionPart(line: RenderLine, ast: AstNode) {
  if (ast.kind === AstNodeKind.id) {
    line.appendToken((ast as IdNode).name);
  }
}

function renderExpression(line: RenderLine, ast: ExpressionNode) {
  if (ast.left) {
    renderExpressionPart(line, ast.left);
  }

  if (ast.right) {
    renderExpressionPart(line, ast.right);
  }
}
function renderBreak(parentBlock: RenderBlock, arg1: AstNode) {
  parentBlock.appendLine('break');
}

function renderReturn(parentBlock: RenderBlock, ast: ReturnNode) {
  let line = parentBlock.appendLine('return');
  if (ast.value) {
    renderExpression(line, ast.value);
  }
}

function renderWhile(parentBlock: RenderBlock, arg1: WhileNode) {
  parentBlock.appendLine('while');
}

function renderCall(block: RenderLine | RenderBlock, ast: CallNode) {
  if (block instanceof RenderLine) {
    block.appendToken(ast.name);
  } else {
    block.appendLine(ast.name);
  }
}

