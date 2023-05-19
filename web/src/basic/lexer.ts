import { ParseError, ParseErrorCode } from "./parseerror";
import { Token, TokenKind } from "./token";


export function isOpTokenKind(kind: TokenKind): boolean {
  return kind >= TokenKind.Equal && kind <= TokenKind.Mul;
}

export function isConstTokenKind(kind: TokenKind): boolean {
  return kind >= TokenKind.String && kind <= TokenKind.False;
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
    if (this._pos + n > this.source.length) {
      return;
    }
    this._pos += n;
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

  public skipWs(): number {
    var wsCount = 0;
    while (!this.isEol) {
      let c = this.peekNext();
      if (!StringReader.isWs(c)) {
        return wsCount;
      }
      wsCount++;
      this.move(1);
    }
    return wsCount;
  }

  public static isWs(c: string) {
    return c === ' ' || c === '\t';
  }
}

export class BasicLexer {
  private readonly _tokens: Token[] = [];

  public static load(source: string): BasicLexer {
    let tokenizer = new BasicLexer();
    tokenizer.loadTokens(source);
    return tokenizer;
  }

  public get tokens(): Token[] { return this._tokens }

  private loadTokens(source: string) {
    let reader = new StringReader(source);
    while (!reader.isEol) {
      let token = this.readNext(reader);
      if (token !== undefined) {
        token.idx = this._tokens.length;
        this._tokens.push(token);
      }
    }
  }

  private readNext(reader: StringReader): Token | undefined {

    reader.skipWs();
    if (reader.isEol) {
      return undefined;
    }

    let pos = reader.pos;
    let c = reader.readNext();
    if (c >= '0' && c <= '9') {
      return this.readNumber(reader, c, pos);
    }
    if (c === 't') {
      if (reader.compare('rue')) {
        reader.move(3)
        return new Token(TokenKind.True, 'true', pos);
      }
    } else if (c === 'f') {
      if (reader.compare('alse')) {
        reader.move(4)
        return new Token(TokenKind.False, 'false', pos);
      }
    }

    if (c === '"' || c === '\'') {
      return this.readString(reader, c, pos);
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
      case '*':
        return new Token(TokenKind.Mul, c, pos);
      case '/':
        return new Token(TokenKind.Div, c, pos);
      case '(':
        return new Token(TokenKind.LeftParen, c, pos);
      case ')':
        return new Token(TokenKind.RightParen, c, pos);
      case '[':
        return new Token(TokenKind.LeftSquare, c, pos);
      case ']':
        return new Token(TokenKind.RightSquare, c, pos);
      case '{':
        return new Token(TokenKind.LeftSquiggly, c, pos);
      case '}':
        return new Token(TokenKind.RightSquiggly, c, pos);
      case ',':
        return new Token(TokenKind.Comma, c, pos);
      case ';':
        return new Token(TokenKind.Semi, c, pos);
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
        if (reader.peekNext() === '=') {
          reader.move(1);
          return new Token(TokenKind.Assign, ':=', pos);
        } else {
          return new Token(TokenKind.Colon, ':', pos);
        }
      case '\n':
        return new Token(TokenKind.Eol, '\n', pos);
      case '\r':
        if (reader.peekNext() === '\n') {
          reader.move(1);
        }
        return new Token(TokenKind.Eol, '\n', pos);
    }

    return this.readId(reader, c, pos);
  }

  private readId(reader: StringReader, head: string, pos: number): Token {
    let s: string[] = [head];
    while (!reader.isEol) {
      let c = reader.peekNext();
      if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') ||
        c === '.' ||
        (c >= '0' && c <= '9')) {

        reader.readNext();
        s.push(c);
      } else if (c === '_') {
        reader.readNext();
        s.push(c);
      } else {
        let name = "".concat(...s);
        return new Token(this.getIdKind(name), name, pos);
      }
    }

    // read until EOL
    let name = "".concat(...s);
    return new Token(this.getIdKind(name), name, pos);
  }

  private getIdKind(name: string): TokenKind {
    switch (name) {
      case 'if': return TokenKind.If;
      case 'for': return TokenKind.For;
      case 'foreach': return TokenKind.Foreach;
      case 'forever': return TokenKind.Forever;
      case 'in': return TokenKind.In;
      case 'to': return TokenKind.To;
      case 'by': return TokenKind.By;
      case 'do': return TokenKind.Do;
      case 'on': return TokenKind.On;
      case 'event': return TokenKind.Event;
      case 'while': return TokenKind.While;
      case 'then': return TokenKind.Then;
      case 'else': return TokenKind.Else;
      case 'elif': return TokenKind.ElIf;
      case 'end': return TokenKind.End;
      case 'begin': return TokenKind.Begin;
      case 'or': return TokenKind.Or;
      case 'and': return TokenKind.And;
      case 'not': return TokenKind.Not;
      case 'is': return TokenKind.Is;
      case 'proc': return TokenKind.Proc;
      case 'true': return TokenKind.True;
      case 'false': return TokenKind.False;
      case 'break': return TokenKind.Break;
      case 'var': return TokenKind.Var;
      case 'return': return TokenKind.Return;
      default: return TokenKind.Id;
    }
  }

  private readString(reader: StringReader, head: string, pos: number): Token {
    let s: string[] = [head];
    while (!reader.isEol) {
      let c = reader.readNext();
      s.push(c);
      if (c === '\\') {
        s.push(reader.readNext());
      } else if (c === '"' || c === '\'') {
        return new Token(TokenKind.String, "".concat(...s), pos);
      }
    }

    throw new ParseError(ParseErrorCode.NoStringEnding, new Token(TokenKind.String, "", pos), 'String should end with \"');
  }

  private readNumber(reader: StringReader, head: string, pos: number): Token {
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