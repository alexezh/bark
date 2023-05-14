import { BasicLexer } from "./lexer";
import { ParseError, ParseErrorCode } from "./parseerror";
import { Token, TokenKind } from "./token";

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
  public name: string | undefined;
  public endTokens: TokenKind[] | undefined;
  public inheritEndTokens: boolean = true;
  public ignoreEol: boolean = true;
  public isEos: boolean = false;
  public isGreedy: boolean = true;
  public endResult: IsEndTokenResult = IsEndTokenResult.No;

  public constructor(prev: ParserContext | undefined = undefined, name: string | undefined = undefined) {
    this.prev = prev;
    this.name = name;

    // cache ignore flag
    if (prev !== undefined) {
      this.ignoreEol = prev.ignoreEol;
    }
  }

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
      if (!cur.inheritEndTokens) {
        break;
      }
      if (cur.prev !== undefined) {
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
  readonly tokenizer: BasicLexer;
  private nextIdx: number;
  // cached value at nextIdx-1
  private _token: Token | undefined;
  private tokens: Token[];
  private ctx!: ParserContext;
  public callDepth: number = 0;

  constructor(tokenizer: BasicLexer) {
    this.tokenizer = tokenizer;
    this.tokens = this.tokenizer.tokens;
    this.nextIdx = 0;
    this.ctx = new ParserContext();
  }

  /**
   * we need to pass start token as rules might change
   * for instance, we might say that \n is a token while it was ws for the
   * outer rule
   * 
   * consumes the end token 
   */
  public withContextGreedy<T>(token: Token, func: (parser: BasicParser, ...args: any[]) => T, ...args: any[]): T {
    this.nextIdx = token.idx;
    this._token = this.tokens[this.nextIdx];
    this.pushContext();
    let res = func(this, ...args);
    this.popContext();
    return res;
  }

  /**
   * non-greedy version. stops on end token
   */
  public withContext<T>(name: string, token: Token, func: (parser: BasicParser, ...args: any[]) => T, ...args: any[]): T {
    this.nextIdx = token.idx;
    this._token = this.tokens[this.nextIdx];
    this.pushContext(name);
    this.ctx.isGreedy = false;
    let res = func(this, ...args);
    this.popContext();
    return res;
  }

  public withContextGreedy2<T>(name: string, token: Token, func: (parser: BasicParser, ...args: any[]) => T, ...args: any[]): T {
    this.nextIdx = token.idx;
    this._token = this.tokens[this.nextIdx];
    this.pushContext(name);
    let res = func(this, ...args);
    this.popContext();
    return res;
  }

  public pushContext(name: string | undefined = undefined) {
    this.ctx = new ParserContext(this.ctx, name);
  }

  public popContext() {
    if (this.ctx.prev === undefined) {
      throw new ParseError(ParseErrorCode.InvalidArg, this._token, 'Incorrect context stack');
    }

    // the tricky part of this logic is handling inheritance. When we break on child
    // node because of parent rule, we want to reach the level at which rule triggered
    // but if it was child level rule, we do not want to inherit it
    let childCtx = this.ctx;
    this.ctx = this.ctx.prev;

    if (childCtx.endResult === IsEndTokenResult.Direct || this._token === undefined) {
      // nothing to do; we already consumed the token
    } else {
      let deepRes = this.ctx.isEndTokenDeep(this._token!);
      if (deepRes === IsEndTokenResult.Direct) {
        // consume token
        this.nextIdx++;
        this._token = undefined;
        this.ctx.endResult = IsEndTokenResult.Direct;
        this.ctx.isEos = true;
      } else if (deepRes === IsEndTokenResult.Inherited) {
        // just mark this layer as eos; we will consume token on upper lauer
        this.ctx.isEos = true;
      }
    }
  }

  /**
   * if true; eol is end token
   */
  public setEndRule(tokens: TokenKind[], inherit: boolean = true) {
    this.ctx.endTokens = tokens;
    this.ctx.inheritEndTokens = inherit;
  }

  public ignoreEol(val: boolean) {
    this.ctx.ignoreEol = val;
  }

  /**
   * move reader to specific token
   * next read will return this token
   */
  public moveTo(token: Token) {
    this.nextIdx = token.idx;
    this._token = undefined;
  }

  public get token(): Token { return this._token! };

  public triggerEos(): void {
    this.ctx.isEos = true;
  }
  public tryRead(): Token | undefined {

    // if we positioned at the end, return false
    if (this.ctx.isEos) {
      return undefined;
    }

    while (this.nextIdx < this.tokens.length) {
      // get the current token; do not consume it yet
      let token = this.tokens[this.nextIdx];
      this._token = token;

      if (this.isWsToken(token)) {
        this.nextIdx++;
        continue;
      }

      let deepRes = this.ctx.isEndTokenDeep(token);

      if (deepRes === IsEndTokenResult.Direct) {
        this.ctx.endResult = IsEndTokenResult.Direct;
        // if this is end token on our level, read it
        if (this.ctx.isGreedy) {
          this.nextIdx++;
        }
        this._token = undefined;
        return undefined;
      } else if (deepRes === IsEndTokenResult.Inherited) {
        this.ctx.endResult = IsEndTokenResult.Inherited;
        // if this is parent end token, leave it to parent to read
        return undefined;
      } else {
        this.nextIdx++;
        return this._token;
      }
    }

    return undefined;
  }

  public read(): Token {
    if (!this.tryRead()) {
      throw new ParseError(ParseErrorCode.ReadEos, this._token, 'No more tokens');
    }

    return this._token!;
  }

  // throws in case of error
  public readKind(...kind: TokenKind[]): Token {
    if (!this.tryRead()) {
      throw new ParseError(ParseErrorCode.ReadEos, this._token, 'No more tokens');
    }

    for (let target of kind) {
      if (this.token.kind === target) {
        return this._token!;
      }
    }

    throw new ParseError(ParseErrorCode.WrongToken, this._token, `Incorrect token ${this.token.kind}`);
  }

  public peek(): Token | undefined {
    if (this.ctx.isEos) {
      return undefined;
    }

    let tokens = this.tokenizer.tokens;
    let idx = this.nextIdx;
    while (idx < tokens.length) {
      let token = tokens[idx++];

      if (this.isWsToken(token)) {
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

  private isWsToken(token: Token) {
    return token.kind === TokenKind.Ws || (this.ctx.ignoreEol && token.kind === TokenKind.Eol);
  }
}