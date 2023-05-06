import {
  ModuleNode,
  AstNode,
  FuncDefNode,
  ParamDefNode,
  IfNode,
  VarDefNode, StatementNode, AssingmentNode, CallNode,
  ExpressionNode, OpNode, ConstNode, BlockNode, ForNode, AstNodeKind, IdNode, ReturnNode, WhileNode, makeConstNode, makeIdNode
} from "./ast";
import { BasicParser } from "./basicparser";
import { ParseError, Token, TokenKind, isConstTokenKind, isOpTokenKind } from "./basictokeniser";


export function parseModule(parser: BasicParser): ModuleNode {
  let children: AstNode[] = [];

  // we always treat semi as a break for rule
  // it might not be valid in some cases, but it is error anyway
  parser.setEndRule([TokenKind.Semi]);

  while (parser.tryRead()) {
    let token = parser.token;
    if (token === undefined) {
      break;
    }

    switch (token.kind) {
      case TokenKind.Proc:
        children.push(parser.withContext(token, parseFuncDef));
        break;
      case TokenKind.Var:
        children.push(parser.withContext(token, parseVarDef));
        break;
    }
  }

  return {
    kind: AstNodeKind.module,
    name: undefined,
    children: children
  }
}


// proc foo(params):return begin ... end
function parseFuncDef(parser: BasicParser): FuncDefNode {

  parser.setEndRule([TokenKind.End]);

  let v = parser.readKind(TokenKind.Proc);
  let name = parser.readKind(TokenKind.Id);

  let params = parser.withContext(parser.readKind(TokenKind.LeftParen), parseFuncParams, [TokenKind.RightParen]);

  let returnVal: Token | undefined = undefined;

  // check if we have return value
  if (parser.peekKind(TokenKind.Colon)) {
    parser.readKind(TokenKind.Colon);
    returnVal = parseType(parser);
  }

  let body = parser.withContext(parser.readKind(TokenKind.Begin), parseBlock, TokenKind.Begin, [TokenKind.End]);

  return {
    kind: AstNodeKind.funcDef,
    name: name,
    params: params,
    returnValue: returnVal,
    body: body
  }
}

/**
 * later we should validate types and parse complex types
 */
function parseType(parser: BasicParser): Token {
  return parser.read();
}

function parseFuncParams(parser: BasicParser, endTokens: TokenKind[]): ParamDefNode[] {
  let params: ParamDefNode[] = [];

  parser.setEndRule(endTokens);
  let leftParen = parser.readKind(TokenKind.LeftParen);

  while (parser.tryRead()) {

    if (parser.token.kind !== TokenKind.Id) {
      throw new ParseError();
    }

    let name = parser.token;
    let colon = parser.readKind(TokenKind.Colon);
    let paramType = parseType(parser);

    params.push({
      kind: AstNodeKind.paramDef,
      name: name,
      paramType: paramType
    });

    if (parser.peekKind(TokenKind.Comma)) {
      parser.readKind(TokenKind.Comma);
    }
  }

  return params;
}

function parseIf(parser: BasicParser, startToken: TokenKind): IfNode {
  parser.setEndRule([TokenKind.End]);

  let iif = parser.readKind(startToken);

  // expression ends with then
  let exp = parser.withContext(parser.read(), parseExpression, [TokenKind.Then]);

  let thBlock!: BlockNode;
  let elIf: { exp: ExpressionNode, block: BlockNode }[] = [];
  let elBlock!: BlockNode;

  try {
    // move back to then token so we can run loop
    parser.moveTo(parser.token);
    parser.pushContext();
    parser.setEndRule([TokenKind.End]);

    while (parser.tryRead()) {
      let endToken = parser.token;

      if (endToken.kind === TokenKind.Then) {
        thBlock = parser.withContext(endToken, parseBlock, TokenKind.Then, [TokenKind.Else, TokenKind.ElIf]);
      } else if (endToken.kind === TokenKind.Else) {
        elBlock = parser.withContext(endToken, parseBlock, TokenKind.Else);
      } else if (endToken.kind === TokenKind.ElIf) {
        let exp = parser.withContext(parser.read(), parseExpression, [TokenKind.Then]);
        let block = parser.withContext(parser.token, parseBlock, TokenKind.Then, [TokenKind.Else, TokenKind.ElIf]);
        elIf.push({ exp: exp, block: block });
      } else {
        throw 'Unknown token';
      }

      // we are still in the moddile of if
      // ideally, we should have an option for making end call non-greedy
      if (parser.token.kind === TokenKind.Else || parser.token.kind === TokenKind.ElIf) {
        parser.moveTo(parser.token);
      }
    }

    return {
      kind: AstNodeKind.if,
      exp: exp,
      th: thBlock,
      elif: elIf,
      el: elBlock
    };
  }
  finally {
    parser.popContext();
  }
}

