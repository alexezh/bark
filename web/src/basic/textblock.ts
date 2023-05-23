import { AstNode } from "./ast";
import { Token, TokenKind } from "./token";

type clickHandler = (node: TextBlock | ITextSegment | TextSpan, event: Event) => void;

let nextId: number = 1;

function makeId(): string {
  let id = nextId++;
  return 'tn_' + id.toString();
}

export type TextStyle = {
  spaceLeft?: boolean;
  selectable?: boolean;
}

export interface ITextSegment {
  readonly id: string;
  readonly parent: ITextSegment | TextBlock;
  get ast(): AstNode | undefined;

  render(elem: HTMLSpanElement | HTMLDivElement, onClick: (elem: TextBlock | ITextSegment | TextSpan) => void);
  appendSegment(ast: AstNode | undefined, style: TextStyle): ITextSegment;

  appendConst(val: string, style: TextStyle): void;
  appendToken(token: Token, style: TextStyle);
}

export class TextSpan {
  public readonly id: string;
  public readonly parent: ITextSegment;
  private data: Token;
  private style: TextStyle;
  public ast: AstNode | undefined = undefined;

  public static fromString(parent: ITextSegment, val: string, style: TextStyle): TextSpan {
    return new TextSpan(parent, new Token(TokenKind.String, val, 0), style);
  }

  public constructor(parent: ITextSegment, token: Token, style: TextStyle) {
    this.id = makeId();
    this.parent = parent;
    this.data = token;
    this.style = style;
  }

  public render(elem: HTMLSpanElement | HTMLDivElement, onClick: clickHandler) {
    if (this.style.spaceLeft) {
      let space = document.createElement('span');
      space.textContent = ' ';
      elem.appendChild(space);
    }

    let t = document.createElement('span');
    t.id = this.id;
    t.textContent = this.data.value;
    if (this.style.selectable === undefined || this.style.selectable) {
      t.addEventListener('click', (e) => onClick(this, e));
    }
    elem.appendChild(t);
  }
}

export class TextSegment implements ITextSegment {
  public readonly id: string;
  public readonly parent: ITextSegment | TextBlock;
  public readonly ast: AstNode | undefined;
  private segments: (TextSpan | TextSegment)[] = [];
  private style: TextStyle;

  public constructor(parent: ITextSegment | TextBlock, ast: AstNode | undefined, style: TextStyle) {
    this.id = makeId();
    this.style = style;
    this.ast = ast;
    this.parent = parent;
  }

  public appendSegment(ast: AstNode | undefined, style: TextStyle): ITextSegment {
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

  public render(elem: HTMLSpanElement | HTMLDivElement, onClick: clickHandler) {
    if (this.style.spaceLeft) {
      let space = document.createElement('span');
      space.textContent = ' ';
      elem.appendChild(space);
    }

    let t = document.createElement('span');
    t.id = this.id;
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
  private margin: number = 0;
  private children: (TextLine | TextBlock)[] = [];

  public constructor(parent: TextBlock | undefined, root: AstNode) {
    this.id = makeId();
    this.parent = parent;
    this.ast = root;
    if (parent) {
      this.margin = parent.margin + 1;
    }
  }

  public appendBlock(ast: AstNode): TextBlock {
    let block = new TextBlock(this, ast);
    this.children.push(block);
    return block;
  }

  public appendLine(line: TextLine | string | Token | undefined, ast: AstNode | undefined, style: TextStyle): TextLine {
    if (line === undefined) {
      let lc = new TextLine(this, ast);
      this.children.push(lc);
      return lc;
    } else if (typeof (line) === 'string') {
      let lc = new TextLine(this, ast);
      lc.appendConst(line, style);
      this.children.push(lc);
      return lc;
    } else if (line instanceof Token) {
      let lc = new TextLine(this, ast);
      lc.appendToken(line, style);
      this.children.push(lc);
      return lc;
    } else {
      this.children.push(line);
      return line;
    }
  }

  public render(parent: HTMLDivElement, onClick: clickHandler) {
    let div = document.createElement('div') as HTMLDivElement;
    div.style.marginLeft = (this.margin * 4).toString();
    div.id = this.id;
    div.addEventListener('click', (e) => onClick(this, e));
    for (let child of this.children) {
      if (child instanceof TextBlock) {
        child.render(div, onClick);
      } else if (child instanceof TextLine) {
        child.render(div, onClick);
      }
    }

    parent.appendChild(div);
  }
}

export class TextLine implements ITextSegment {
  public readonly id: string;
  public readonly parent: TextBlock | ITextSegment;
  public readonly ast: AstNode | undefined;
  private segments: (TextSpan | TextSegment)[] = [];

  public constructor(parent: TextBlock, ast: AstNode | undefined) {
    this.id = makeId();
    this.parent = parent;
    this.ast = ast;
  }

  public appendSegment(ast: AstNode | undefined, style: TextStyle): ITextSegment {
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
    if (!style.spaceLeft) {
      style.spaceLeft = this.segments.length > 0;
    }
    this.segments.push(new TextSpan(this, token, style))
  }

  public render(elem: HTMLDivElement, onClick: clickHandler) {
    let line = document.createElement('div');
    line.id = this.id;
    line.addEventListener('click', (e) => onClick(this, e));
    for (let token of this.segments) {
      token.render(line, onClick);
    }
    elem.appendChild(line);
  }
}
