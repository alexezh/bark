import { AssingmentNode, AstNode, AstNodeKind, BlockNode, CallNode, ConstNode, ExpressionNode, ForEachNode, ForNode, FuncDefNode, IdNode, IfNode, ModuleNode, OnNode, OpNode, ReturnNode, StatementNode, VarDefNode, WhileNode } from "./ast";
import { JsWriter } from "./jswriter";
import { ModuleCache } from "./modulecache";
import { ParseError, ParseErrorCode } from "./parseerror";
import { Token, TokenKind } from "./token";

/**
 * generates Js function from ast
 */

export function transpile(ast: ModuleNode, mainFunction: string, moduleCache: ModuleCache | undefined = undefined): Function {
  let writer: JsWriter = new JsWriter();

  // wrap to unnamed function which calls main
  if (moduleCache !== undefined) {
    moduleCache.writeModuleVars('__loader', writer);
  }

  processModule(ast as ModuleNode, writer);

  writer.append(`return ${mainFunction}();`)

  let jsText = writer.toString();
  return new Function('__loader', jsText);
}

function processNode(ast: AstNode, writer: JsWriter) {
  switch (ast.kind) {
    case AstNodeKind.funcDef:
      processFuncDef(ast as FuncDefNode, writer);
      break;
    case AstNodeKind.varDef:
      processVarDef(ast as VarDefNode, writer);
      break;
    case AstNodeKind.assingment:
      processAssingment(ast as AssingmentNode, writer);
      break;
    case AstNodeKind.if:
      processIf(ast as IfNode, writer);
      break;
    case AstNodeKind.for:
      processFor(ast as ForNode, writer);
      break;
    case AstNodeKind.foreach:
      processForEach(ast as ForEachNode, writer);
      break;
    case AstNodeKind.while:
      processWhile(ast as WhileNode, writer);
      break;
    case AstNodeKind.return:
      processReturn(ast as ReturnNode, writer);
      break;
    case AstNodeKind.break:
      processBreak(ast as StatementNode, writer);
      break;
    case AstNodeKind.block:
      processBlock(ast as BlockNode, writer);
      break;
    case AstNodeKind.call:
      processCall(ast as CallNode, writer);
      break;
    case AstNodeKind.on:
      processOn(ast as OnNode, writer);
      break;
    default:
      throw new ParseError(ParseErrorCode.NotImpl, undefined, 'Not implemented');
  }
}

function processModule(ast: ModuleNode, writer: JsWriter) {
  for (let n of ast.children) {
    processNode(n, writer);
  }
}

function processBlock(ast: BlockNode, writer: JsWriter) {
  for (let n of ast.statements) {
    processNode(n, writer);
  }
}

function processFuncDef(ast: FuncDefNode, writer: JsWriter) {
  let params: string[] = [];
  for (let t of ast.params) {
    params.push(t.name.value);
  }

  if (ast.body instanceof Function) {
    // nothing for us to do here
  } else {
    if (ast.isAsync) {
      writer.append(`async function ${ast.name.value}(${params.join(',')}) {`);
    } else {
      writer.append(`function ${ast.name.value}(${params.join(',')}) {`);
    }
    for (let s of ast.body.statements) {
      processNode(s, writer);
    }
  }
  writer.append(`}`);
}

function processVarDef(ast: VarDefNode, writer: JsWriter) {
  if (ast.value !== undefined) {
    let expStr = convertExpression(ast.value, writer);
    writer.append(`let ${ast.name.value} = ${expStr};`);
  } else {
    writer.append(`let ${ast.name.value};`);
  }
}

function processAssingment(ast: AssingmentNode, writer: JsWriter) {
  let expStr = convertExpression(ast.value, writer);
  writer.append(`${ast.name.value} = ${expStr};`);
}

function processIf(ast: IfNode, writer: JsWriter) {
  let expStr = convertExpression(ast.exp, writer);
  writer.append(`if( ${expStr} ) {`);
  processBlock(ast.th, writer);
  if (ast.elif.length > 0) {
    for (let elif of ast.elif) {
      let expStr = convertExpression(elif.exp, writer);
      writer.append(`} else if( ${expStr} ) {`);
      processBlock(elif.block, writer);
    }
  }
  if (ast.el !== undefined) {
    writer.append(`} else {`);
    processBlock(ast.el, writer);
  }
  writer.append(`}`);
}

