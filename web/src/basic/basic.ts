import { nextPowerOfTwo } from "three/src/math/MathUtils";
import {
  ModuleNode,
  AstNode,
  FuncDefNode,
  ParamDefNode,
  IfNode,
  VarDefNode, StatementNode, AssingmentNode, CallNode,
  ExpressionNode, OpNode, ConstNode, BlockNode, ForNode, AstNodeKind, IdNode, ReturnNode, WhileNode
} from "./ast";
import { BasicParser, EndRule, EolRule, SemiRule } from "./basicparser";
import { ParseError, Token, TokenKind, Tokenizer, isOpTokenKind } from "./basictokeniser";


export function parseModule(parser: BasicParser): ModuleNode {
  let children: AstNode[] = [];

  while (parser.tryRead()) {
    switch (parser.token.kind) {
      case TokenKind.Proc:
        children.push(parser.withContext(parseFuncDef));
        break;
      case TokenKind.Var:
        parser.setSemi(true);
        children.push(parser.withContext(parseVarDef));
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

  parser.setEol(true);
  parser.setEndToken([TokenKind.End]);

  let v = parser.readKind(TokenKind.Proc);
  let name = parser.readKind(TokenKind.Id);

  let params = parser.withContext(parseFuncParams, [TokenKind.RightParen]);

  let returnVal: Token | undefined = undefined;

  // check if we have return value
  if (parser.peekKind(TokenKind.Colon)) {
    parser.readKind(TokenKind.Colon);
    returnVal = parseType(parser);
  }

  let beginBody = parser.readKind(TokenKind.Begin);

  let body = parser.withContext(parseBlock, TokenKind.Begin, [TokenKind.End]);

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

  parser.setEndToken(endTokens);
  let leftParen = parser.readKind(TokenKind.LeftParen);

  while (parser.isEos) {
    parser.read();

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
  let iif = parser.readKind(startToken);

  // expression ends with then
  let exp = parser.withContext((parser) => {
    return parseExpression(parser, [TokenKind.Then]);
  });

  let thBlock!: BlockNode;
  let elIf: { exp: ExpressionNode, block: BlockNode }[] = [];
  let elBlock!: BlockNode;

  try {
    parser.pushContext();
    parser.setEndToken([TokenKind.End]);

    while (!parser.isEos) {
      let endToken = parser.token;

      if (endToken.kind === TokenKind.Then) {
        thBlock = parser.withContext(parseBlock, TokenKind.Then, [TokenKind.Else, TokenKind.ElIf]);
      } else if (endToken.kind === TokenKind.Else) {
        elBlock = parser.withContext(parseBlock, TokenKind.Else);
      } else if (endToken.kind === TokenKind.ElIf) {
        let exp = parser.withContext((parser) => {
          return parseExpression(parser, [TokenKind.Then]);
        });
        let block = parser.withContext(parseBlock, TokenKind.Then, [TokenKind.Else, TokenKind.ElIf]);
        elIf.push({ exp: exp, block: block });
      } else {
        throw 'Unknown token';
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
  let startExp = parser.withContext(parseExpression, [TokenKind.To]);
  let endToken = parser.read();
  let endExp = parser.withContext(parseExpression, [TokenKind.Do, TokenKind.By]);

  let doToken: Token;
  let byExp: ExpressionNode | undefined = undefined;
  if (parser.token.kind === TokenKind.By) {
    let expToken = parser.read();
    byExp = parser.withContext(parseExpression, [TokenKind.Do]);

    doToken = parser.token;
  } else {
    doToken = parser.token;
  }

  let body = parser.withContext(parseBlock, TokenKind.Do[TokenKind.End]);

  return {
    kind: AstNodeKind.for,
    name: varToken, startExp: startExp, endExp: endExp, byExp: byExp, body: body
  }
}

function parseWhile(parser: BasicParser): WhileNode {
  // expression ends with then
  let w = parser.readKind(TokenKind.While);
  let exp = parser.withContext(parseExpression, [TokenKind.Do]);

  let body = parser.withContext(parseBlock, TokenKind.Do, [TokenKind.End]);

  return {
    kind: AstNodeKind.while,
    exp: exp,
    body: body
  }
}
// assumes block as something with start which should be skipped
function parseBlock(parser: BasicParser, startTokenKind: TokenKind, endTokens: TokenKind[]): BlockNode {
  parser.setEndToken(endTokens);
  let body: StatementNode[] = [];

  let start = parser.readKind(startTokenKind);

  // we are reading first token for the statement
  while (parser.tryRead()) {
    let statement = parseStatement(parser);
    if (statement !== undefined) {
      body.push(statement);
    }
  }

  return {
    kind: AstNodeKind.block,
    children: body
  };
}

function parseVarDef(parser: BasicParser): VarDefNode {
  parser.setEol(true);

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
  let v = parser.readKind(TokenKind.Return);

  // we are keeping policy as is; so we can just pass parser
  return {
    kind: AstNodeKind.return,
    value: parseExpression(parser)
  }
}

// statement if either control structure, assingment or call
// ends with EOL or Semi
//
// some rules (such as assign) support single line
// other rules are more flexible
function parseStatement(parser: BasicParser): StatementNode | undefined {
  try {
    parser.pushContext();
    parser.setEndToken([TokenKind.Semi]);

    let token = parser.peek();
    if (token === undefined) {
      return;
    }
    switch (token.kind) {
      case TokenKind.If:
        return parser.withContext(parseIf, TokenKind.If);
      case TokenKind.For:
        return parser.withContext(parseFor);
      case TokenKind.While:
        return parser.withContext(parseWhile);
      case TokenKind.Var:
        return parser.withContext(parseVarDef);
      case TokenKind.Return:
        return parser.withContext(parseReturn);
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
        value: parser.withContext(parseExpression)
      }
      return assingment;
    } else {
      parser.setEol(true);
      return parser.withContext(parseCall);
    }
  }
  finally {
    parser.popContext();
  }
}

// calls do not require parentesus
function parseCall(parser: BasicParser): CallNode {
  let name = parser.readKind(TokenKind.Id);

  let params: ExpressionNode[] = [];
  // if next token is (, it is with parentesys
  // make nested parser which reads until )
  if (parser.peekKind(TokenKind.LeftParen)) {
    params = parser.withContext((parser) => {
      parser.setEndToken([TokenKind.RightParen]);
      parser.readKind(TokenKind.LeftParen);
      while (parser.isEos) {
        params.push(parser.withContext((parser) => {
          parser.setWs(true);
          return parseExpression(parser);
        }));
      }
      return params;

    })
  } else {
    while (parser.isEos) {
      params.push(parser.withContext((parser) => {
        parser.setEndToken([TokenKind.Comma]);
        return parser.withContext(parseExpression);
      }));
    }
  }

  return {
    kind: AstNodeKind.call,
    name: name,
    params: params
  }
}

// expression has form X op Y where X and Y can be either expression, call or id
function parseExpression(parser: BasicParser, endTokens: TokenKind[] | undefined = undefined): ExpressionNode {
  if (endTokens !== undefined) {
    parser.setEndToken(endTokens);
  }

  let children: AstNode[] = [];

  while (parser.isEos) {
    let token = parser.read();
    if (isOpTokenKind(token.kind)) {
      let op: OpNode = {
        kind: AstNodeKind.op,
        op: token
      }
      children.push(op);
    } else {
      switch (token.kind) {
        case TokenKind.Number:
        case TokenKind.String:
        case TokenKind.True:
        case TokenKind.False: {
          let c: ConstNode = {
            kind: AstNodeKind.const,
            value: token
          }
          children.push(c);
          break;
        }
        case TokenKind.LeftParen: {
          children.push(parser.withContext((parser) => {
            parser.setEndToken([TokenKind.RightParen]);
            parser.setSemi(false);
            return parseExpression(parser);
          }));
          break;
        }
        case TokenKind.Id: {
          // for ID we have to look ahead and see if next token 
          // is separator or op. In this case, id is just id
          // if next token is left paren, it is a call
          let nextToken = parser.peek();
          if (nextToken !== undefined) {
            if (isOpTokenKind(nextToken.kind)) {
              let idNode: IdNode = {
                kind: AstNodeKind.id, name: token
              }
              children.push(idNode);
            } else {
              parser.moveTo(token);
              children.push(parseCall(parser));
            }
          } else {
            let idNode: IdNode = {
              kind: AstNodeKind.id, name: token
            }
            children.push(idNode);
          }

          break;
        }
        default:
          throw new ParseError('Invalid expression');
      }
    }
  }

  return {
    kind: AstNodeKind.expression,
    children: children
  }
}


export class BasicGenerator {

}
