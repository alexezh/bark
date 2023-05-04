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

export enum TokenCategory {
  Ws,
  End,
  Token,
  Disallow,
}

export class ParserContext {
  public prev: ParserContext | undefined = undefined;
  public constructor(prev: ParserContext | undefined = undefined) {
    this.prev = prev;
  }

  public semiRule?: boolean;
  public wsRule?: boolean;
  public eolRule?: boolean;
  public endTokens: TokenKind[] | undefined;
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
  readonly parent: BasicParser | undefined;
  readonly tokenizer: Tokenizer;
  readonly startIdx: number;
  readonly eolRule: EolRule = EolRule.Inherit;
  readonly semiRule: SemiRule = SemiRule.Inherit;
  readonly endRule: EndRule = EndRule.Pass;
  readonly endTokens: TokenKind[] | undefined;
  private currentIdx: number;
  private _token!: Token;
  private _isEos: boolean = false;
  private ctx!: ParserContext;

  constructor(parent: BasicParser | undefined, tokenizer: Tokenizer, startIdx: number, rules: ParserRules, endRule: EndRule | undefined = undefined) {
    this.parent = parent;
    this.tokenizer = tokenizer;
    this.startIdx = startIdx;
    this.currentIdx = this.startIdx;
    this.eolRule = (rules.eolRule !== undefined) ? rules.eolRule : EolRule.Inherit;
    this.semiRule = (rules.semiRule !== undefined) ? rules.semiRule : SemiRule.Inherit;
    this.endRule = (endRule !== undefined) ? endRule : EndRule.Pass;
    this.endTokens = rules.endTokens;
  }

  public withContext<T>(func: (parser: BasicParser, ...args: any[]) => T, ...args: any[]): T {
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
  }

  public setEol(eolRule: boolean) {
    this.ctx.eolRule = eolRule;
  }

  public setWs(wsRule: boolean) {
    this.ctx.wsRule = wsRule;
  }

  public setEndToken(tokens: TokenKind[]) {
    this.ctx.endTokens = tokens
  }

  public setSemi(semiRule: boolean) {
    this.ctx.semiRule = semiRule;
  }

  public get isEos(): boolean { return this._isEos; }

  /**
   * move reader to specific token
   * next read will return this token
   */
  public moveTo(token: Token) {
    this.currentIdx = token.idx;
  }
  /*
    public parseNestedScope<T>(
      func: (parser: BasicParser) => T,
      startToken: Token,
      parseRule: ParserRules): T {
  
      let res = this.parseScopeCore(func, startToken, parseRule, EndRule.Inherit);
      // if we inherited and current token is last one; we just return
      let action = this.getTokenCategory(this._token);
      if (action === TokenCategory.End) {
        this._isEos = true;
      }
  
      return res;
    }
  
    // creates a parser which reads up to endToken
    // when parsing is done, parser has position on the end token
    public parseScope<T>(
      func: (parser: BasicParser) => T,
      startToken: Token,
      parseRule: ParserRules): T {
  
      return this.parseScopeCore(func, startToken, parseRule, EndRule.Pass);
    }
  
    private parseScopeCore<T>(
      func: (parser: BasicParser) => T,
      startToken: Token,
      parseRule: ParserRules,
      endRule: EndRule) {
  
      // create parser starting with token index
      let parser = new BasicParser(this, this.tokenizer, startToken.idx, parseRule, endRule);
      let childAst = func(parser);
  
      this.currentIdx = parser.currentIdx;
      this._token = parser._token;
  
      return childAst;
    }
  */
  /*
    reads until stop condition
    positions token at the stop position
    there is slight difference with peek. Peek returns undefined
    for end token while read positions parser to next token while
    returning false
  */
  public tryRead(): boolean {

    // if we positioned at the end, return false
    if (this._isEos) {
      return false;
    }

    let tokens = this.tokenizer.tokens;
    while (this.currentIdx < tokens.length) {
      let token = tokens[this.currentIdx++];

      let action = this.getTokenCategory(token);

      if (action === TokenCategory.Ws) {
        continue;
      } else if (action === TokenCategory.End) {
        this._token = token;
        return false;
      } else {
        this._token = token;
        return true;
      }
    }

    return false;
  }

  public read(): Token {
    if (!this.tryRead()) {
      throw new ParseError();
    }

    return this._token;
  }

  // throws in case of error
  public readKind(kind: TokenKind): Token {
    this.tryRead();
    if (this.token.kind !== kind) {
      throw new ParseError();
    }
    return this.token;
  }

  public get token(): Token { return this._token };

  public peek(): Token | undefined {
    let tokens = this.tokenizer.tokens;
    let idx = this.currentIdx;
    while (idx < tokens.length) {
      let token = tokens[idx++];
      let action = this.getTokenCategory(token);

      if (action === TokenCategory.Ws) {
        continue;
      } else if (action === TokenCategory.End) {
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

  /**
   * checks if token is end token following inheritance rules
   */
  private getTokenCategory(token: Token): TokenCategory {
    if (token.kind === TokenKind.Ws) {
      return TokenCategory.Ws;
    } else if (token.kind === TokenKind.Eol) {
      if (this.eolRule === EolRule.Inherit) {
        if (this.parent !== undefined) {
          return this.parent.getTokenCategory(token);
        } else {
          // assume that eol is whitespace
          return TokenCategory.Ws;
        }
      } else {
        return (this.eolRule === EolRule.Token) ? TokenCategory.End : TokenCategory.Ws;
      }
    } else if (token.kind === TokenKind.Semi) {
      if (this.semiRule === SemiRule.Inherit) {
        if (this.parent !== undefined) {
          return this.parent.getTokenCategory(token);
        } else {
          // assume that semi is a end token
          return TokenCategory.Token;
        }
      } else if (this.semiRule === SemiRule.Disallow) {
        throw new ParseError('Cannot have ; in this context');
      } else {
        return TokenCategory.End;
      }
    }

    if (this.endTokens !== undefined) {
      for (let et of this.endTokens) {
        if (et === token.kind) {
          this._token = token;
          return TokenCategory.End;
        }
      }
    }

    if (this.endRule === EndRule.Inherit) {
      if (this.parent !== undefined) {
        let action = this.parent.getTokenCategory(token);
        this._token = token;
        return action;
      }
    }

    return TokenCategory.Token;
  }
}