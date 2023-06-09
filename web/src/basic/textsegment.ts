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