export class Token {
  public readonly kind: TokenKind;
  public readonly value: string;
  public readonly pos: number;
  public idx: number = 0;

  public constructor(kind: TokenKind, value: string, pos: number) {
    this.kind = kind;
    this.value = value;
    this.pos = pos;
  }
}

