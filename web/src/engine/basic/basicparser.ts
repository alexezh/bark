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
  readonly endTokens: TokenKind[] | undefined;
  private currentIdx: number;
  private _token!: Token;

  constructor(parent: BasicParser | undefined, tokenizer: Tokenizer, startIdx: number, rules: ParserRules) {
    this.parent = parent;
    this.tokenizer = tokenizer;
    this.startIdx = startIdx;
    this.currentIdx = this.startIdx;
    this.eolRule = (rules.eolRule !== undefined) ? rules.eolRule : EolRule.Inherit;
    this.semiRule = (rules.semiRule !== undefined) ? rules.semiRule : SemiRule.Inherit;
    this.endTokens = rules.endTokens;
  }

  // creates a parser which reads up to endToken
  // when parsing is done, parser has position on the end token
  public createChildParser<T>(
    func: (parser: BasicParser) => T,
    startToken: Token,
    parseRule: ParserRules): T {

    // create parser starting with token index
    let parser = new BasicParser(this, this.tokenizer, startToken.idx, parseRule);
    let childAst = func(parser);

    // move our index to match child parser
    this.currentIdx = parser.currentIdx;
    this._token = parser._token;

    return childAst;
  }

  /*
    reads until stop condition
    positions token at the stop position
    there is slight difference with peek. Peek returns undefined
    for end token while read positions parser to next token while
    returning false
  */
  public tryRead(): boolean {
    let tokens = this.tokenizer.tokens;
    while (this.currentIdx < tokens.length) {
      let token = tokens[this.currentIdx++];
      if (token.kind === TokenKind.Ws) {
        continue;
      } else if (this.isEndToken(token)) {
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
      if (token.kind === TokenKind.Ws) {
        continue;
      } else if (this.isEndToken(token)) {
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
  public isEndToken(token: Token): boolean {
    if (token.kind === TokenKind.Eol) {
      if (this.eolRule === EolRule.Inherit) {
        if (this.parent !== undefined) {
          return this.parent.isEndToken(token);
        } else {
          // assume that eol is whitespace
          return false;
        }
      } else {
        return this.eolRule === EolRule.Token;
      }
    } else if (token.kind === TokenKind.Semi) {
      if (this.semiRule === SemiRule.Inherit) {
        if (this.parent !== undefined) {
          return this.parent.isEndToken(token);
        } else {
          // assume that eol is whitespace
          return false;
        }
      } else if (this.semiRule === SemiRule.Disallow) {
        throw new ParseError('Cannot have ; in this context');
      } else {
        return true;
      }
    }

    if (this.endTokens === undefined) {
      if (this.parent !== undefined) {
        if (this.parent.isEndToken(token)) {
          this._token = token;
          return false;
        }
      }
    } else {
      for (let et of this.endTokens) {
        if (et === token.kind) {
          this._token = token;
          return false;
        }
      }
    }

    return false;
  }
}