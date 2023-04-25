import { forEach } from "lodash";
import { AstNode, AstNodeKind, ConstNode, ExpressionNode, FuncDefNode, IdNode, ModuleNode, OpNode, ReturnNode, VarDefNode } from "./ast";
import { ParseError, isOpTokenKind } from "./basictokeniser";

class JsWriter {
  private output: string[] = [];

  public append(s: string) {
    this.output.push(s);
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
      case AstNodeKind.return:
        this.processReturn(ast as ReturnNode);
        break;
    }
  }

  private processModule(ast: ModuleNode) {
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

  private processReturn(ast: ReturnNode) {
    if (ast.value !== undefined) {
      let expStr = this.convertExpression(ast.value);
      this.writer.append(`return ${expStr};`);
    } else {
      this.writer.append(`return;`);
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
          tokens.push((node as OpNode).op.value);
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