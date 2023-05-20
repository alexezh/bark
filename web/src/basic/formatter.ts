import { AssingmentNode, AstNode, AstNodeKind, BlockNode, CallNode, ExpressionNode, ForeachNode, ForNode, ForeverNode, FuncDefNode, IfNode, OnNode, ParamDefNode, ReturnNode, StatementNode, VarDefNode, WhileNode } from "./ast";
import { ParseError, ParseErrorCode } from "./parseerror";
import { Token, TokenKind } from "./token";

export class RenderToken {
  private data: Token;

  public static fromString(val: string): RenderToken {
    return new RenderToken(new Token(TokenKind.String, val, 0));
  }

  public constructor(token: Token) {
    this.data = token;
  }
}

export class RenderBlock {
  private parent: RenderBlock | undefined;
  private root: AstNode;
  private lines: RenderLine[] = [];

  public constructor(parent: RenderBlock | undefined, root: AstNode) {
    this.parent = parent;
    this.root = root;
  }

  public addLine(line: RenderLine | string) {
    if (typeof (line) === 'string') {
      let lc = new RenderLine();
      lc.appendConst(line);
      this.lines.push(lc);
    } else {
      this.lines.push(line);
    }
  }
}

export class RenderLine {
  private tokens: RenderToken[] = [];

  public appendConst(val: string): void {
    this.tokens.push(RenderToken.fromString(val));
  }

  public appendToken(token: Token) {
    this.tokens.push(new RenderToken(token))
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

function renderFuncDef(rb: RenderBlock, ast: FuncDefNode) {
  let ctx = new RenderBlock(rb, ast);

  let line = new RenderLine();
  line.appendConst('proc');
  line.appendToken(ast.name);
  line.appendConst('(');

  renderParams(line, ast.params);
  if (ast.returnType) {
    line.appendConst((':'));
    line.appendToken(ast.returnType);
  }
  line.appendConst('begin');
  ctx.addLine(line);
  renderBlock(ctx, ast.body);
  ctx.addLine('end');
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

function renderBlock(rb: RenderBlock, block: BlockNode | Function) {
  if (block instanceof Function) {
    // ???
  } else {
    for (let node of block.statements) {
      renderNode(rb, node);
    }
  }
}

function renderOn(rb: RenderBlock, ast: OnNode) {
  let ctx = new RenderBlock(rb, ast);

  let line = new RenderLine();
  line.appendConst('on');
  line.appendToken(ast.name);
  line.appendConst('(');

  line.appendConst('begin');
  ctx.addLine(line);
  renderBlock(ctx, ast.body);

  ctx.addLine('end');
}

function renderVarDef(rb: RenderBlock, ast: VarDefNode) {
  throw new Error("Function not implemented.");
}

function renderAssingment(rb: RenderBlock, ast: AssingmentNode) {
  throw new Error("Function not implemented.");
}

function renderIf(rb: RenderBlock, ast: IfNode) {
  let ctx = new RenderBlock(rb, ast);
  let ifline = new RenderLine();
  ctx.addLine(ifline);
  ifline.appendConst('if');
  renderExpression(ifline, ast.exp);
  ifline.appendConst('then');
  renderBlock(rb, ast.th);
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
  ctx.addLine('end');
}

function renderFor(rb: RenderBlock, ast: ForNode) {
  throw new Error("Function not implemented.");
}

function renderForeach(rb: RenderBlock, ast: ForeachNode) {
  throw new Error("Function not implemented.");
}

function renderForever(rb: RenderBlock, ast: ForeverNode) {
  throw new Error("Function not implemented.");
}

function renderExpression(line: RenderLine, ast: ExpressionNode) {

}
function renderBreak(rb: RenderBlock, arg1: AstNode) {
  throw new Error("Function not implemented.");
}

function renderReturn(rb: RenderBlock, arg1: ReturnNode) {
  throw new Error("Function not implemented.");
}

function renderWhile(rb: RenderBlock, arg1: WhileNode) {
  throw new Error("Function not implemented.");
}

function renderCall(rb: RenderBlock, arg1: CallNode) {
  throw new Error("Function not implemented.");
}

