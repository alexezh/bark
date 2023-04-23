import {
  ModuleNode,
  AstNode,
  FuncDefNode,
  ParamDefNode,
  IfNode,
  BlockNode, VarDefNode, StatementNode, AssingmentNode, CallNode,
  ExpressionNode, OpNode, ConstNode
} from "./ast";
import { BasicParser, EolRule, SemiRule } from "./basicparser";
import { ParseError, Token, TokenKind, Tokenizer, isOpTokenKind } from "./basictokeniser";


export function parseModule(parser: BasicParser): ModuleNode {
  let children: AstNode[] = [];

  while (parser.tryRead()) {
    switch (parser.token.kind) {
      case TokenKind.Proc:
        children.push(parser.createChildParser(parseFuncDef, parser.token, { endTokens: [TokenKind.End] }));
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
    children: children
  }
}


// proc foo(params):return begin ... end
function parseFuncDef(parser: BasicParser): FuncDefNode {
  let v = parser.readKind(TokenKind.Proc);
  let name = parser.readKind(TokenKind.Id);
  let leftParent = parser.readKind(TokenKind.LeftParen);

  let params = parser.createChildParser(leftParent, parseFuncParams, EolRule.WhiteSpace, TokenKind.RightParen);

  let returnVal: Token | undefined = undefined;

  // check if we have return value
  if (parser.peekKind(TokenKind.Colon)) {
    returnVal = parser.readKind(TokenKind.Id);
  }

  let beginBody = parser.readKind(TokenKind.Begin);

  let body = parser.createChildParser(beginBody, (parser) => parseBlock(parser, TokenKind.Begin), EolRule.WhiteSpace, TokenKind.End);
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

    params.push(parser.createChildParser(parser.token, parseFuncParam, EolRule.WhiteSpace, TokenKind.Comma) as ParamDefNode);
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
  let exp = parser.createChildParser(parser.token, parseExpression, EolRule.WhiteSpace, TokenKind.Then);

  let th = parser.createChildParser(parser.token,
    (parser) => parseBlock(parser, TokenKind.Then),
    EolRule.WhiteSpace,
    TokenKind.Else, TokenKind.ElIf, TokenKind.End);
  let endToken = parser.token;
  if (endToken.kind === TokenKind.Else) {
    return {
      exp: exp, th: th, el: parser.createChildParser(endToken,
        (parser) => parseBlock(parser, TokenKind.Else), EolRule.WhiteSpace, TokenKind.End)
    }
  } else if (endToken.kind === TokenKind.ElIf) {
    return {
      exp: exp, th: th, el: parser.createChildParser(endToken, parseIf, EolRule.WhiteSpace, TokenKind.Else, TokenKind.ElIf, TokenKind.End)
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
    let statement = parser.createChildParser(parser.token, parseStatement, EolRule.Token, TokenKind.Eol);
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

    return { name: name, value: parser.createChildParser(parser.token, parseExpression, EolRule.Token, TokenKind.Eol, TokenKind.Semi) }
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
      return parser.createChildParser(token, parseIf, EolRule.WhiteSpace, TokenKind.End);
    case TokenKind.Var:
      return parser.createChildParser(token, parseVarDef, EolRule.WhiteSpace, TokenKind.End);
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
      value: parser.createChildParser(token, parseExpression, EolRule.Token, TokenKind.Eol)
    }
    return assingment;
  } else {
    return parser.createChildParser(token, parseCall, EolRule.Token, TokenKind.Eol);
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
    params.push(parser.createChildParser(parser.token, parseExpression, EolRule.Token, TokenKind.Eol, TokenKind.Comma));
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
          children.push(parser.createChildParser(token, parseExpression, EolRule.WhiteSpace, TokenKind.RightParen));
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
