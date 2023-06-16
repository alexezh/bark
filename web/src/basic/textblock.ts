import _ from "lodash";
import { AstNode, AstNodeKind, getChildNodes, insertPlaceholderBefore } from "./ast";
import { ParseError, ParseErrorCode } from "./parseerror";
import { Token, TokenKind } from "./token";

type clickHandler = (node: TextBlock | ATextSegment | TextSpan, event: Event) => void;

let nextId: number = 1;

function makeId(ast: AstNode | undefined, kind: string): string {
  if (ast) {
    return kind + '_ast_' + ast.id.toString();
  } else {
    let id = nextId++;
    return kind + '_' + id.toString();
  }
}

export type TextStyle = {
  spaceLeft?: boolean;
  selectable?: boolean;
  css?: string;
  insertAbove?: boolean;
  insertBelow?: boolean;
  placeholder?: boolean;
}

export enum ChangeStatus {
  clean,
  dirty,
  deleted
}

/**
 * updates children of parentHtml according to nodes
 */
function updateHtmlTree(nodes: (TextBlock | ATextSegment | TextSpan)[], parentHtml: HTMLDivElement | HTMLSpanElement, onClick: clickHandler) {
  let iDomNode = 0;
  let domNodes: HTMLElement[] = [];
  let clearDeleted = false;
  for (let iNode = 0; iNode < nodes.length; iNode++) {
    let child = nodes[iNode];
    let domChild = parentHtml.childNodes.item(iDomNode) as (HTMLDivElement | HTMLSpanElement);
    if (child.changeStatus === ChangeStatus.dirty) {
      domNodes.push(child.render(onClick));

      // if ID is the same, we are updating child node
      // otherwise we are creating a new one. In the latter case, we should not move forward
      // in dom list
      if (domChild.id === child.id) {
        iDomNode++;
      }
    } else if (child.changeStatus === ChangeStatus.deleted) {
      clearDeleted = true;
      iDomNode++;
    } else {
      domNodes.push(domChild);
      iDomNode++;
    }
  }

  parentHtml.replaceChildren(...domNodes);
  if (clearDeleted) {
    _.remove(nodes, (x: TextBlock | ATextSegment | TextSpan) => { x.changeStatus === ChangeStatus.deleted });
  }
}

export function parentAstSegment(elem: TextBlock | ATextSegment | TextSpan): ATextSegment | undefined {
  if (elem instanceof TextSpan) {
    return parentAstSegment(elem.parent);
  } else if (elem instanceof ATextSegment) {
    if (elem.ast) {
      return elem;
    } else {
      if (elem.parent instanceof ATextSegment) {
        return parentAstSegment(elem.parent);
      } else {
        return undefined;
      }
    }
  } else {
    return undefined;
  }
}

/**
 * represents a single HTML span
 * even though we edit span by span, we are not attaching AST to it
 * instead we are going to read the outer text and process the whole statement
 */
export class TextSpan {
  public readonly id: string;
  public readonly parent: ATextSegment;
  private data: Token;
  private style: TextStyle;
  public changeStatus: ChangeStatus = ChangeStatus.dirty;

  public static fromString(parent: ATextSegment, val: string, style: TextStyle): TextSpan {
    return new TextSpan(parent, new Token(TokenKind.String, val, 0), style);
  }

  public constructor(parent: ATextSegment, token: Token, style: TextStyle) {
    this.id = makeId(undefined, 'sp');
    this.parent = parent;
    this.data = token;
    this.style = style;
  }

  public insertLineAbove(cur: TextBlock | ATextSegment | undefined): AstNode | undefined {
    return this.parent.insertLineAbove(undefined);
  }

  public render(onClick: clickHandler): HTMLSpanElement | HTMLDivElement {
    let elem = document.createElement('span');

    if (this.style.spaceLeft) {
      let space = document.createElement('span');
      space.textContent = ' ';
      elem.appendChild(space);
    }

    let t = document.createElement('span');
    t.id = this.id;
    if (this.style.css) {
      t.className = this.style.css;
    }

    if (this.style.placeholder) {
      // min width and style
      t.textContent = ' ';
    } else {
      t.textContent = this.data.value;
    }

    if (this.style.selectable === undefined || this.style.selectable) {
      t.addEventListener('click', (e) => onClick(this, e));
    }
    elem.appendChild(t);
    this.changeStatus = ChangeStatus.clean;
    return elem;
  }
}

