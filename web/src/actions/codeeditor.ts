import { UiLayer2, UiLayerProps } from "../ui/uilayer";
import { KeyBinder } from "../ui/keybinder";
import { createButton, setElementVisible } from "../lib/htmlutils";
import { renderModule, findParentNode, isParentNode, renderNode } from "../basic/formatter";
import { vm } from "../engine/ivm";
import { ATextSegment, ChangeStatus, TextBlock, TextModule, TextSpan } from "../basic/textblock";
import { updateAst } from "../basic/updateast";
import { AstNode } from "../basic/ast";

export type CodeEditorProps = UiLayerProps & {
}

// editor is bar on the side and code area
export class CodeEditor {
  private _textModule: TextModule | undefined;
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
      this._textModule = renderModule(module);
      this.editArea.replaceChildren();
      this.editArea.append(this._textModule.root.render(this.onTextClick.bind(this)));
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

    let lineAst = this._selectedNode.insertLineAbove(undefined);
    if (!lineAst) {
      return;
    }
    this.updateNode(lineAst.parent!);

    let line = this._textModule?.getNodeById(lineAst.id!);
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

  private updateNode(ast: AstNode) {
    if (!ast.id) {
      return;
    }

    let node = this._textModule?.getNodeById(ast.id);
    if (!node) {
      console.warn('updateNode: cannot fine node:' + ast.id);
      return;
    }

    if (node instanceof TextBlock) {
      node.clearChildren();
      if (node.renderBlock) {
        node.renderBlock();
      } else {
        console.warn('not defined');
      }
    } else if (node instanceof ATextSegment) {
      node.clearChildren();
      //renderNode(node, ast)
      //throw 'hello';
    }

    let domNode = document.getElementById(node.id);
    if (!domNode) {
      console.warn('updateNode: cannot fine dom node:' + ast.id);
      return;
    }

    if (node instanceof TextBlock) {
      node.updateHtmlDom(domNode as HTMLDivElement, this.onTextClick.bind(this));
    } else if (node instanceof ATextSegment) {
      node.updateHtmlDom(domNode as (HTMLDivElement | HTMLSpanElement), this.onTextClick.bind(this));
    } else {
      console.warn('updateNode: should not be span');
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

