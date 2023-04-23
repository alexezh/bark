import {
  ModuleNode,
  AstNode,
  FuncDefNode,
  ParamDefNode,
  IfNode,
  BlockNode, VarDefNode, StatementNode, AssingmentNode, CallNode,
  ExpressionNode, OpNode, ConstNode
} from "./ast";
import { ParseError, Token, TokenKind, Tokenizer, isOpTokenKind } from "./basictokeniser";

export enum EolOptions {
  WhiteSpace,
  Token,
}

// parses string; produces AST
/**
 * proc calc(n: integer): integer
 * begin
 *  var a: integer
 *  if n > 1 then
 *    a := 5
 *    b := 6
 *  elif
 *  else
 *  end
 * end calc
 */
export class BasicParser {
  tokenizer: Tokenizer;
  startIdx: number;
  currentIdx: number;
  eolOptions: EolOptions;
  endTokens: TokenKind[];
  private _token!: Token;

  constructor(tokenizer: Tokenizer, startIdx: number, eolOptions: EolOptions, ...args: TokenKind[]) {
    this.tokenizer = tokenizer;
    this.startIdx = startIdx;
    this.currentIdx = this.startIdx;
    this.eolOptions = eolOptions;
    this.endTokens = args;
  }

  // creates a parser which reads up to endToken
  public parseChild<T>(
    startToken: Token,
    func: (parser: BasicParser) => T,
    eolOptions: EolOptions,
    ...endTokens: TokenKind[]): T {

    // create parser starting with token index
    let parser = new BasicParser(this.tokenizer, startToken.idx, eolOptions, ...endTokens);
    let childAst = func(parser);

    // move our index to match child parser
    this.currentIdx = parser.currentIdx;

    return childAst;
  }

