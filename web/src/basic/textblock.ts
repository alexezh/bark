import { AstNode } from "./ast";
import { Token, TokenKind } from "./token";

export interface ITextSegment {
  render(elem: HTMLSpanElement | HTMLDivElement);
  appendSegment(spaceLeft: boolean): ITextSegment;

  appendConst(val: string, spaceLeft: boolean | undefined): void;
  appendToken(token: Token);
}

export class TextSegment implements ITextSegment {
  private segments: (TextSpan | TextSegment)[] = [];
  private spaceLeft: boolean;

  public constructor(spaceLeft: boolean) {
    this.spaceLeft = spaceLeft;
  }

  public appendSegment(spaceLeft: boolean): ITextSegment {
    let span = new TextSegment(spaceLeft);
    this.segments.push(span);
    return span;
  }

  public appendConst(val: string, spaceLeft: boolean | undefined = undefined): void {
    if (spaceLeft === undefined) {
      spaceLeft = this.segments.length > 0;
    }
    this.segments.push(TextSpan.fromString(val, spaceLeft));
  }

  public appendToken(token: Token) {
    let spaceLeft = this.segments.length > 0;
    this.segments.push(new TextSpan(token, spaceLeft))
  }

  public render(elem: HTMLSpanElement | HTMLDivElement) {
    if (this.spaceLeft) {
      let space = document.createElement('span');
      space.textContent = ' ';
      elem.appendChild(space);
    }

    let t = document.createElement('span');
    for (let child of this.segments) {
      if (child instanceof TextSpan) {
        child.render(t);
      } else {
        child.render(t);
      }
      elem.appendChild(t);
    }
  }
}

export class TextSpan {
  private data: Token;
  private spaceLeft: boolean = false;
  public ast: AstNode | undefined = undefined;

  public static fromString(val: string, spaceLeft: boolean = false): TextSpan {
    return new TextSpan(new Token(TokenKind.String, val, 0), spaceLeft);
  }

  public constructor(token: Token, spaceLeft: boolean = false) {
    this.data = token;
    this.spaceLeft = spaceLeft;
  }

  public render(elem: HTMLSpanElement | HTMLDivElement) {
    if (this.spaceLeft) {
      let space = document.createElement('span');
      space.textContent = ' ';
      elem.appendChild(space);
    }

    let t = document.createElement('span');
    t.textContent = this.data.value;
    elem.appendChild(t);
  }
}

// block is either line or collection of blocks and lines
export class TextBlock {
  private parent: TextBlock | undefined;
  private ast: AstNode;
  private margin: number = 0;
  private children: (TextLine | TextBlock)[] = [];

  public constructor(parent: TextBlock | undefined, root: AstNode) {
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

  public appendLine(line: TextLine | string | Token | undefined): TextLine {
    if (line === undefined) {
      let lc = new TextLine(this);
      this.children.push(lc);
      return lc;
    } else if (typeof (line) === 'string') {
      let lc = new TextLine(this);
      lc.appendConst(line);
      this.children.push(lc);
      return lc;
    } else if (line instanceof Token) {
      let lc = new TextLine(this);
      lc.appendToken(line);
      this.children.push(lc);
      return lc;
    } else {
      this.children.push(line);
      return line;
    }
  }

  public render(parent: HTMLDivElement) {
    let div = document.createElement('div') as HTMLDivElement;
    div.style.marginLeft = (this.margin * 4).toString();
    for (let child of this.children) {
      if (child instanceof TextBlock) {
        child.render(div);
      } else if (child instanceof TextLine) {
        child.render(div);
      }
    }

    parent.appendChild(div);
  }
}

export class TextLine implements ITextSegment {
  private parent: TextBlock;
  private segments: (TextSpan | TextSegment)[] = [];

  public constructor(parent: TextBlock) {
    this.parent = parent;
  }

  public appendSegment(spaceLeft: boolean): ITextSegment {
    let span = new TextSegment(spaceLeft);
    this.segments.push(span);
    return span;
  }

  public appendConst(val: string, spaceLeft: boolean | undefined = undefined): void {
    if (spaceLeft === undefined) {
      spaceLeft = this.segments.length > 0;
    }
    this.segments.push(TextSpan.fromString(val, spaceLeft));
  }

  public appendToken(token: Token) {
    let spaceLeft = this.segments.length > 0;
    this.segments.push(new TextSpan(token, spaceLeft))
  }

  public render(elem: HTMLDivElement) {
    let line = document.createElement('div');
    for (let token of this.segments) {
      token.render(line);
    }
    elem.appendChild(line);
  }
}
