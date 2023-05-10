import { AssingmentNode, AstNode, AstNodeKind, BlockNode, CallNode, ConstNode, ExpressionNode, ForEachNode, ForNode, FuncDefNode, IdNode, IfNode, ModuleNode, OpNode, ReturnNode, StatementNode, VarDefNode, WhileNode } from "./ast";
import { JsWriter } from "./jswriter";
import { ModuleCache } from "./modulecache";
import { ParseError, ParseErrorCode } from "./parseerror";
import { Token, TokenKind } from "./token";

/**
 * generates Js function from ast
 */
export class Transpiler {
  writer: JsWriter = new JsWriter();

  public load(ast: ModuleNode, mainFunction: string, moduleCache: ModuleCache | undefined = undefined): Function {
    // wrap to unnamed function which calls main
    if (moduleCache !== undefined) {
      moduleCache.writeModuleVars('__loader', this.writer);
    }

    this.processModule(ast as ModuleNode);

    this.writer.append(`return ${mainFunction}();`)

    let jsText = this.writer.toString();
    return new Function('__loader', jsText);
  }

  private processNode(ast: AstNode) {
    switch (ast.kind) {
      case AstNodeKind.funcDef:
        this.processFuncDef(ast as FuncDefNode);
        break;
      case AstNodeKind.varDef:
        this.processVarDef(ast as VarDefNode);
        break;
      case AstNodeKind.assingment:
        this.processAssingment(ast as AssingmentNode);
        break;
      case AstNodeKind.if:
        this.processIf(ast as IfNode);
        break;
      case AstNodeKind.for:
        this.processFor(ast as ForNode);
        break;
      case AstNodeKind.foreach:
        this.processForEach(ast as ForEachNode);
        break;
      case AstNodeKind.while:
        this.processWhile(ast as WhileNode);
        break;
      case AstNodeKind.return:
        this.processReturn(ast as ReturnNode);
        break;
      case AstNodeKind.break:
        this.processBreak(ast as StatementNode);
        break;
      case AstNodeKind.block:
        this.processBlock(ast as BlockNode);
        break;
      case AstNodeKind.call:
        this.processCall(ast as CallNode);
        break;
      default:
        throw new ParseError(ParseErrorCode.NotImpl, undefined, 'Not implemented');
    }
  }

  private processModule(ast: ModuleNode) {
    for (let n of ast.children) {
      this.processNode(n);
    }
  }

  private processBlock(ast: BlockNode) {
    for (let n of ast.statements) {
      this.processNode(n);
    }
  }

  private processFuncDef(ast: FuncDefNode) {
    let params: string[] = [];
    for (let t of ast.params) {
      params.push(t.name.value);
    }

    if (ast.body instanceof Function) {
      // nothing for us to do here
    } else {
      this.writer.append(`function ${ast.name.value}(${params.join(',')}) {`);
      for (let s of ast.body.statements) {
        this.processNode(s);
      }
    }
    this.writer.append(`}`);
  }

  private processVarDef(ast: VarDefNode) {
    if (ast.value !== undefined) {
      let expStr = this.convertExpression(ast.value);
      this.writer.append(`let ${ast.name.value} = ${expStr};`);
    } else {
      this.writer.append(`let ${ast.name.value};`);
    }
  }

  private processAssingment(ast: AssingmentNode) {
    let expStr = this.convertExpression(ast.value);
    this.writer.append(`${ast.name.value} = ${expStr};`);
  }

  private processIf(ast: IfNode) {
    let expStr = this.convertExpression(ast.exp);
    this.writer.append(`if( ${expStr} ) {`);
    this.processBlock(ast.th);
    if (ast.elif.length > 0) {
      for (let elif of ast.elif) {
        let expStr = this.convertExpression(elif.exp);
        this.writer.append(`} else if( ${expStr} ) {`);
        this.processBlock(elif.block);
      }
    }
    if (ast.el !== undefined) {
      this.writer.append(`} else {`);
      this.processBlock(ast.el);
    }
    this.writer.append(`}`);
  }

  private processFor(ast: ForNode) {
    let startExpStr = this.convertExpression(ast.startExp);
    let endExpStr = this.convertExpression(ast.endExp);
    let byExpStr = `${ast.name.value} += ${(ast.byExp === undefined) ? '+1' : this.convertExpression(ast.byExp)}`;

    this.writer.append(`for( let ${ast.name.value}=${startExpStr}; ${ast.name.value} < ${endExpStr}; ${byExpStr} ) {`);
    this.processNode(ast.body);
    this.writer.append(`}`);
  }

  private processForEach(ast: ForEachNode) {
    let expStr = this.convertExpression(ast.exp);

    this.writer.append(`for( let ${ast.name.value} of ${expStr} ) {`);
    this.processNode(ast.body);
    this.writer.append(`}`);
  }

  private processWhile(ast: WhileNode) {
    let expStr = this.convertExpression(ast.exp);

    this.writer.append(`while( ${expStr} ) {`);
    this.processNode(ast.body);
    this.writer.append(`}`);
  }

  private processReturn(ast: ReturnNode) {
    if (ast.value !== undefined) {
      let expStr = this.convertExpression(ast.value);
      this.writer.append(`return ${expStr};`);
    } else {
      this.writer.append(`return;`);
    }
  }

  private processBreak(ast: StatementNode) {
    this.writer.append(`break;`);
  }

  private convertOp(token: Token): string {
    if (token.kind === TokenKind.Equal) {
      return '===';
    } else if (token.kind === TokenKind.Typeof) {
      return 'isinstanceof';
    } else {
      return token.value;
    }
  }

  private processCall(ast: CallNode) {
    let tokens: string[] = [];
    this.convertCall(ast, tokens);
    this.writer.append(tokens.join(''));
  }

  private convertCall(ast: CallNode, tokens: string[]): void {
    tokens.push(ast.name.value);
    if (ast.name.value === 'vm.send') {
      console.log('send');
    }
    tokens.push('(');
    let addComma = false;
    for (let p of ast.params) {
      if (addComma) {
        tokens.push(',');
      }
      addComma = true;
      this.convertExpressionNode(p, tokens);
    }
    tokens.push(')');
  }

  private convertExpression(ast: ExpressionNode): string {
    let tokens: string[] = [];
    this.convertExpressionNode(ast, tokens);
    return tokens.join(' ');
  }

  private convertExpressionNode(ast: ExpressionNode, tokens: string[]): void {
    if (ast.left) {
      this.convertExpressionToken(ast.left, tokens);
    }
    if (ast.op) {
      this.convertExpressionToken(ast.op, tokens);
    }
    if (ast.right) {
      this.convertExpressionToken(ast.right, tokens);
    }
  }

  private convertExpressionToken(ast: AstNode, tokens: string[]): void {
    switch (ast.kind) {
      case AstNodeKind.const:
        tokens.push((ast as ConstNode).value.value);
        break;
      case AstNodeKind.expression:
        this.convertExpressionNode(ast as ExpressionNode, tokens);
        break;
      case AstNodeKind.id:
        tokens.push((ast as IdNode).name.value);
        break;
      case AstNodeKind.op:
        tokens.push(this.convertOp((ast as OpNode).op));
        break;
      case AstNodeKind.call:
        this.convertCall(ast as CallNode, tokens);
        break;
      default:
        throw new ParseError(ParseErrorCode.InvalidToken, undefined, `Invalid token`);
    }
  }
}