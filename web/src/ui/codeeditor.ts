import { UiLayer2, UiLayerProps } from "./uilayer";
import { KeyBinder } from "./keybinder";
import { createButton, setElementVisible } from "../lib/htmlutils";
import { renderModule, findParentNode, isParentNode } from "../basic/formatter";
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
  private selectedNode: TextBlock | ITextSegment | TextSpan | undefined = undefined;
  private initialSelectedNode: TextBlock | ITextSegment | TextSpan | undefined = undefined;
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

  private onTextClick(node: TextBlock | ITextSegment | TextSpan, event: Event) {
    event.stopPropagation();

    if (this.selectedNode && isParentNode(this.selectedNode, node)) {
      this.selectNode(findParentNode(this.selectedNode));
    } else {
      this.selectNode(node);
    }
  }

  private selectNode(node: TextBlock | ITextSegment | TextSpan | undefined) {
    if (this.selectedNode) {
      this.selectedElem!.style.border = '';
      this.selectedNode = undefined;
      this.selectedElem = undefined;
    }

    if (node === undefined) {
      return;
    }

    let htmlElement = document.getElementById(node.id);
    if (htmlElement === null) {
      return;
    }

    this.selectedNode = node;
    this.selectedElem = htmlElement;
    this.selectedElem.style.border = 'solid';
  }

  private static isParentText(v1: TextBlock | ITextSegment | TextSpan, v2: TextBlock | ITextSegment | TextSpan): boolean {
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

