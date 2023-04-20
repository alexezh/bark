
export class ParseError {

}

export enum TokenKind {
  Equal,
  Less,
  Greater,
  LessOrEqual,
  GreaterOrEqual,
  Or,
  And,
  Not,
  Assign,
  Plus,
  Minus,
  Div,
  Mul,
  ParenLeft,
  ParenRight,
  SquigglyLeft,
  SquigglyRight,
  SquareLeft,
  SquareRight,
  String,
  Number,
  Id,
}

export class Token {
  public readonly kind: TokenKind;
  public readonly value: string;
  public readonly pos: number;

  public constructor(kind: TokenKind, value: string, pos: number) {
    this.kind = kind;
    this.value = value;
    this.pos = pos;
  }
}

export class StringReader {
  private source: string;
  private _pos: number = 0;

  public constructor(source: string) {
    this.source = source;
  }

  public get pos(): number { return this._pos; }
  public get isEol(): boolean { return this._pos === this.source.length }
  public readNext(): string {
    let c = this.source[this._pos];
    this._pos++;
    return c;
  }
  public peekNext(): string {
    let c = this.source[this._pos];
    return c;
  }

  public move(n: number): void {
    if (this._pos + n >= this.source.length) {
      return;
    }
    this._pos++;
  }

  public compare(s: string): boolean {
    if (this._pos + s.length >= this.source.length) {
      return false;
    }
    for (let i = 0; i < s.length; i++) {
      if (s[i] !== this.source[this._pos + i]) {
        return false;
      }
    }
    return true;
  }
}

export class Tokeniser {
  private nextToken: Token | undefined;
  private reader: StringReader;

  public constructor(source: string) {
    this.reader = new StringReader(source);
    this.readNext();
  }

  public read(): Token {
    if (this.nextToken === undefined) {
      throw new ParseError();
    }
    let token = this.nextToken;
    this.readNext();
    return token;
  }

  public peek(): Token {
    if (this.nextToken === undefined) {
      throw new ParseError();
    }
    return this.nextToken;
  }

  public hasToken(): boolean {
    return this.nextToken !== undefined;
  }

  private readNext() {
    this.skipWhite();
    if (this.reader.isEol) {
      this.nextToken = undefined;
      return;
    }

    let pos = this.reader.pos;
    let c = this.reader.readNext();
    if ((c >= '0' && c <= '9') || c == '-' || c == '+') {
      this.readNumber(c, pos);
      return;
    }

    if (c === '"') {
      this.readString(c, pos);
      return;
    }


    switch (c) {
      case '>':
        this.nextToken = new Token(TokenKind.Greater, c, pos);
        return;
      case '<':
        this.nextToken = new Token(TokenKind.Less, c, pos);
        return;
      case '=':
        this.nextToken = new Token(TokenKind.Equal, c, pos);
        return;
      case '-':
        this.nextToken = new Token(TokenKind.Minus, c, pos);
        return;
      case '+':
        this.nextToken = new Token(TokenKind.Plus, c, pos);
        return;
      case '(':
        this.nextToken = new Token(TokenKind.ParenLeft, c, pos);
        return;
      case ')':
        this.nextToken = new Token(TokenKind.ParenRight, c, pos);
        return;
      case '[':
        this.nextToken = new Token(TokenKind.SquareLeft, c, pos);
        return;
      case ']':
        this.nextToken = new Token(TokenKind.SquareRight, c, pos);
        return;
      case '{':
        this.nextToken = new Token(TokenKind.SquigglyLeft, c, pos);
        return;
      case '}':
        this.nextToken = new Token(TokenKind.SquigglyRight, c, pos);
        return;
      case 'o':
        if (this.reader.peekNext() === 'r') {
          this.nextToken = new Token(TokenKind.Or, 'or', pos);
          this.reader.move(1);
          return;
        }
        break;
      case 'a':
        if (this.reader.compare('nd')) {
          this.nextToken = new Token(TokenKind.And, 'and', pos);
          this.reader.move(2);
          return;
        }
        break;
      case 'n':
        if (this.reader.compare('ot')) {
          this.nextToken = new Token(TokenKind.Not, 'not', pos);
          this.reader.move(2);
          return;
        }
        break;
      case ':':
        if (this.reader.peekNext() === '=') {
          this.nextToken = new Token(TokenKind.Assign, ':=', pos);
          this.reader.readNext();
          return;
        }
        break;
    }

    this.readId(c, pos);
  }

  private skipWhite() {
    while (!this.reader.isEol) {
      let c = this.reader.peekNext();
      if (!(c === ' ' || c === '\t')) {
        return;
      }
      this.reader.move(1);
    }
  }

  private readId(head: string, pos: number) {
    let s: string[] = [head];
    while (!this.reader.isEol) {
      let c = this.reader.peekNext();
      if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')) {
        this.reader.readNext();
        s.push(c);
      } else if (c === '_') {
        this.reader.readNext();
        s.push(c);
      } else {
        this.nextToken = new Token(TokenKind.Id, "".concat(...s), pos);
        return;
      }
    }

    // read until EOL
    this.nextToken = new Token(TokenKind.Id, "".concat(...s), pos);
  }

  private readString(head: string, pos: number) {
    let s: string[] = [head];
    while (!this.reader.isEol) {
      let c = this.reader.readNext();
      s.push(c);
      if (c === '\\') {
        s.push(this.reader.readNext());
      } else if (c === '"') {
        this.nextToken = new Token(TokenKind.String, "".concat(...s), pos);
        return;
      }
    }
  }

  private readNumber(head: string, pos: number) {
    let s: string[] = [head];
    while (!this.reader.isEol) {
      let c = this.reader.peekNext();
      if (c >= '0' && c <= '9') {
        this.reader.readNext();
        s.push(c);
      } else if (c === '.') {
        this.reader.readNext();
        s.push(c);
      } else {
        this.nextToken = new Token(TokenKind.Number, "".concat(...s), pos);
        return;
      }
    }
  }
}