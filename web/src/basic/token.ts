export enum TokenKind {
  Eol = 1,
  Eof = 2,
  Ws = 3,
  // first op
  Equal = 4,
  NotEqual = 5,
  Less = 6,
  Greater = 7,
  LessOrEqual = 8,
  GreaterOrEqual = 9,
  Or = 10,
  And = 11,
  Not = 12,
  Is = 13,
  Plus = 14,
  Minus = 15,
  Div = 16,
  Mul = 17,
  // last op
  Assign = 18,
  Comma = 19,
  Semi = 20,
  Colon = 21,
  LeftParen = 22,
  RightParen = 23,
  LeftSquiggly = 24,
  RightSquiggly = 25,
  LeftSquare = 26,
  RightSquare = 27,
  // const start
  String = 28,
  Number = 29,
  Boolean = 30,
  True = 31,
  False = 32,
  // const end
  Break = 50,
  Id = 51,
  For = 52,
  Foreach = 53,
  Forever = 54,
  In = 55,
  To = 56,
  By = 57,
  Do = 58,
  While = 59,
  If = 60,
  Then = 61,
  Else = 62,
  ElIf = 63,
  End = 64,
  Begin = 65,
  Function = 66,
  Var = 67,
  Return = 68,
  On = 69,
  Event = 70,
  IdPlaceholder = 100,
  ParamPlaceholder = 101,
  ExpPlaceholder = 102,
  StatementPlaceholder = 103
}

/**
 * not sure why we need class here; type will work just fine
 */
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

  public static makeWs(): Token {
    return new Token(TokenKind.Ws, '', 0);
  }
}

