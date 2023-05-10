import { UiLayer2, UiLayerProps } from "./uilayer";
import { KeyBinder } from "./keybinder";
import { createButton, setElementVisible } from "../lib/htmlutils";
import { ModuleNode } from "../basic/ast";

export type CodeEditorProps = UiLayerProps & {
}

export class CodeArea {
  private module: ModuleNode | undefined;

  public render() {

  }
}

// editor is bar on the side and code area
export class CodeEditor extends UiLayer2<CodeEditorProps> {
  private onSave: ((text: string) => void) | undefined;
  private onCancel: (() => void) | undefined;
  private saveButton: HTMLButtonElement;

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
    //this.macroButton = createButton(bar, 'MACRO', (evt: any): any => {
    //  this.onMacro();
    //});

    let text = document.createElement('div');
    div.appendChild(text);

    //    this.flask = new CodeFlask(text, { language: 'js' });
  }

  public load(
    text: string | null | undefined,
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

