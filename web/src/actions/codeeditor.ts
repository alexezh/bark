import { UiLayer2, UiLayerProps } from "../ui/uilayer";
import { KeyBinder } from "../ui/keybinder";
import { createButton, setElementVisible } from "../lib/htmlutils";
import { renderModule, findParentNode, isParentNode } from "../basic/formatter";
import { vm } from "../engine/ivm";
import { ATextSegment, ChangeStatus, TextBlock, TextSpan } from "../basic/textblock";

export type CodeEditorProps = UiLayerProps & {
}

// editor is bar on the side and code area
export class CodeEditor {
  private renderBlock: TextBlock | undefined;
  private selectedNode: TextBlock | ATextSegment | TextSpan | undefined = undefined;
  private initialSelectedNode: TextBlock | ATextSegment | TextSpan | undefined = undefined;
  private selectedElem: HTMLElement | undefined = undefined;
  public readonly editEditor: HTMLDivElement;
  private readonly editArea: HTMLDivElement;
  private textEditActive: boolean = false;

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
      this.renderBlock = renderModule(module);
      this.editArea.replaceChildren();
      this.editArea.append(this.renderBlock.render(this.onTextClick.bind(this)));
    }
  }

  public copyText() {

  }

  public cutText() {

  }

  public pasteText() {

  }

  public addAbove() {
    if (!this.selectedNode || !this.selectedNode.parent) {
      return;
    }

    let line = this.selectedNode.parent.insertLineAbove(undefined);
    if (!line) {
      return;
    }
    this.updateNode(line.parent);
  }

  public addBelow() {

  }

  public editText() {
    if (!this.selectedElem) {
      return;
    }

    this.textEditActive = true;
    this.selectedElem.contentEditable = 'true';
    this.selectedElem.addEventListener('input', this.onTextInput.bind(this));
    this.selectedElem.focus();
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
    console.log('edit');
  }

  private onTextScroll(e: Event) {

  }

  private onTextClick(node: TextBlock | ATextSegment | TextSpan, event: Event) {
    event.stopPropagation();

    if (this.selectedNode && isParentNode(this.selectedNode, node)) {
      this.selectNode(findParentNode(this.selectedNode));
    } else {
      this.selectNode(node);
    }
  }

  private selectNode(node: TextBlock | ATextSegment | TextSpan | undefined) {
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

  private static isParentText(v1: TextBlock | ATextSegment | TextSpan, v2: TextBlock | ATextSegment | TextSpan): boolean {
    if (v1 === v2) {
      return false;
    }
    //let cur = v2.parent;
    return true;
  }
}

