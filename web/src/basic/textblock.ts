import { AstNode } from "./ast";
import { Token, TokenKind } from "./token";

export interface ITextSegment {
  readonly parent: ITextSegment | TextBlock;
  get ast(): AstNode | undefined;

  render(elem: HTMLSpanElement | HTMLDivElement);
  appendSegment(ast: AstNode | undefined, spaceLeft: boolean): ITextSegment;

  appendConst(val: string, spaceLeft: boolean | undefined): void;
  appendToken(token: Token, spaceLeft: boolean | undefined);
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

export class TextSegment implements ITextSegment {
  private segments: (TextSpan | TextSegment)[] = [];
  private spaceLeft: boolean;
  public readonly parent: ITextSegment | TextBlock;
  public readonly ast: AstNode | undefined;

  public constructor(parent: ITextSegment | TextBlock, ast: AstNode | undefined, spaceLeft: boolean) {
    this.spaceLeft = spaceLeft;
    this.ast = ast;
    this.parent = parent;
  }

  public appendSegment(ast: AstNode | undefined, spaceLeft: boolean): ITextSegment {
    let span = new TextSegment(this, ast, spaceLeft);
    this.segments.push(span);
    return span;
  }

  public appendConst(val: string, spaceLeft: boolean | undefined = undefined): void {
    if (spaceLeft === undefined) {
      spaceLeft = this.segments.length > 0;
    }
    this.segments.push(TextSpan.fromString(val, spaceLeft));
  }

  public appendToken(token: Token, spaceLeft: boolean | undefined) {
    if (spaceLeft === undefined) {
      spaceLeft = this.segments.length > 0;
    }
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

// block is either line or collection of blocks and lines
export class TextBlock {
  public readonly parent: TextBlock | undefined;
  public readonly ast: AstNode;
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

  public appendLine(line: TextLine | string | Token | undefined, ast: AstNode | undefined = undefined): TextLine {
    if (line === undefined) {
      let lc = new TextLine(this, ast);
      this.children.push(lc);
      return lc;
    } else if (typeof (line) === 'string') {
      let lc = new TextLine(this, ast);
      lc.appendConst(line);
      this.children.push(lc);
      return lc;
    } else if (line instanceof Token) {
      let lc = new TextLine(this, ast);
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
  private segments: (TextSpan | TextSegment)[] = [];
  public readonly parent: TextBlock | ITextSegment;
  public readonly ast: AstNode | undefined;

  public constructor(parent: TextBlock, ast: AstNode | undefined) {
    this.parent = parent;
    this.ast = ast;
  }

  public appendSegment(ast: AstNode | undefined, spaceLeft: boolean): ITextSegment {
    let span = new TextSegment(this, ast, spaceLeft);
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