  public tryRead(): boolean {
    let tokens = this.tokenizer.tokens;
    while (this.currentIdx < tokens.length) {
      let token = tokens[this.currentIdx++];
      if (token.kind === TokenKind.Ws) {
        continue;
      } else if (this.eolOptions === EolOptions.WhiteSpace) {
        continue;
      } else {
        for (let et of this.endTokens) {
          if (et === token.kind) {
            return false;
          }
        }
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

  public peekKind(kind: TokenKind): boolean {
    let token = this.peek();
    if (token === undefined) {
      return false;
    }
    return token.kind === kind;
  }

  public peek(): Token | undefined {
    let tokens = this.tokenizer.tokens;
    let idx = this.currentIdx;
    while (idx < tokens.length) {
      let token = tokens[idx++];
      if (token.kind === TokenKind.Ws) {
        continue;
      } else if (this.eolOptions === EolOptions.WhiteSpace) {
        continue;
      } else {
        return token;
      }
    }

    return undefined;
  }
}

function parseModule(parser: BasicParser): ModuleNode {
  let children: AstNode[] = [];

  while (parser.tryRead()) {
    switch (parser.token.kind) {
      case TokenKind.Proc:
        children.push(parser.parseChild(parser.token, parseFuncDef, EolOptions.WhiteSpace, TokenKind.End));
        break;
      case TokenKind.Var:
        children.push(parser.parseChild(parser.token, parseVarDef, EolOptions.Token, TokenKind.Eol));
        break;
    }
  }

  return {
    children: children
  }
}


// proc foo(params):return begin ... end
function parseFuncDef(parser: BasicParser): FuncDefNode {
  let name = parser.readKind(TokenKind.Id);
  let leftParent = parser.readKind(TokenKind.LeftParen);

  let params = parser.parseChild(leftParent, parseFuncParams, EolOptions.WhiteSpace, TokenKind.RightParen);

  let returnVal: Token | undefined = undefined;

  // check if we have return value
  if (parser.peekKind(TokenKind.Colon)) {
    returnVal = parser.readKind(TokenKind.Id);
  }

  let beginBody = parser.readKind(TokenKind.Begin);

  let body = parser.parseChild(beginBody, parseBlock, EolOptions.WhiteSpace, TokenKind.End);
  return {
    name: name,
    params: params,
    returnValue: returnVal,
    body: body
  }
}

function parseFuncParams(parser: BasicParser): ParamDefNode[] {
  let params: ParamDefNode[] = [];

  while (parser.tryRead()) {
    params.push(parser.parseChild(parser.token, parseFuncParam, EolOptions.WhiteSpace, TokenKind.Comma) as ParamDefNode);
  }

  return params;
}

// read pair name:type
function parseFuncParam(parser: BasicParser): ParamDefNode {
  let name = parser.readKind(TokenKind.Id);
  let colon = parser.readKind(TokenKind.Colon);
  let paramType = parser.readKind(TokenKind.Id);
  return {
    name: name,
    paramType: paramType
  }
}

function parseIf(parser: BasicParser): IfNode {
  let exp = parser.parseChild(parser.token, parseExpression, EolOptions.WhiteSpace, TokenKind.Then);

  let th = parser.parseChild(parser.token, parseBlock, EolOptions.WhiteSpace, TokenKind.Else, TokenKind.ElIf, TokenKind.End);
  let endToken = parser.token;
  if (endToken.kind === TokenKind.Else) {
    return {
      exp: exp, th: th, el: parser.parseChild(endToken, parseBlock, EolOptions.WhiteSpace, TokenKind.End);
    }
  } else if (endToken.kind === TokenKind.ElIf) {
    return {
      exp: exp, th: th, el: parser.parseChild(endToken, parseIf, EolOptions.WhiteSpace, TokenKind.Else, TokenKind.ElIf, TokenKind.End)
    }
  } else if (endToken.kind === TokenKind.End) {
    return {
      exp: exp, th: th, el: undefined
    }
  } else {
    throw 'Unknown token';
  }
}

function parseBlock(parser: BasicParser): BlockNode {
  let block: BlockNode = { statements: [] };

  while (parser.tryRead()) {
    block.statements.push(parser.parseChild(parser.token, parseStatement, EolOptions.Token, TokenKind.Eol));
  }

  return block;
}

function parseVarDef(parser: BasicParser): VarDefNode {
  let name = parser.readKind(TokenKind.Id);
  if (parser.peekKind(TokenKind.Assign)) {
    parser.read();
    return { name: name, value: parser.parseChild(parser.token, parseExpression, EolOptions.Token, TokenKind.Eol) }
  } else {
    return { name: name, value: undefined }
  }
}

// statement if either control structure, assingment or call
// ends with EOL or Semi
function parseStatement(parser: BasicParser): StatementNode {
  let token = this.tokenizer.read();
  switch (token.kind) {
    case TokenKind.If:
      return this.parseIf();
  }

  // otherwise, it is either call or assingment
  // the latter can be detected by having :=
  let nextToken = this.tokenizer.peek();
  if (nextToken.kind === TokenKind.Assign) {
    let assingment: AssingmentNode = {
      name: token,
      value: this.parseExpression()
    }
    return assingment;
  } else {
    return this.parseCall();
  }
}

function parseCall(parser: BasicParser): CallNode {
  let name = this.tokenizer.read();
  let useParen = this.tokenizer.peek().kind === TokenKind.LeftParen;

  if (useParen) {
    this.tokenizer.read();
  }

  let checkEnd = () => {
    let endToken = this.tokenizer.peek();
    if (useParen) {
      if (endToken.kind === TokenKind.RightParen) {
        return true;
      }
    } else {
      if (endToken.kind === TokenKind.Eol) {
        return true;
      }
    }

    return false;
  }
  let params = this.parseCallParams(checkEnd);
  if (useParen) {
    this.tokenizer.read();
  }

  return {
    name: name,
    params: params
  }
}

function parseCallParams(parser: BasicParser): ExpressionNode[] {
  let params: ExpressionNode[] = [];
  while (parser.read()) {
    params.push(parser.parseChild(parser.token, parseExpression, EolOptions.Token, TokenKind.Comma));
  }
  return params;
}

// expression has form X op Y where X and Y can be either expression, call or id
function parseExpression(parser: BasicParser): ExpressionNode {
  let children: AstNode[] = [];

  while (parser.read()) {
    let token = parser.token;
    if (isOpTokenKind(token.kind)) {
      let op: OpNode = {
        op: token
      }
      children.push(op);
    } else {
      switch (token.kind) {
        case TokenKind.Number: {
          let c: ConstNode = {
            value: token
          }
          children.push(c);
          break;
        }
        case TokenKind.LeftParen: {
          children.push(parser.parseChild(token, parseExpression, EolOptions.WhiteSpace, TokenKind.RightParen));
          break;
        }
        case TokenKind.Id: {
          // for ID we have to look ahead and see if next token 
          // is separator or op. In this case, id is just id
          // if next token is left paren, it is a call
          //let nextToken = parser.peek();

          //children.push(c);
          break;
        }
      }
    }
  }

  return {
    children: children
  }
}


export class BasicGenerator {

}
