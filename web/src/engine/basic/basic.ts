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
  // when parsing is done, parser has position on the end token
  public createChildParser<T>(
    startToken: Token,
    func: (parser: BasicParser) => T,
    eolOptions: EolOptions,
    ...endTokens: TokenKind[]): T {

    // create parser starting with token index
    let parser = new BasicParser(this.tokenizer, startToken.idx, eolOptions, ...endTokens);
    let childAst = func(parser);

    // move our index to match child parser
    this.currentIdx = parser.currentIdx;
    this._token = parser._token;

    return childAst;
  }

  // reads until stop condition
  // positions token at the stop position
  public tryRead(): boolean {
    let tokens = this.tokenizer.tokens;
    while (this.currentIdx < tokens.length) {
      let token = tokens[this.currentIdx++];
      if (token.kind === TokenKind.Ws) {
        continue;
      } else if (token.kind === TokenKind.Eol) {
        if (this.eolOptions === EolOptions.WhiteSpace) {
          continue;
        }
      }

      for (let et of this.endTokens) {
        if (et === token.kind) {
          this._token = token;
          return false;
        }
      }
      this._token = token;
      return true;
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
      } else if (token.kind === TokenKind.Eol) {
        if (this.eolOptions === EolOptions.WhiteSpace) {
          continue;
        }
        return token;
      } else {
        for (let et of this.endTokens) {
          if (et === token.kind) {
            return undefined;
          }
        }
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

export function parseModule(parser: BasicParser): ModuleNode {
  let children: AstNode[] = [];

  while (parser.tryRead()) {
    switch (parser.token.kind) {
      case TokenKind.Proc:
        children.push(parser.createChildParser(parser.token, parseFuncDef, EolOptions.WhiteSpace, TokenKind.End));
        break;
      case TokenKind.Var:
        children.push(parser.createChildParser(parser.token, parseVarDef, EolOptions.Token, TokenKind.Eol));
        break;
    }
  }

  return {
    children: children
  }
}


// proc foo(params):return begin ... end
function parseFuncDef(parser: BasicParser): FuncDefNode {
  let v = parser.readKind(TokenKind.Proc);
  let name = parser.readKind(TokenKind.Id);
  let leftParent = parser.readKind(TokenKind.LeftParen);

  let params = parser.createChildParser(leftParent, parseFuncParams, EolOptions.WhiteSpace, TokenKind.RightParen);

  let returnVal: Token | undefined = undefined;

  // check if we have return value
  if (parser.peekKind(TokenKind.Colon)) {
    returnVal = parser.readKind(TokenKind.Id);
  }

  let beginBody = parser.readKind(TokenKind.Begin);

  let body = parser.createChildParser(beginBody, (parser) => parseBlock(parser, TokenKind.Begin), EolOptions.WhiteSpace, TokenKind.End);
  return {
    name: name,
    params: params,
    returnValue: returnVal,
    body: body
  }
}

function parseFuncParams(parser: BasicParser): ParamDefNode[] {
  let params: ParamDefNode[] = [];

  let leftParen = parser.readKind(TokenKind.LeftParen);

  while (parser.tryRead()) {
    if (parser.token.kind !== TokenKind.Id) {
      throw new ParseError();
    }

    params.push(parser.createChildParser(parser.token, parseFuncParam, EolOptions.WhiteSpace, TokenKind.Comma) as ParamDefNode);
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
  let exp = parser.createChildParser(parser.token, parseExpression, EolOptions.WhiteSpace, TokenKind.Then);

  let th = parser.createChildParser(parser.token,
    (parser) => parseBlock(parser, TokenKind.Then),
    EolOptions.WhiteSpace,
    TokenKind.Else, TokenKind.ElIf, TokenKind.End);
  let endToken = parser.token;
  if (endToken.kind === TokenKind.Else) {
    return {
      exp: exp, th: th, el: parser.createChildParser(endToken,
        (parser) => parseBlock(parser, TokenKind.Else), EolOptions.WhiteSpace, TokenKind.End)
    }
  } else if (endToken.kind === TokenKind.ElIf) {
    return {
      exp: exp, th: th, el: parser.createChildParser(endToken, parseIf, EolOptions.WhiteSpace, TokenKind.Else, TokenKind.ElIf, TokenKind.End)
    }
  } else if (endToken.kind === TokenKind.End) {
    return {
      exp: exp, th: th, el: undefined
    }
  } else {
    throw 'Unknown token';
  }
}

function parseBlock(parser: BasicParser, startTokenKind: TokenKind): BlockNode {
  let block: BlockNode = { statements: [] };

  let start = parser.readKind(startTokenKind);

  while (parser.tryRead()) {
    let statement = parser.createChildParser(parser.token, parseStatement, EolOptions.Token, TokenKind.Eol);
    if (statement !== undefined) {
      block.statements.push();
    }
  }

  return block;
}

function parseVarDef(parser: BasicParser): VarDefNode {
  let v = parser.readKind(TokenKind.Var);
  let name = parser.readKind(TokenKind.Id);
  if (parser.peekKind(TokenKind.Assign)) {
    // read assingment
    parser.read();
    // read to next token after which will be start of expression
    parser.read();

    return { name: name, value: parser.createChildParser(parser.token, parseExpression, EolOptions.Token, TokenKind.Eol, TokenKind.Semi) }
  } else {
    return { name: name, value: undefined }
  }
}

// statement if either control structure, assingment or call
// ends with EOL or Semi
function parseStatement(parser: BasicParser): StatementNode | undefined {
  let token = parser.read();
  switch (token.kind) {
    case TokenKind.If:
      return parser.createChildParser(token, parseIf, EolOptions.WhiteSpace, TokenKind.End);
    case TokenKind.Var:
      return parser.createChildParser(token, parseVarDef, EolOptions.WhiteSpace, TokenKind.End);
  }

  // otherwise, it is either call or assingment
  // the latter can be detected by having :=
  let nextToken = parser.peek();
  if (nextToken === undefined) {
    return undefined;
  }
  if (nextToken.kind === TokenKind.Assign) {
    let assingment: AssingmentNode = {
      name: token,
      value: parser.createChildParser(token, parseExpression, EolOptions.Token, TokenKind.Eol)
    }
    return assingment;
  } else {
    return parser.createChildParser(token, parseCall, EolOptions.Token, TokenKind.Eol);
  }
}

// calls do not require parentesus
function parseCall(parser: BasicParser): CallNode {
  let name = parser.readKind(TokenKind.Id);

  let params: ExpressionNode[];
  params = parseCallParams(parser);

  return {
    name: name,
    params: params
  }
}

function parseCallParams(parser: BasicParser): ExpressionNode[] {
  let params: ExpressionNode[] = [];
  while (parser.tryRead()) {
    params.push(parser.createChildParser(parser.token, parseExpression, EolOptions.Token, TokenKind.Eol, TokenKind.Comma));
  }
  return params;
}

// expression has form X op Y where X and Y can be either expression, call or id
function parseExpression(parser: BasicParser): ExpressionNode {
  let children: AstNode[] = [];

  while (parser.tryRead()) {
    let token = parser.token;
    if (isOpTokenKind(token.kind)) {
      let op: OpNode = {
        op: token
      }
      children.push(op);
    } else {
      switch (token.kind) {
        case TokenKind.Number:
        case TokenKind.String: {
          let c: ConstNode = {
            value: token
          }
          children.push(c);
          break;
        }
        case TokenKind.LeftParen: {
          children.push(parser.createChildParser(token, parseExpression, EolOptions.WhiteSpace, TokenKind.RightParen));
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
        default:
          throw new ParseError('Invalid expression');
      }
    }
  }

  return {
    children: children
  }
}


export class BasicGenerator {

}
