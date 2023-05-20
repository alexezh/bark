import { UiLayer2, UiLayerProps } from "./uilayer";
import { KeyBinder } from "./keybinder";
import { createButton, setElementVisible } from "../lib/htmlutils";
import { AssingmentNode, AstNode, AstNodeKind, ForeachNode, ForNode, FuncDefNode, IfNode, ModuleNode, OnNode, VarDefNode } from "../basic/ast";

export type CodeEditorProps = UiLayerProps & {
}

class CodeSpan {
  span: HTMLSpanElement;
}

class CodeLine {
  line: HTMLDivElement;
  public constructor() {

  }
}

export class CodeArea {
  private module: ModuleNode | undefined;
  private area: HTMLDivElement;

  public constructor(area: HTMLDivElement) {
    this.area = area;
  }

  public renderNode(ast: AstNode) {

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
        validateForeach(parentCtx, ast as ForeachNode);
        break;
      case AstNodeKind.forever:
        validateForever(parentCtx, ast as ForeverNode);
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
}
}

// editor is bar on the side and code area
export class CodeEditor extends UiLayer2<CodeEditorProps> {
  private onSave: ((text: string) => void) | undefined;
  private onCancel: (() => void) | undefined;
  private saveButton: HTMLButtonElement;
  private codeArea: CodeArea;

  public constructor(props: CodeEditorProps) {

    let div = document.createElement('div');
    div.className = 'codeEditor';

    super(props, div);

    let bar = document.createElement('div');
    bar.className = 'codeEditorBar';
    div.appendChild(bar);
    this.saveButton = createButton(bar, 'SAVE', (evt: any): any => {
      //const code = this.flask.getCode();
      // if (this.onSave !== undefined) {
      //   this.onSave(code);
      // }
    });
    createButton(bar, 'CANCEL', (evt: any): any => {
      if (this.onCancel !== undefined) {
        this.onCancel();
      }
    });

    let text = document.createElement('div');
    div.appendChild(text);

    this.codeArea = new CodeArea(text);
  }

  public load(
    onSave: ((text: string) => void) | undefined,
    onCancel: () => void) {

    this.onSave = onSave;
    this.onCancel = onCancel;

    // setElementVisible(this.saveButton, this.onSave !== undefined);

    // if (text === undefined || text === null) {
    //   this.flask.updateCode('');
    // } else {
    //   this.flask.updateCode(text);
    // }
  }

  private onMacro() {
    // let code = this.flask.getCode();
    // code = JSON.parse(code);
    // this.flask.updateCode(code);
  }
}