export abstract class ATextSegment {
  readonly module: TextModule;
  readonly id: string;
  readonly parent: ATextSegment | TextBlock;
  protected segments: (TextSpan | TextSegment)[] = [];
  public readonly ast: AstNode | undefined;
  public readonly style: TextStyle;
  public changeStatus: ChangeStatus = ChangeStatus.dirty;

  public constructor(parent: ATextSegment | TextBlock, ast: AstNode | undefined, style: TextStyle, prefix: string) {
    this.id = makeId(ast, prefix);
    this.module = parent.module;
    if (ast) {
      this.module.setNode(ast.id, this);
    }
    this.parent = parent;
    this.ast = ast;
    this.style = style;
  }

  abstract render(onClick: clickHandler): HTMLSpanElement | HTMLDivElement;

  abstract appendSegment(ast: AstNode | undefined, style: TextStyle): ATextSegment;

  abstract appendConst(val: string, style: TextStyle): void;
  abstract appendToken(token: Token, style: TextStyle);

  abstract insertLineAbove(cur: TextBlock | ATextSegment | undefined): AstNode | undefined;

  clearChildren() {
    this.segments.length = 0;
  }

  updateHtmlDom(domNode: HTMLDivElement | HTMLSpanElement, onClick: clickHandler) {
    updateHtmlTree(this.segments, domNode, onClick)
  }
}

export class TextSegment extends ATextSegment {

  public constructor(parent: ATextSegment | TextBlock, ast: AstNode | undefined, style: TextStyle) {
    super(parent, ast, style, 'sp');
  }

  public appendSegment(ast: AstNode | undefined, style: TextStyle): ATextSegment {
    let span = new TextSegment(this, ast, style);
    this.segments.push(span);
    return span;
  }

  public appendConst(val: string, style: TextStyle): void {
    if (style.spaceLeft === undefined) {
      style.spaceLeft = this.segments.length > 0;
    }
    this.segments.push(TextSpan.fromString(this, val, style));
  }

  public appendToken(token: Token, style: TextStyle) {
    if (style.spaceLeft === undefined) {
      style.spaceLeft = this.segments.length > 0;
    }
    this.segments.push(new TextSpan(this, token, style))
  }

  public insertLineAbove(cur: TextBlock | ATextSegment | undefined): AstNode | undefined {
    if (!this.parent) {
      return undefined;
    }
    return this.parent.insertLineAbove(this);
  }

  public render(onClick: clickHandler): HTMLSpanElement | HTMLDivElement {
    let elem = document.createElement('span');
    elem.id = this.id;

    if (this.style.spaceLeft) {
      let space = document.createElement('span');
      space.textContent = ' ';
      elem.appendChild(space);
    }

    let t = document.createElement('span');
    if (this.style.css) {
      t.className = this.style.css;
    }
    t.addEventListener('click', (e) => onClick(this, e));

    for (let child of this.segments) {
      if (child instanceof TextSpan) {
        t.appendChild(child.render(onClick));
      } else {
        t.appendChild(child.render(onClick));
      }
      elem.appendChild(t);
    }
    this.changeStatus = ChangeStatus.clean;
    return elem;
  }
}

export class TextLine extends ATextSegment {
  public constructor(parent: TextBlock, ast: AstNode | undefined, style?: TextStyle) {
    super(parent, ast, style ?? {}, 'ln');
  }

  public insertLineAbove(cur: TextBlock | ATextSegment | undefined): AstNode | undefined {
    return this.parent.insertLineAbove(this);
  }

  public appendSegment(ast: AstNode | undefined, style: TextStyle): ATextSegment {
    let span = new TextSegment(this, ast, style);
    this.segments.push(span);
    return span;
  }

  public appendConst(val: string, style: TextStyle): void {
    if (style.spaceLeft === undefined) {
      style.spaceLeft = this.segments.length > 0;
    }
    this.segments.push(TextSpan.fromString(this, val, style));
  }

  public appendToken(token: Token, style: TextStyle): TextSpan {
    if (style.spaceLeft === undefined) {
      style.spaceLeft = this.segments.length > 0;
    }
    let span = new TextSpan(this, token, style);
    this.segments.push(span);
    return span;
  }

  public render(onClick: clickHandler): HTMLDivElement | HTMLSpanElement {
    let line = document.createElement('div');
    line.id = this.id;

    if (this.segments.length > 0) {
      if (this.style.css) {
        line.className = this.style.css;
      }
      line.addEventListener('click', (e) => onClick(this, e));
      for (let token of this.segments) {
        line.appendChild(token.render(onClick));
      }
    } else {
      line.style.minWidth = '20px';
      let linep = document.createElement('br');
      line.appendChild(linep);
    }

    this.changeStatus = ChangeStatus.clean;
    return line;
  }
}

