import { UiLayer2, UiLayerProps } from "../ui/uilayer";
import { KeyBinder } from "../ui/keybinder";
import { createButton, setElementVisible } from "../lib/htmlutils";
import { renderModule, findParentNode, isParentNode } from "../basic/formatter";
import { vm } from "../engine/ivm";
import { ATextSegment, ChangeStatus, TextBlock, TextSpan } from "../basic/textblock";
import { updateAst } from "../basic/updateast";

export type CodeEditorProps = UiLayerProps & {
}

// editor is bar on the side and code area
export class CodeEditor {
  private _renderBlock: TextBlock | undefined;
  private _selectedNode: TextBlock | ATextSegment | TextSpan | undefined = undefined;
  private initialSelectedNode: TextBlock | ATextSegment | TextSpan | undefined = undefined;
  private _selectedElem: HTMLElement | undefined = undefined;
  public readonly editEditor: HTMLDivElement;
  private readonly editArea: HTMLDivElement;
  private _textEditActive: boolean = false;
  private _textDirty: boolean = false;

  public constructor() {

    this.editEditor = document.createElement('div');
    this.editEditor.className = 'codeEditor';

    this.editArea = document.createElement('div');
    this.editArea.className = 'codeArea';
    this.editEditor.appendChild(this.editArea);

    this.editArea.addEventListener('scroll', this.onTextScroll.bind(this));
    this.loadContent();
  }

  public loadContent() {
    let module = vm.loader.getUserModule('default');
    if (module) {
      this._renderBlock = renderModule(module);
      this.editArea.replaceChildren();
      this.editArea.append(this._renderBlock.render(this.onTextClick.bind(this)));
    }
  }

  public copyText() {

  }

  public cutText() {

  }

  public pasteText() {

  }

  public addAbove() {
    if (!this._selectedNode || !this._selectedNode.parent) {
      return;
    }

    let line = this._selectedNode.insertLineAbove(undefined);
    if (!line) {
      return;
    }
    this.updateNode(line.parent);
    this.selectNode(line);
  }

  public addBelow() {

  }

  public editText() {
    if (!this._selectedElem) {
      return;
    }

    this._textEditActive = true;
    this._selectedElem.contentEditable = 'true';
    this._selectedElem.addEventListener('input', this.onTextInput.bind(this));
    this._selectedElem.focus();
  }

  public addBlock(text: string) {

  }

  private updateNode(node: TextBlock | ATextSegment) {
    let domNode = document.getElementById(node.id);
    if (domNode === null) {
      return;
    }
    if (node instanceof TextBlock) {
      node.update(domNode as HTMLDivElement, this.onTextClick.bind(this));
    } else {
      node.update(domNode as (HTMLDivElement | HTMLSpanElement), this.onTextClick.bind(this));
    }
  }

  private onTextInput(e: Event) {
    this._textDirty = true;
  }

  private onTextScroll(e: Event) {

  }

  private onTextClick(node: TextBlock | ATextSegment | TextSpan, event: Event) {
    event.stopPropagation();

    if (this._selectedNode && isParentNode(this._selectedNode, node)) {
      this.selectNode(findParentNode(this._selectedNode));
    } else {
      this.selectNode(node);
    }
  }

  private selectNode(node: TextBlock | ATextSegment | TextSpan | undefined) {
    if (this._textEditActive) {
      if (this._textDirty && this._selectedNode) {
        let text = this._selectedElem?.innerText;
        if (text) {
          console.log('input: ' + text);
          updateAst(this._selectedNode, text);
        }
        this._textDirty = false;
      }

      this._textEditActive = false;
    }
    if (this._selectedNode) {
      this._selectedElem!.style.border = '';
      this._selectedNode = undefined;
      this._selectedElem = undefined;
    }

    if (node === undefined) {
      return;
    }

    let htmlElement = document.getElementById(node.id);
    if (htmlElement === null) {
      return;
    }

    this._selectedNode = node;
    this._selectedElem = htmlElement;
    this._selectedElem.style.border = 'solid';
  }

  private static isParentText(v1: TextBlock | ATextSegment | TextSpan, v2: TextBlock | ATextSegment | TextSpan): boolean {
    if (v1 === v2) {
      return false;
    }
    //let cur = v2.parent;
    return true;
  }
}

