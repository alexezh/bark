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
  newNode,
  dirty,
  deleted
}

export abstract class ATextSegment {
  readonly id: string;
  readonly parent: ATextSegment | TextBlock;
  public readonly ast: AstNode | undefined;
  public readonly style: TextStyle;
  public changeStatus: ChangeStatus = ChangeStatus.clean;

  public constructor(parent: ATextSegment | TextBlock, ast: AstNode | undefined, style: TextStyle) {
    this.id = makeId();
    this.parent = parent;
    this.ast = ast;
    this.style = style;
  }

  abstract render(elem: HTMLSpanElement | HTMLDivElement, onClick: (elem: TextBlock | ATextSegment | TextSpan) => void);
  public update(domNode: HTMLDivElement, onClick: clickHandler);
  abstract appendSegment(ast: AstNode | undefined, style: TextStyle): ATextSegment;

  abstract appendConst(val: string, style: TextStyle): void;
  abstract appendToken(token: Token, style: TextStyle);

  abstract insertLineAbove(cur: ATextSegment | undefined): ATextSegment | undefined;
}

export class TextSpan {
  public readonly id: string;
  public readonly parent: ATextSegment;
  private data: Token;
  private style: TextStyle;
  public ast: AstNode | undefined = undefined;

  public static fromString(parent: ATextSegment, val: string, style: TextStyle): TextSpan {
    return new TextSpan(parent, new Token(TokenKind.String, val, 0), style);
  }

  public constructor(parent: ATextSegment, token: Token, style: TextStyle) {
    this.id = makeId();
    this.parent = parent;
    this.data = token;
    this.style = style;
  }

  public render(parent: HTMLSpanElement | HTMLDivElement, onClick: clickHandler) {
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
    parent.appendChild(elem);
  }
}


export class TextSegment extends ATextSegment {
  private segments: (TextSpan | TextSegment)[] = [];

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

  public render(elem: HTMLSpanElement | HTMLDivElement, onClick: clickHandler) {
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
    t.addEventListener('click', (e) => onClick(this, e));

    for (let child of this.segments) {
      if (child instanceof TextSpan) {
        child.render(t, onClick);
      } else {
        child.render(t, onClick);
      }
      elem.appendChild(t);
    }
  }
}

// block is either line or collection of blocks and lines
export class TextBlock {
  public readonly id: string;
  public readonly parent: TextBlock | undefined;
  public readonly ast: AstNode;
  public readonly style: TextStyle;
  public changeStatus: ChangeStatus = ChangeStatus.clean;
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

  public insertLineAbove(cur: ATextSegment | undefined): ATextSegment | undefined {
    let idx = this.children.findIndex((val: ATextSegment | TextBlock) => { val === cur });
    if (idx === -1) {
      return undefined;
    }
    this.children.splice(idx, 0, new EmptyTextLine(this, undefined, {}));
  }

  public appendBlock(ast: AstNode, style?: TextStyle): TextBlock {
    let block = new TextBlock(this, ast, style);
    this.children.push(block);
    return block;
  }

  public appendEmptyLine(ast: AstNode | undefined, style: TextStyle): EmptyTextLine {
    let line = new EmptyTextLine(this, ast, style);
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

  public render(parent: HTMLDivElement, onClick: clickHandler): HTMLDivElement | HTMLSpanElement {
    let div = document.createElement('div') as HTMLDivElement;
    if (this.style.css) {
      div.className = this.style.css;
    }
    div.style.marginLeft = (this.margin * 4).toString();
    div.id = this.id;
    div.addEventListener('click', (e) => onClick(this, e));
    for (let child of this.children) {
      if (child instanceof TextBlock) {
        child.render(div, onClick);
      } else if (child instanceof TextLine) {
        child.render(div, onClick);
      } else if (child instanceof EmptyTextLine) {
        child.render(div, onClick);
      } else {
        throw 'Unknown type';
      }
    }

    parent.appendChild(div);
  }

  public update(domNode: HTMLDivElement, onClick: clickHandler) {
    let iDomNode = 0;
    let domNodes: HTMLElement[] = [];
    let clearDeleted = false;
    for (let iNode = 0; iNode < this.children.length; iNode++) {
      let child = this.children[iNode];
      let domChild = domNode.childNodes.item(iDomNode) as HTMLDivElement;
      if (child.changeStatus === ChangeStatus.newNode) {
        domNodes.push(child.render(onClick));
        child.changeStatus = ChangeStatus.clean;
      } else if (child.changeStatus === ChangeStatus.deleted) {
      } else if (child.changeStatus === ChangeStatus.dirty) {
        domNodes.push(child.render(node, this.onTextInput.bind(this)));
      }
    }
  }
}

export class TextLine extends ATextSegment {
  private segments: (TextSpan | TextSegment)[] = [];

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

  public render(elem: HTMLDivElement, onClick: clickHandler) {
    let line = document.createElement('div');
    line.id = this.id;
    if (this.style.css) {
      line.className = this.style.css;
    }
    line.addEventListener('click', (e) => onClick(this, e));
    for (let token of this.segments) {
      token.render(line, onClick);
    }
    elem.appendChild(line);
  }
}

export class EmptyTextLine extends ATextSegment {

  public constructor(parent: TextBlock, ast: AstNode | undefined, style?: TextStyle) {
    super(parent, ast, style ?? {});
  }

  public insertLineAbove(): ATextSegment | undefined {
    return this.parent.insertLineAbove(this);
  }

  public appendSegment(ast: AstNode | undefined, style: TextStyle): ATextSegment {
    throw new ParseError(ParseErrorCode.NotImpl, undefined, 'Not implemented');
  }

  public appendConst(val: string, style: TextStyle): void {
    throw new ParseError(ParseErrorCode.NotImpl, undefined, 'Not implemented');
  }

  public appendToken(token: Token, style: TextStyle) {
    throw new ParseError(ParseErrorCode.NotImpl, undefined, 'Not implemented');
  }

  public render(elem: HTMLDivElement, onClick: clickHandler) {
    let line = document.createElement('div');
    let linep = document.createElement('br');
    line.appendChild(linep);
    elem.appendChild(line);
  }
}
