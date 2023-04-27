import {
  ModuleNode,
  AstNode,
  FuncDefNode,
  ParamDefNode,
  IfNode,
  VarDefNode, StatementNode, AssingmentNode, CallNode,
  ExpressionNode, OpNode, ConstNode, BlockNode, ForNode, AstNodeKind, IdNode, ReturnNode
} from "./ast";
import { BasicParser, EolRule, SemiRule } from "./basicparser";
import { ParseError, Token, TokenKind, Tokenizer, isOpTokenKind } from "./basictokeniser";


export function parseModule(parser: BasicParser): ModuleNode {
  let children: AstNode[] = [];

  while (parser.tryRead()) {
    switch (parser.token.kind) {
      case TokenKind.Proc:
        children.push(parser.createChildParser(parseFuncDef, parser.token, { eolRule: EolRule.WhiteSpace, endTokens: [TokenKind.End] }));
        break;
      case TokenKind.Var:
        children.push(parser.createChildParser(parseVarDef, parser.token,
          {
            eolRule: EolRule.Token,
            semiRule: SemiRule.End,
            endTokens: []
          }));
        break;
    }
  }

  return {
    kind: AstNodeKind.module,
    children: children
  }
}


// proc foo(params):return begin ... end
function parseFuncDef(parser: BasicParser): FuncDefNode {
  let v = parser.readKind(TokenKind.Proc);
  let name = parser.readKind(TokenKind.Id);
  let leftParent = parser.readKind(TokenKind.LeftParen);

  let params = parser.createChildParser(parseFuncParams, leftParent, { endTokens: [TokenKind.RightParen] });

  let returnVal: Token | undefined = undefined;

  // check if we have return value
  if (parser.peekKind(TokenKind.Colon)) {
    returnVal = parser.readKind(TokenKind.Id);
  }

  let beginBody = parser.readKind(TokenKind.Begin);

  let body = parser.createChildParser(
    (parser) => parseBlock(parser, TokenKind.Begin),
    beginBody,
    { endTokens: [TokenKind.End] });
  return {
    kind: AstNodeKind.funcDef,
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

    params.push(parser.createChildParser(parseFuncParam, parser.token, { endTokens: [TokenKind.Comma] }) as ParamDefNode);
  }

  return params;
}

// read pair name:type
function parseFuncParam(parser: BasicParser): ParamDefNode {
  let name = parser.readKind(TokenKind.Id);
  let colon = parser.readKind(TokenKind.Colon);
  let paramType = parser.readKind(TokenKind.Id);
  return {
    kind: AstNodeKind.paramDef,
    name: name,
    paramType: paramType
  }
}

function parseIf(parser: BasicParser, startToken: TokenKind): IfNode {
  let iif = parser.readKind(startToken);

  // expression ends with then
  let exp = parser.createChildParser(parseExpression, parser.read(), { eolRule: EolRule.WhiteSpace, endTokens: [TokenKind.Then] });

  let th = parser.createChildParser(
    (parser) => parseBlock(parser, TokenKind.Then), parser.token, {
    endTokens: [TokenKind.Else, TokenKind.ElIf, TokenKind.End]
  });
  let endToken = parser.token;
  if (endToken.kind === TokenKind.Else) {
    return {
      kind: AstNodeKind.if,
      exp: exp, th: th, el: parser.createChildParser(
        (parser) => parseBlock(parser, TokenKind.Else), parser.token, {
        endTokens: [TokenKind.End]
      })
    }
  } else if (endToken.kind === TokenKind.ElIf) {
    return {
      kind: AstNodeKind.if,
      exp: exp, th: th, el: parser.createChildParser((parser) => parseIf(parser, TokenKind.ElIf), parser.token, {
        endTokens: [TokenKind.Else, TokenKind.ElIf, TokenKind.End]
      })
    }
  } else if (endToken.kind === TokenKind.End) {
    return {
      kind: AstNodeKind.if,
      exp: exp, th: th, el: undefined
    }
  } else {
    throw 'Unknown token';
  }
}