function processFor(ast: ForNode, writer: JsWriter) {
  let startExpStr = convertExpression(ast.startExp, writer);
  let endExpStr = convertExpression(ast.endExp, writer);
  let byExpStr = `${ast.name.value} += ${(ast.byExp === undefined) ? '+1' : convertExpression(ast.byExp, writer)}`;

  writer.append(`for( let ${ast.name.value}=${startExpStr}; ${ast.name.value} < ${endExpStr}; ${byExpStr} ) {`);
  processNode(ast.body, writer);
  writer.append(`}`);
}

function processForEach(ast: ForEachNode, writer: JsWriter) {
  let expStr = convertExpression(ast.exp, writer);

  writer.append(`for( let ${ast.name.value} of ${expStr} ) {`);
  processNode(ast.body, writer);
  writer.append(`}`);
}

function processWhile(ast: WhileNode, writer: JsWriter) {
  let expStr = convertExpression(ast.exp, writer);

  writer.append(`while( ${expStr} ) {`);
  processNode(ast.body, writer);
  writer.append(`}`);
}

function processReturn(ast: ReturnNode, writer: JsWriter) {
  if (ast.value !== undefined) {
    let expStr = convertExpression(ast.value, writer);
    writer.append(`return ${expStr};`);
  } else {
    writer.append(`return;`);
  }
}

function processBreak(ast: StatementNode, writer: JsWriter) {
  writer.append(`break;`);
}

function convertOp(token: Token): string {
  if (token.kind === TokenKind.Equal) {
    return '===';
  } else if (token.kind === TokenKind.Typeof) {
    return 'isinstanceof';
  } else {
    return token.value;
  }
}

function processCall(ast: CallNode, writer: JsWriter) {
  let tokens: string[] = [];
  convertCall(ast, tokens, writer);
  writer.append(tokens.join(''));
}

function processOn(ast: CallNode, writer: JsWriter) {

  //vm.onStart(moveMonkey.bind(this));

  let tokens: string[] = [];
  convertCall(ast, tokens, writer);
  writer.append(tokens.join(''));
}

function convertCall(ast: CallNode, tokens: string[], writer: JsWriter): void {
  if (!ast.funcDef) {
    throw new ParseError(ParseErrorCode.UnknownFunctionName, ast.name, 'Function not bound');
  }

  if (ast.funcDef.isAsync) {
    tokens.push('await ' + ast.name.value);
  } else {
    tokens.push(ast.name.value);
  }

  tokens.push('(');
  let addComma = false;
  for (let p of ast.params) {
    if (addComma) {
      tokens.push(',');
    }
    addComma = true;
    convertExpressionNode(p, tokens, writer);
  }
  tokens.push(')');
}

function convertExpression(ast: ExpressionNode, writer: JsWriter): string {
  let tokens: string[] = [];
  convertExpressionNode(ast, tokens, writer);
  return tokens.join(' ');
}

function convertExpressionNode(ast: ExpressionNode, tokens: string[], writer: JsWriter): void {
  if (ast.left) {
    convertExpressionToken(ast.left, tokens, writer);
  }
  if (ast.op) {
    convertExpressionToken(ast.op, tokens, writer);
  }
  if (ast.right) {
    convertExpressionToken(ast.right, tokens, writer);
  }
}

function convertExpressionToken(ast: AstNode, tokens: string[], writer: JsWriter): void {
  switch (ast.kind) {
    case AstNodeKind.const:
      tokens.push((ast as ConstNode).value.value);
      break;
    case AstNodeKind.expression:
      convertExpressionNode(ast as ExpressionNode, tokens, writer);
      break;
    case AstNodeKind.id:
      tokens.push((ast as IdNode).name.value);
      break;
    case AstNodeKind.op:
      tokens.push(convertOp((ast as OpNode).op));
      break;
    case AstNodeKind.call:
      convertCall(ast as CallNode, tokens, writer);
      break;
    default:
      throw new ParseError(ParseErrorCode.InvalidToken, undefined, `Invalid token`);
  }
}
