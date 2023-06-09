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
