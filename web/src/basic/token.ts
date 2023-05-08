export enum TokenKind {
  Eol = 1,
  Eof,
  Ws,
  // first op
  Equal,
  Less,
  Greater,
  LessOrEqual,
  GreaterOrEqual,
  Or,
  And,
  Not,
  Typeof,
  Plus,
  Minus,
  Div,
  Mul,
  // last op
  Assign,
  Comma,
  Semi,
  Colon,
  LeftParen,
  RightParen,
  LeftSquiggly,
  RightSquiggly,
  LeftSquare,
  RightSquare,
  // const start
  String,
  Number,
  Boolean,
  True,
  False,
  // const end
  Break,
  Id,
  For,
  Foreach,
  In,
  To,
  By,
  Do,
  While,
  If,
  Then,
  Else,
  ElIf,
  End,
  Begin,
  Proc,
  Var,
  Return,
}

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

