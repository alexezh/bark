import { UiLayer2, UiLayerProps } from "../ui/uilayer";
import { KeyBinder } from "../ui/keybinder";
import { createButton, setElementVisible } from "../lib/htmlutils";
import { renderModule, findParentNode, isParentNode } from "../basic/formatter";
import { vm } from "../engine/ivm";
import { ITextSegment, TextBlock, TextSpan } from "../basic/textblock";

export type CodeEditorProps = UiLayerProps & {
}

// editor is bar on the side and code area
export class CodeEditor {
  private renderBlock: TextBlock | undefined;
  private selectedNode: TextBlock | ITextSegment | TextSpan | undefined = undefined;
  private initialSelectedNode: TextBlock | ITextSegment | TextSpan | undefined = undefined;
  private selectedElem: HTMLElement | undefined = undefined;
  public readonly editEditor: HTMLDivElement;
  private readonly editArea: HTMLDivElement;

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
      this.renderBlock.render(this.editArea, this.onTextClick.bind(this));
    }
  }

  public copyText() {

  }

  public cutText() {

  }

  public pasteText() {

  }

  public addAbove() {

  }

  public addBelow() {

  }

  private onTextScroll(e: Event) {

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
}

