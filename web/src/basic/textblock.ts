import _ from "lodash";
import { AstNode } from "./ast";
import { ParseError, ParseErrorCode } from "./parseerror";
import { Token, TokenKind } from "./token";

type clickHandler = (node: TextBlock | ATextSegment | TextSpan, event: Event) => void;

let nextId: number = 1;

function makeId(): string {
  let id = nextId++;
  return 'tn_' + id.toString();
}

export type TextStyle = {
  spaceLeft?: boolean;
  selectable?: boolean;
  css?: string;
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

export class TextSpan {
  public readonly id: string;
  public readonly parent: ATextSegment;
  private data: Token;
  private style: TextStyle;
  public ast: AstNode | undefined = undefined;
  public changeStatus: ChangeStatus = ChangeStatus.dirty;

  public static fromString(parent: ATextSegment, val: string, style: TextStyle): TextSpan {
    return new TextSpan(parent, new Token(TokenKind.String, val, 0), style);
  }

  public constructor(parent: ATextSegment, token: Token, style: TextStyle) {
    this.id = makeId();
    this.parent = parent;
    this.data = token;
    this.style = style;
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
    t.textContent = this.data.value;
    if (this.style.selectable === undefined || this.style.selectable) {
      t.addEventListener('click', (e) => onClick(this, e));
    }
    elem.appendChild(t);
    this.changeStatus = ChangeStatus.clean;
    return elem;
  }
}

export abstract class ATextSegment {
  readonly id: string;
  readonly parent: ATextSegment | TextBlock;
  protected segments: (TextSpan | TextSegment)[] = [];
  public readonly ast: AstNode | undefined;
  public readonly style: TextStyle;
  public changeStatus: ChangeStatus = ChangeStatus.dirty;

  public constructor(parent: ATextSegment | TextBlock, ast: AstNode | undefined, style: TextStyle) {
    this.id = makeId();
    this.parent = parent;
    this.ast = ast;
    this.style = style;
  }

  abstract render(onClick: clickHandler): HTMLSpanElement | HTMLDivElement;

  abstract appendSegment(ast: AstNode | undefined, style: TextStyle): ATextSegment;

  abstract appendConst(val: string, style: TextStyle): void;
  abstract appendToken(token: Token, style: TextStyle);

  abstract insertLineAbove(cur: ATextSegment | undefined): ATextSegment | undefined;

  update(domNode: HTMLDivElement | HTMLSpanElement, onClick: clickHandler) {
    updateHtmlTree(this.segments, domNode, onClick)
  }
}

export class TextSegment extends ATextSegment {

  public constructor(parent: ATextSegment | TextBlock, ast: AstNode | undefined, style: TextStyle) {
    super(parent, ast, style);
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

  public insertLineAbove(cur: ATextSegment | undefined): ATextSegment | undefined {
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
    super(parent, ast, style ?? {});
  }

  public insertLineAbove(cur: ATextSegment | undefined): ATextSegment | undefined {
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

  public appendToken(token: Token, style: TextStyle) {
    if (style.spaceLeft === undefined) {
      style.spaceLeft = this.segments.length > 0;
    }
    this.segments.push(new TextSpan(this, token, style))
  }

  public render(onClick: clickHandler): HTMLDivElement | HTMLSpanElement {
    let line = document.createElement('div');

    if (this.segments.length > 0) {
      line.id = this.id;
      if (this.style.css) {
        line.className = this.style.css;
      }
      line.addEventListener('click', (e) => onClick(this, e));
      for (let token of this.segments) {
        line.appendChild(token.render(onClick));
      }
    } else {
      let linep = document.createElement('br');
      line.appendChild(linep);
    }

    this.changeStatus = ChangeStatus.clean;
    return line;
  }
}

// block is either line or collection of blocks and lines
export class TextBlock {
  public readonly id: string;
  public readonly parent: TextBlock | undefined;
  public readonly ast: AstNode;
  public readonly style: TextStyle;
  public changeStatus: ChangeStatus = ChangeStatus.dirty;
  private margin: number = 0;
  public readonly children: (ATextSegment | TextBlock)[] = [];

  public constructor(parent: TextBlock | undefined, root: AstNode, style?: TextStyle) {
    this.id = makeId();
    this.parent = parent;
    this.ast = root;
    this.style = style ?? {};

    if (parent) {
      this.margin = parent.margin + 1;
    }
  }

  public insertLineAbove(cur: TextBlock | ATextSegment | undefined): ATextSegment | undefined {
    if (cur) {
      let idx = this.children.findIndex((val: ATextSegment | TextBlock) => { return val === cur });
      if (idx === -1) {
        return undefined;
      }
      let line = new TextLine(this, undefined, {});
      this.children.splice(idx, 0, line);
      return line;
    } else {
      return this.parent?.insertLineAbove(this);
    }
  }

  public appendBlock(ast: AstNode, style?: TextStyle): TextBlock {
    let block = new TextBlock(this, ast, style);
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

  public update(domNode: HTMLDivElement, onClick: clickHandler) {
    updateHtmlTree(this.children, domNode, onClick);
  }
}

