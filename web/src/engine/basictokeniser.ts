import { AstNode } from "./basic";

export class ParseError {

}

export enum TokenKind {
  Eol = 1,
  // first op
  Equal,
  Less,
  Greater,
  LessOrEqual,
  GreaterOrEqual,
  Or,
  And,
  Not,
  Plus,
  Minus,
  Div,
  Mul,
  // last op
  Assign,
  Comma,
  Colon,
  ParenLeft,
  ParenRight,
  SquigglyLeft,
  SquigglyRight,
  SquareLeft,
  SquareRight,
  String,
  Number,
  Id,
  If,
  Then,
  Else,
  ElIf,
  End,
  Begin,
  Proc,
  Var,
}

export function isOpTokenKind(kind: TokenKind): boolean {
  return kind >= TokenKind.Equal && kind <= TokenKind.Mul;
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

  public skipWhite() {
    while (!this.isEol) {
      let c = this.peekNext();
      if (!(c === ' ' || c === '\t')) {
        return;
      }
      this.move(1);
    }
  }
}

export type MatchResult = {
  found: boolean;
  used: number;
  tokens: Token[];
}

export enum MatchTermCount {
  maybeOne,
  one,
  zeroMore,
  oneMore,
}

type MatchExpTerm = {
  kind: TokenKind;
  capture: boolean;
  count: number;
  tokens: TokenKind[];
}

export class MatchExp {
  private terms: MatchExpTerm[] = [];

  public choice(capture: boolean, termCount: MatchTermCount, ...args: TokenKind[]) {

  }
  public any(...args: TokenKind[]) {

  }

  public match(tokens: Token[], startIdx: number): MatchResult {
    let term: number = 0;
    for (let i = startIdx; i < tokens.length; i++) {
      let token = tokens[i];
      if (this.matchTerm(this.terms[term], token.kind)) {

      }
    }
    //    return true;

  }

  private matchTerm(term: MatchExpTerm, token: TokenKind) {
    for (let t of term.tokens) {
      if (t === token) {
        return true;
      }
    }
    return false;
  }
}

export function Match(): MatchExp {
  return new MatchExp();
}

export class Tokenizer {
  private nextToken: number = -1;
  private readonly tokens: Token[] = [];

  public static load(source: string): Tokenizer {
    let tokenizer = new Tokenizer()
    this.load(source);
    return tokenizer;
  }

  // read next token
  public read(): Token {
    if (this.nextToken === -1) {
      throw new ParseError();
    }
    let token = this.tokens[this.nextToken];
    this.nextToken++;
    if (this.nextToken > this.tokens.length) {
      this.nextToken = -1;
    }

    return token;
  }

  public peek(): Token {
    if (this.nextToken === -1) {
      throw new ParseError();
    }
    return this.tokens[this.nextToken];
  }

  // we want to say
  // match("end__")
  public match(exp: MatchExp): { match: boolean, lastToken: Token } {
    return exp.match(this.tokens, this.nextToken);
  }

  public hasToken(): boolean {
    return this.nextToken !== -1;
  }

  private load(source: string) {
    let reader = new StringReader(source);
    while (!reader.isEol) {
      let token = this.readNext(reader);
      if (token !== undefined) {
        this.tokens.push(token);
      }
    }

    if (this.tokens.length > 0) {
      this.nextToken = 0;
    }
  }

  private readNext(reader: StringReader): Token | undefined {

    reader.skipWhite();
    if (reader.isEol) {
      return undefined;
    }

    let pos = reader.pos;
    let c = reader.readNext();
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
        return new Token(TokenKind.Greater, c, pos);
      case '<':
        return new Token(TokenKind.Less, c, pos);
      case '=':
        return new Token(TokenKind.Equal, c, pos);
      case '-':
        return new Token(TokenKind.Minus, c, pos);
      case '+':
        return new Token(TokenKind.Plus, c, pos);
      case '(':
        return new Token(TokenKind.ParenLeft, c, pos);
      case ')':
        return new Token(TokenKind.ParenRight, c, pos);
      case '[':
        return new Token(TokenKind.SquareLeft, c, pos);
      case ']':
        return new Token(TokenKind.SquareRight, c, pos);
      case '{':
        return new Token(TokenKind.SquigglyLeft, c, pos);
      case '}':
        return new Token(TokenKind.SquigglyRight, c, pos);
      case ',':
        return new Token(TokenKind.Comma, c, pos);
      case 'o':
        if (reader.peekNext() === 'r') {
          reader.move(1);
          return new Token(TokenKind.Or, 'or', pos);
        }
        break;
      case 'a':
        if (reader.compare('nd')) {
          reader.move(2);
          return new Token(TokenKind.And, 'and', pos);
        }
        break;
      case 'n':
        if (reader.compare('ot')) {
          reader.move(2);
          return new Token(TokenKind.Not, 'not', pos);
        }
        break;
      case ':':
        reader.move(1);
        if (reader.peekNext() === '=') {
          return new Token(TokenKind.Assign, ':=', pos);
        } else {
          return new Token(TokenKind.Colon, ':', pos);
        }
      case '\n':
        return new Token(TokenKind.Eol, '\n', pos);
        return;
      case '\r':
        if (reader.peekNext() === '\n') {
          reader.move(1);
        }
        return new Token(TokenKind.Eol, '\n', pos);
        return;
    }

    this.readId(reader, c, pos);
  }

  private readId(reader: StringReader, head: string, pos: number) {
    let s: string[] = [head];
    while (!reader.isEol) {
      let c = reader.peekNext();
      if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')) {
        reader.readNext();
        s.push(c);
      } else if (c === '_') {
        reader.readNext();
        s.push(c);
      } else {
        let name = "".concat(...s);
        return new Token(this.getIdKind(name), name, pos);
        return;
      }
    }

    // read until EOL
    let name = "".concat(...s);
    return new Token(this.getIdKind(name), name, pos);
  }

  private getIdKind(name: string): TokenKind {
    switch (name) {
      case 'if': return TokenKind.If;
      case 'then': return TokenKind.Then;
      case 'else': return TokenKind.Else;
      case 'elif': return TokenKind.ElIf;
      case 'end': return TokenKind.End;
      case 'begin': return TokenKind.Begin;
      case 'or': return TokenKind.Or;
      case 'and': return TokenKind.And;
      case 'not': return TokenKind.Not;
      case 'proc': return TokenKind.Proc;
      case 'var': return TokenKind.Var;
      default: return TokenKind.Id;
    }
  }

  private readString(reader: StringReader, head: string, pos: number) {
    let s: string[] = [head];
    while (!reader.isEol) {
      let c = reader.readNext();
      s.push(c);
      if (c === '\\') {
        s.push(reader.readNext());
      } else if (c === '"') {
        return new Token(TokenKind.String, "".concat(...s), pos);
        return;
      }
    }
  }

  private readNumber(reader: StringReader, head: string, pos: number) {
    let s: string[] = [head];
    while (!reader.isEol) {
      let c = reader.peekNext();
      if (c >= '0' && c <= '9') {
        reader.readNext();
        s.push(c);
      } else if (c === '.') {
        reader.readNext();
        s.push(c);
      } else {
        return new Token(TokenKind.Number, "".concat(...s), pos);
      }
    }
    return new Token(TokenKind.Number, "".concat(...s), pos);
  }
}