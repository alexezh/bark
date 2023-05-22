import { UiLayer2, UiLayerProps } from "./uilayer";
import { KeyBinder } from "./keybinder";
import { createButton, setElementVisible } from "../lib/htmlutils";
import { renderModule } from "../basic/formatter";
import { vm } from "../engine/ivm";
import { ITextSegment, TextBlock, TextSpan } from "../basic/textblock";

export type CodeEditorProps = UiLayerProps & {
}

// editor is bar on the side and code area
export class CodeEditor extends UiLayer2<CodeEditorProps> {
  private onSave: ((text: string) => void) | undefined;
  private onCancel: (() => void) | undefined;
  private saveButton: HTMLButtonElement;
  private renderBlock: TextBlock | undefined;
  private selectedText: TextBlock | ITextSegment | TextSpan | undefined = undefined;
  private selectedElem: HTMLElement | undefined = undefined;

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

    let module = vm.loader.getUserModule('default');
    if (module) {
      this.renderBlock = renderModule(module);
      this.renderBlock.render(div, this.onTextClick.bind(this));
    }
  }

  private onTextClick(elem: TextBlock | ITextSegment | TextSpan, event: Event) {
    event.stopPropagation();

    this.higlightElement(event.target as HTMLElement);
  }

  private higlightElement(htmlElem: HTMLElement) {
    if (this.selectedElem) {
      this.selectedElem.style.border = '';
    }
    this.selectedElem = htmlElem;
    htmlElem.style.border = 'solid';
  }

  private static isParentText(v1: TextBlock | ITextSegment, v2: TextBlock | ITextSegment | TextSpan): boolean {
    if (v1 === v2) {
      return false;
    }
    //let cur = v2.parent;
    return true;
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

