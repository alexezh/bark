import { ParseError, Token, TokenKind, Tokenizer } from "./basictokeniser";

export enum EolRule {
  Inherit = 0,
  WhiteSpace = 1,
  Token = 2,
}

export enum SemiRule {
  Inherit = 0,
  End = 1,
  Disallow = 2,
}

export type ParserRules = {
  eolRule?: EolRule,
  semiRule?: SemiRule,
  endTokens?: TokenKind[]
}

export enum EndRule {
  Pass,
  Inherit,
}

export enum IsEndTokenResult {
  No,
  Direct,
  Inherited,
}

export class ParserContext {
  public prev: ParserContext | undefined = undefined;
  public constructor(prev: ParserContext | undefined = undefined) {
    this.prev = prev;
  }

  public endTokens: TokenKind[] | undefined;
  public inheritEndTokens: boolean = true;
  public isEos: boolean = false;

  isEndToken(token: Token): boolean {
    if (this.endTokens === undefined) {
      return false;
    }

    for (let et of this.endTokens) {
      if (et === token.kind) {
        return true;
      }
    }

    return false;
  }

  isEndTokenDeep(token: Token): IsEndTokenResult {
    if (this.isEndToken(token)) {
      return IsEndTokenResult.Direct;
    }

    let cur: ParserContext | undefined = this;
    while (cur !== undefined) {
      if (cur.inheritEndTokens && cur.prev !== undefined) {
        if (cur.prev.isEndToken(token)) {
          return IsEndTokenResult.Inherited;
        }
      }
      cur = cur.prev;
    }

    return IsEndTokenResult.No;
  }
}

/*
  parses list of tokens; produces AST
  the main challenge is with nested rules

  when we have a text a + b, c + d\n, we want
  to have rule (expression)+\n where expressions separated by comma
  but \n is a terminator for both parent expression and for child expression

  so we are going to use nested parsers which check with parent parser 
  if token is terminator for parent. In the latter case, it will keep token
  unread so parent can read it

  also, we treat EOL as whitespace for number of cases. Such as any then, begin
  and other tokens can be parsed by EOL as whitespace. The only time is matters is
  statemens where we want one statement per line. All child parser might inherit this rule
*/
export class BasicParser {
  readonly tokenizer: Tokenizer;
  private currentIdx: number;
  // cached value at currentIdx
  private _token!: Token;
  private tokens: Token[];
  private ctx!: ParserContext;

  constructor(tokenizer: Tokenizer) {
    this.tokenizer = tokenizer;
    this.tokens = this.tokenizer.tokens;
    this.currentIdx = 0;
    this.ctx = new ParserContext();
  }

  /**
   * we need to pass start token as rules might change
   * for instance, we might say that \n is a token while it was ws for the
   * outer rule 
   */
  public withContext<T>(token: Token, func: (parser: BasicParser, ...args: any[]) => T, ...args: any[]): T {
    this.currentIdx = token.idx;
    this._token = this.tokens[this.currentIdx];
    this.pushContext();
    let res = func(this, ...args);
    this.popContext();
    return res;
  }

  public pushContext() {
    this.ctx = new ParserContext(this.ctx);
  }

  public popContext() {
    if (this.ctx.prev === undefined) {
      throw new ParseError();
    }

    this.ctx = this.ctx.prev;

    // child parse might have ended due to parent end token
    // check if it is and decide

    let deepRes = this.ctx.isEndTokenDeep(this._token);
    if (deepRes === IsEndTokenResult.Direct) {
      // consume token
      this.currentIdx++;
      this.ctx.isEos = true;
    } else if (deepRes === IsEndTokenResult.Inherited) {
      // just mark this layer as eos; we will consume token on upper lauer
      this.ctx.isEos = true;
    }
  }

  /**
   * if true; eol is end token
   */
  public setEndRule(tokens: TokenKind[], inherit: boolean = true) {
    this.ctx.endTokens = tokens;
    this.ctx.inheritEndTokens = inherit;
  }

  /**
   * move reader to specific token
   * next read will return this token
   */
  public moveTo(token: Token) {
    this.currentIdx = token.idx;
  }

  public get token(): Token { return this._token };

  public tryRead(): boolean {

    // if we positioned at the end, return false
    if (this.ctx.isEos) {
      return false;
    }

    while (this.currentIdx < this.tokens.length) {
      // get the current token; do not consume it yet
      let token = this.tokens[this.currentIdx];
      this._token = token;

      if (token.kind === TokenKind.Ws) {
        this.currentIdx++;
        continue;
      }

      let deepRes = this.ctx.isEndTokenDeep(token);

      if (deepRes === IsEndTokenResult.Direct) {
        // if this is end token on our level, read it
        this.currentIdx++;
        return false;
      } else if (deepRes === IsEndTokenResult.Inherited) {
        // if this is parent end token, leave it to parent to read
        return false;
      } else {
        this.currentIdx++;
        return true;
      }
    }

    return false;
  }

  public read(): Token {
    if (!this.tryRead()) {
      throw new ParseError();
    }

    return this._token!;
  }

  // throws in case of error
  public readKind(kind: TokenKind): Token {
    if (!this.tryRead()) {
      throw new ParseError();
    }
    if (this.token.kind !== kind) {
      throw new ParseError();
    }
    return this._token!;
  }

  public hasToken(): boolean {
    return this.peek() !== undefined;
  }

  public peek(): Token | undefined {
    if (this.ctx.isEos) {
      return undefined;
    }

    let tokens = this.tokenizer.tokens;
    let idx = this.currentIdx;
    while (idx < tokens.length) {
      let token = tokens[idx++];

      if (token.kind === TokenKind.Ws) {
        continue;
      }

      let deepRes = this.ctx.isEndTokenDeep(token);

      if (deepRes === IsEndTokenResult.Direct) {
        // if this is end token on our level, read it
        return undefined;
      } else if (deepRes === IsEndTokenResult.Inherited) {
        // if this is parent end token, leave it to parent to read
        return undefined;
      } else {
        return token;
      }
    }

    return undefined;
  }

  public peekKind(kind: TokenKind): boolean {
    let token = this.peek();
    if (token === undefined) {
      return false;
    }
    return token.kind === kind;
  }
}