function parseFor(parser: BasicParser): ForNode {
  // expression ends with then
  let ft = parser.readKind(TokenKind.For);
  let varToken = parser.readKind(TokenKind.Id);
  let assignToken = parser.readKind(TokenKind.Assign);
  let startExp = parser.withContext(parser.read(), parseExpression, [TokenKind.To]);
  let endExp = parser.withContext(parser.read(), parseExpression, [TokenKind.Do, TokenKind.By]);

  let doToken: Token;
  let byExp: ExpressionNode | undefined = undefined;
  if (parser.token.kind === TokenKind.By) {
    byExp = parser.withContext(parser.read(), parseExpression, [TokenKind.Do]);

    doToken = parser.token;
  } else {
    doToken = parser.token;
  }

  let body = parser.withContext(doToken, parseBlock, TokenKind.Do, [TokenKind.End]);

  return {
    kind: AstNodeKind.for,
    name: varToken, startExp: startExp, endExp: endExp, byExp: byExp, body: body
  }
}

function parseWhile(parser: BasicParser): WhileNode {
  // expression ends with then
  let w = parser.readKind(TokenKind.While);
  let exp = parser.withContext(parser.read(), parseExpression, [TokenKind.Do]);

  let body = parser.withContext(parser.token, parseBlock, TokenKind.Do, [TokenKind.End]);

  return {
    kind: AstNodeKind.while,
    exp: exp,
    body: body
  }
}

// assumes block as something with start which should be skipped
function parseBlock(parser: BasicParser, startTokenKind: TokenKind, endTokens: TokenKind[]): BlockNode {
  parser.setEndRule(endTokens);
  let body: StatementNode[] = [];

  let start = parser.readKind(startTokenKind);

  // we are reading first token for the statement
  while (parser.tryRead()) {
    let statement = parseStatement(parser.token, parser);
    if (statement !== undefined) {
      body.push(statement);
    }
  }

  return {
    kind: AstNodeKind.block,
    children: body
  };
}

// statement if either control structure, assingment or call
// ends with EOL or Semi
//
// some rules (such as assign) support single line
// other rules are more flexible
function parseStatement(token: Token, parser: BasicParser): StatementNode | undefined {
  try {
    parser.pushContext('statement');
    parser.setEndRule([TokenKind.Semi]);

    switch (token.kind) {
      case TokenKind.If:
        return parser.withContext2('if', token, parseIf, TokenKind.If);
      case TokenKind.For:
        return parser.withContext2('for', token, parseFor);
      case TokenKind.While:
        return parser.withContext2('while', token, parseWhile);
      case TokenKind.Var:
        return parser.withContext2('var', token, parseVarDef);
      case TokenKind.Return:
        return parser.withContext2('return', token, parseReturn);
      case TokenKind.Break:
        return {
          kind: AstNodeKind.break
        };
    }

    // otherwise, it is either call or assingment
    // the latter can be detected by having :=
    let nextToken = parser.peek();
    if (nextToken === undefined) {
      return undefined;
    }
    if (nextToken.kind === TokenKind.Assign) {
      parser.readKind(TokenKind.Assign);

      let assingment: AssingmentNode = {
        kind: AstNodeKind.assingment,
        name: token,
        value: parser.withContext(parser.read(), parseExpression)
      }
      return assingment;
    } else {
      parser.ignoreEol(false);
      parser.setEndRule([TokenKind.Eol]);
      return parser.withContext(token, parseCall);
    }
  }
  finally {
    parser.popContext();
  }
}