function parseFor(parser: BasicParser): ForNode {
  // expression ends with then
  let ft = parser.readKind(TokenKind.For);
  let varToken = parser.readKind(TokenKind.Id);
  let assignToken = parser.readKind(TokenKind.Assign);
  let startToken = parser.read();
  let startExp = parser.createChildParser(parseExpression, startToken, { endTokens: [TokenKind.To] });
  let endToken = parser.read();
  let endExp = parser.createChildParser(parseExpression, endToken, { endTokens: [TokenKind.Do, TokenKind.By] });

  let doToken: Token;
  let byExp: ExpressionNode | undefined = undefined;
  if (parser.token.kind === TokenKind.By) {
    let expToken = parser.read();
    byExp = parser.createChildParser(parseExpression, expToken, { endTokens: [TokenKind.Do] });

    doToken = parser.token;
  } else {
    doToken = parser.token;
  }

  let body = parser.createChildParser(
    (parser) => parseBlock(parser, TokenKind.Do), parser.token, {
    endTokens: [TokenKind.End]
  });

  return {
    kind: AstNodeKind.for,
    name: varToken, startExp: startExp, endExp: endExp, byExp: byExp, body: body
  }
}

// assumes block as something with start which should be skipped
function parseBlock(parser: BasicParser, startTokenKind: TokenKind): BlockNode {
  let body: StatementNode[] = [];

  let start = parser.readKind(startTokenKind);

  // we do not know how statement ends; so we will let statement
  // parser to figure out endding
  while (parser.peek() !== undefined) {
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
function parseStatement(parser: BasicParser): StatementNode | undefined {
  let token = parser.read();
  switch (token.kind) {
    case TokenKind.If:
      return parser.createChildParser((parser) => parseIf(parser, TokenKind.If), token, {});
    case TokenKind.For:
      return parser.createChildParser(parseFor, token, {});
    case TokenKind.Var:
      return parser.createChildParser(parseVarDef, token, { eolRule: EolRule.Token });
    case TokenKind.Return:
      return parser.createChildParser(parseReturn, token, { eolRule: EolRule.Token });
  }

  // otherwise, it is either call or assingment
  // the latter can be detected by having :=
  let nextToken = parser.peek();
  if (nextToken === undefined) {
    return undefined;
  }
  if (nextToken.kind === TokenKind.Assign) {
    parser.readKind(TokenKind.Assign);
    // read first token
    let rightSide = parser.read();

    let assingment: AssingmentNode = {
      kind: AstNodeKind.assingment,
      name: token,
      value: parser.createChildParser(parseExpression, rightSide, {
        eolRule: EolRule.Token,
        semiRule: SemiRule.End
      })
    }
    return assingment;
  } else {
    return parser.createChildParser(parseCall, token, {
      eolRule: EolRule.Token,
      semiRule: SemiRule.End
    });
  }
}

// calls do not require parentesus
function parseCall(parser: BasicParser): CallNode {
  let name = parser.readKind(TokenKind.Id);

  let params: ExpressionNode[];
  params = parseCallParams(parser);

  return {
    kind: AstNodeKind.call,
    name: name,
    params: params
  }
}

function parseCallParams(parser: BasicParser): ExpressionNode[] {
  let params: ExpressionNode[] = [];
  while (parser.tryRead()) {
    params.push(parser.createChildParser(parseExpression, parser.token, { endTokens: [TokenKind.Comma] }));
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
        kind: AstNodeKind.op,
        op: token
      }
      children.push(op);
    } else {
      switch (token.kind) {
        case TokenKind.Number:
        case TokenKind.String: {
          let c: ConstNode = {
            kind: AstNodeKind.const,
            value: token
          }
          children.push(c);
          break;
        }
        case TokenKind.LeftParen: {
          children.push(parser.createChildParser(parseExpression, token, {
            eolRule: EolRule.WhiteSpace,
            semiRule: SemiRule.Disallow,
            endTokens: [TokenKind.RightParen]
          }));
          break;
        }
        case TokenKind.Id: {
          // for ID we have to look ahead and see if next token 
          // is separator or op. In this case, id is just id
          // if next token is left paren, it is a call
          //let nextToken = parser.peek();

          let idNode: IdNode = {
            kind: AstNodeKind.id, name: token
          }
          children.push(idNode);
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