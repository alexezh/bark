import { forEach } from "lodash";
import { AssingmentNode, AstNode, AstNodeKind, BlockNode, ConstNode, ExpressionNode, ForNode, FuncDefNode, IdNode, IfNode, ModuleNode, OpNode, ReturnNode, VarDefNode } from "./ast";
import { ParseError, Token, TokenKind, isOpTokenKind } from "./basictokeniser";

class JsWriter {
  private output: string[] = [];

  public append(s: string) {
    this.output.push(s);
    this.output.push('\n');
  }
  public startScope() {
    this.output.push('{')
  }

  public toString(): string {
    return ''.concat(...this.output);
  }
}

export class Transpiler {
  writer: JsWriter = new JsWriter();

  public generate(ast: ModuleNode, mainFunc: string): string {
    // wrap to unnamed function which calls main
    this.writer.append(`(function () {`)
    this.processNode(ast);
    this.writer.append(`; return ${mainFunc}(); })();`)
    return this.writer.toString();
  }

  private processNode(ast: AstNode) {
    switch (ast.kind) {
      case AstNodeKind.module:
        this.processModule(ast as ModuleNode);
        break;
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
      case AstNodeKind.return:
        this.processReturn(ast as ReturnNode);
        break;
      case AstNodeKind.block:
        this.processBlock(ast as BlockNode);
        break;
      default:
        throw new ParseError('Not implemented');
    }
  }

  private processModule(ast: ModuleNode) {
    for (let n of ast.children) {
      this.processNode(n);
    }
  }

  private processBlock(ast: BlockNode) {
    for (let n of ast.children) {
      this.processNode(n);
    }
  }

  private processFuncDef(ast: FuncDefNode) {
    let params: string[] = [];
    for (let t of ast.params) {
      params.push(t.name.value);
    }

    this.writer.append(`function ${ast.name.value}(${params.join(',')}) {`);
    for (let s of ast.body.children) {
      this.processNode(s);
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
    this.processNode(ast.th);
    if (ast.elif.length > 0) {
      for (let elif of ast.elif) {
        let expStr = this.convertExpression(elif.exp);
        this.writer.append(`} else if( ${expStr} ) {`);
        this.processNode(elif.block);
      }
    }
    if (ast.el !== undefined) {
      this.writer.append(`} else {`);
      this.processNode(ast.el);
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

  private processReturn(ast: ReturnNode) {
    if (ast.value !== undefined) {
      let expStr = this.convertExpression(ast.value);
      this.writer.append(`return ${expStr};`);
    } else {
      this.writer.append(`return;`);
    }
  }

  private convertOp(token: Token): string {
    if (token.kind === TokenKind.Equal) {
      return '===';
    } else {
      return token.value;
    }
  }

  private convertExpression(ast: ExpressionNode): string {
    let tokens: string[] = [];
    for (let node of ast.children) {
      switch (node.kind) {
        case AstNodeKind.const:
          tokens.push((node as ConstNode).value.value);
          break;
        case AstNodeKind.id:
          tokens.push((node as IdNode).name.value);
          break;
        case AstNodeKind.op:
          tokens.push(this.convertOp((node as OpNode).op));
          break;
        case AstNodeKind.call:
          break;
        default:
          throw new ParseError();
      }
    }
    return tokens.join(' ');
  }
}