// block is either line or collection of blocks and lines
export class TextBlock {
  public readonly module: TextModule;
  public readonly id: string;
  public readonly parent: TextBlock | undefined;
  public readonly ast: AstNode;
  public readonly style: TextStyle;
  public changeStatus: ChangeStatus = ChangeStatus.dirty;
  private margin: number = 0;
  public readonly children: (ATextSegment | TextBlock)[] = [];

  /**
   * set by individual components to render content
   * same as virtual method
   */
  public renderBlock?: () => void;

  public constructor(module: TextModule, parent: TextBlock | undefined, root: AstNode, style?: TextStyle) {
    this.module = module;
    this.id = makeId(root, 'bl');
    this.module.setNode(root.id, this);

    this.parent = parent;
    this.ast = root;
    this.style = style ?? {};

    if (parent) {
      this.margin = parent.margin + 1;
    }
  }

  public insertLineAbove(cur: TextBlock | ATextSegment | undefined): AstNode | undefined {
    if (cur && cur.style.insertAbove) {
      let idx = this.children.findIndex((val: ATextSegment | TextBlock) => { return val === cur });
      if (idx === -1) {
        return undefined;
      }

      // we found item in the block; it is either line or another block
      // it should have ast associated with it
      let lineAst = insertPlaceholderBefore(cur.ast!);

      return lineAst;
    } else {
      return this.parent?.insertLineAbove(this);
    }
  }

  public clearChildren() {
    this.children.length = 0;
  }

  public appendBlock(ast: AstNode, style?: TextStyle): TextBlock {
    let block = new TextBlock(this.module, this, ast, style);
    this.children.push(block);
    return block;
  }

  public appendEmptyLine(ast: AstNode | undefined, style: TextStyle): TextLine {
    let line = new TextLine(this, ast, style);
    this.children.push(line);
    return line;
  }

  public appendLine(line: TextLine | string | Token | undefined, ast: AstNode | undefined, style: TextStyle): TextLine {
    if (line === undefined) {
      let lc = new TextLine(this, ast, style);
      this.children.push(lc);
      return lc;
    } else if (typeof (line) === 'string') {
      let lc = new TextLine(this, ast, style);
      lc.appendConst(line, style);
      this.children.push(lc);
      return lc;
    } else if (line instanceof Token) {
      let lc = new TextLine(this, ast, style);
      lc.appendToken(line, style);
      this.children.push(lc);
      return lc;
    } else {
      this.children.push(line);
      return line;
    }
  }

  public render(onClick: clickHandler): HTMLDivElement | HTMLSpanElement {
    let div = document.createElement('div') as HTMLDivElement;
    if (this.style.css) {
      div.className = this.style.css;
    }
    div.style.marginLeft = (this.margin * 4).toString();
    div.id = this.id;
    div.addEventListener('click', (e) => onClick(this, e));
    for (let child of this.children) {
      if (child instanceof TextBlock) {
        div.appendChild(child.render(onClick));
      } else if (child instanceof TextLine) {
        div.appendChild(child.render(onClick));
      } else {
        throw 'Unknown type';
      }
    }

    this.changeStatus = ChangeStatus.clean;
    return div;
  }

  public updateHtmlDom(domNode: HTMLDivElement, onClick: clickHandler) {
    updateHtmlTree(this.children, domNode, onClick);
  }
}

export class TextModule {
  private readonly nodes = new Map<number, TextBlock | ATextSegment | TextSpan>();
  private _root!: TextBlock;
  public get root(): TextBlock { return this._root }

  public constructor() {
  }

  public getNodeById(id: number): TextBlock | ATextSegment | TextSpan | undefined {
    return this.nodes.get(id);
  }

  public setNode(id: number, node: TextBlock | ATextSegment | TextSpan) {
    return this.nodes.set(id, node);
  }

  /**
   * remove all nodes starting with ast
   */
  public removeNode(ast: AstNode) {
    //return this.nodes.set(id, node);
    this.nodes.delete(ast.id);
    for (let child of getChildNodes(ast)) {
      this.nodes.delete(child.id);
    }
  }

  public setRoot(node: TextBlock) {
    this._root = node;
  }
}