function parseVarDef(parser: BasicParser): VarDefNode {
  parser.ignoreEol(false);
  parser.setEndRule([TokenKind.Eol]);

  let v = parser.readKind(TokenKind.Var);
  let name = parser.readKind(TokenKind.Id);
  if (parser.peekKind(TokenKind.Assign)) {
    // read assingment
    parser.readKind(TokenKind.Assign);

    // we are keeping policy as is; so we can just pass parser
    return {
      kind: AstNodeKind.varDef,
      name: name, value: parseExpression(parser)
    }
  } else {
    return {
      kind: AstNodeKind.varDef,
      name: name, value: undefined
    }
  }
}

function parseReturn(parser: BasicParser): ReturnNode {
  parser.ignoreEol(false);
  parser.setEndRule([TokenKind.Eol]);
  let v = parser.readKind(TokenKind.Return);

  // we are keeping policy as is; so we can just pass parser
  return {
    kind: AstNodeKind.return,
    value: parseExpression(parser)
  }
}

// calls do not require parentesus
function parseCall(parser: BasicParser): CallNode {
  let name = parser.readKind(TokenKind.Id);

  let params: ExpressionNode[] = [];
  // if next token is (, it is with parentesys
  // make nested parser which reads until )
  if (parser.peekKind(TokenKind.LeftParen)) {
    params = parser.withContext(parser.readKind(TokenKind.LeftParen), (parser) => {
      parser.setEndRule([TokenKind.RightParen]);
      parser.readKind(TokenKind.LeftParen);
      while (parser.tryRead()) {
        params.push(parser.withContext(parser.token, parseExpression));
      }
      return params;

    })
  } else {
    // go through parameters separated by Ws
    // this is bit tricky since ws can be added between id and op
    // so we assume that two ids are two parameters; and id + op is one parameter
    while (parser.tryRead()) {
      params.push(parser.withContext(parser.token, parseExpression, [TokenKind.Comma]));
    }
  }

  return {
    kind: AstNodeKind.call,
    name: name,
    params: params
  }
}

// expression has form "X op Y" where X and Y can be either expression, call or id
// we then treat X op Y op Z as recursion
function parseExpression(parser: BasicParser, endTokens: TokenKind[] | undefined = undefined): ExpressionNode {
  parser.ignoreEol(false);
  if (endTokens === undefined) {
    endTokens = [];
  }
  endTokens.push(TokenKind.Eol);
  parser.setEndRule(endTokens);

  return parseExpressionCore(parser);
}

function parseExpressionCore(parser: BasicParser): ExpressionNode {
  let ltoken = parser.read();

  if (isOpTokenKind(ltoken.kind)) {
    throw new ParseError();
  }

  let left: AstNode | undefined;
  if (ltoken.kind === TokenKind.LeftParen) {
    left = parser.withContext(parser.read(), parseExpression, [TokenKind.RightParen]);
  } else if (isConstTokenKind(ltoken.kind)) {
    left = makeConstNode(ltoken);
  }

  let token = parser.tryRead();

  // if we do not have any token, it is constant
  if (token === undefined) {
    if (ltoken.kind === TokenKind.Id) {
      left = makeIdNode(ltoken)
    } else if (left === undefined) {
      throw new ParseError();
    }

    return {
      kind: AstNodeKind.expression,
      left: left,
      op: undefined,
      right: undefined
    }
  }

  let op: OpNode | undefined;
  let right: AstNode | undefined;

  // if token is op - it is expression, otherwise if it is id or parentesys
  // it is a function call
  if (isOpTokenKind(token.kind)) {
    left = makeIdNode(ltoken);

    op = {
      kind: AstNodeKind.op,
      op: token
    }

    // get right part via recursion
    right = parseExpressionCore(parser);
  } else if (token.kind === TokenKind.Id) {
    // move back so we can read id inside call
    parser.moveTo(token);
    left = parseCall(parser);
  } else {
    throw new ParseError();
  }


  return {
    kind: AstNodeKind.expression,
    left: left,
    op: op,
    right: right
  }
}


export class BasicGenerator {

}
