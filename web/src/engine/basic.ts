import {
  ModuleNode,
  AstNode,
  FuncDefNode,
  ParamDefNode,
  IfNode,
  BlockNode, VarDefNode, StatementNode, AssingmentNode, CallNode,
  ExpressionNode, OpNode, ConstNode
} from "./ast";
import { Match, ParseError, Token, TokenKind, Tokenizer, isOpTokenKind } from "./basictokeniser";


class ParseRule {
  private tokenizer: Tokenizer;
  private parent: ParseRule | undefined;
  private tokens: TokenKind[] = [];

  public constructor(parent: ParseRule | undefined, tokenizer: Tokenizer, ...args: TokenKind[]) {
    this.parent = parent;
    this.tokenizer = tokenizer;
    this.tokens = args;
  }

  public createChild(...args: TokenKind[]): ParseRule {
    return new ParseRule(this, this.tokenizer, ...args);
  }

  public read(): Token {

  }

  public peek(): Token {

  }

  public hasToken(): boolean {
    return false;
  }

  public match(token: TokenKind): boolean {
    for (let t of this.tokens) {
      if (t === token) {
        return true;
      }
    }

    return false;
  }
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
  parse(text: string): ModuleNode {
    let children: AstNode[] = [];
    let tokenizer = new Tokenizer(text);
    let rule = new ParseRule(undefined, tokenizer)

    while (rule.hasToken()) {
      let token = rule.read();
      switch (token.kind) {
        case TokenKind.Proc:
          children.push(this.parseFuncDef(rule));
          break;
        case TokenKind.Var:
          children.push(this.parseVarDef(rule));
          break;
      }
    }

    return {
      children: children
    }
  }

  parseFuncDef(rule: ParseRule): FuncDefNode {
    let name = rule.read();
    let startParam = rule.read();
    if (startParam.kind !== TokenKind.ParenLeft) {
      throw new ParseError();
    }
    let childRule = rule.createChild(TokenKind.ParenRight);

    let params: ParamDefNode[] = [];
    while (childRule.hasToken()) {
      let paramRule = childRule.createChild(TokenKind.ParenRight, TokenKind.Comma)
      params.push(this.parseFuncParam(paramRule));
    }
    // read parentesis
    let endParam = this.tokenizer.read();
    if (endParam.kind !== TokenKind.ParenRight) {
      throw new ParseError();
    }

    let returnVal: Token | undefined = undefined;

    // check if we have return value
    if (this.tokenizer.peek().kind === TokenKind.Colon) {
      returnVal = this.tokenizer.read();
    }

    let checkEnd = (): boolean => {
      let endToken = this.tokenizer.peek();
      if (endToken.kind === TokenKind.End) {
        return true;
      }

      return false;
    }

    let beginBody = this.tokenizer.read();
    if (beginBody.kind !== TokenKind.Begin) {
      throw new ParseError();
    }

    let body = this.parseBlock(checkEnd);
    return {
      name: name,
      params: params,
      returnValue: returnVal,
      body: body
    }
  }

  // read pair name:type
  parseFuncParam(rule: ParseRule): ParamDefNode {
    let name = rule.read();
    let colon = rule.read();
    if (colon.kind !== TokenKind.Colon) {
      throw new ParseError();
    }
    let paramType = rule.read();
    return {
      name: name,
      paramType: paramType
    }
  }

  parseIf(): IfNode {
    let exp = this.parseExpression(new EndMatcher(TokenKind.Then));
    let checkEnd = (): boolean => {
      let endToken = this.tokenizer.peek();
      if (endToken.kind === TokenKind.Else || endToken.kind === TokenKind.ElIf || endToken.kind === TokenKind.End) {
        return true;
      }

      return false;
    }

    let thenToken = this.tokenizer.match(Match.create().One(TokenKind.Then).Any().);
    if (thenToken.kind !== TokenKind.Then) {
      throw new ParseError();
    }

    let th = this.parseBlock(new EndMatcher(TokenKind.Else, TokenKind.ElIf, TokenKind.End));
    let endToken = this.tokenizer.read();
    if (endToken.kind === TokenKind.Else) {
      return {
        exp: exp, th: th, el: this.parseBlock(checkEnd)
      }
    } else if (endToken.kind === TokenKind.ElIf) {
      return {
        exp: exp, th: th, el: this.parseIf()
      }
    } else if (endToken.kind === TokenKind.End) {
      return {
        exp: exp, th: th, el: undefined
      }
    } else {
      throw 'Unknown token';
    }
  }

  parseBlock(endMatcher: EndMatcher): BlockNode {
    let block: BlockNode = { statements: [] };

    while (true) {
      if (endMatcher.match(this.tokenizer.peek())) {
        break;
      }

      this.parseStatement();
    }

    return block;
  }

  parseVarDef(): VarDefNode {
    let name = this.tokenizer.read();
    if (this.tokenizer.peek().kind === TokenKind.Assign) {
      this.tokenizer.read();
      return { name: name, value: this.parseExpression() }
    } else {
      return { name: name, value: undefined }
    }
  }

  // statement if either control structure, assingment or call
  // ends with EOL or Semi
  parseStatement(): StatementNode {
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

  parseCall(): CallNode {
    let name = this.tokenizer.read();
    let useParen = this.tokenizer.peek().kind === TokenKind.ParenLeft;

    if (useParen) {
      this.tokenizer.read();
    }

    let checkEnd = () => {
      let endToken = this.tokenizer.peek();
      if (useParen) {
        if (endToken.kind === TokenKind.ParenRight) {
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

  parseCallParams(endMatcher: EndMatcher): ExpressionNode[] {
    let params: ExpressionNode[] = [];
    while (true) {
      if (endMatcher.match(this.tokenizer.peek().kind)) {
        break;
      }

      params.push(this.parseExpression(endMatcher.clone().add(TokenKind.Comma)));
    }
    return params;
  }

  // expression has form X op Y where X and Y can be either expression, call or id
  parseExpression(endMatcher: EndMatcher): ExpressionNode {
    let children: AstNode[] = [];

    while (true) {
      if (endMatcher.match()) {
        return { children: children };
      }

      let token = this.tokenizer.read();
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
          case TokenKind.ParenLeft: {
            children.push(this.parseExpression(new EndMatcher(TokenKind.ParenRight));
            this.tokenizer.read();
            break;
          }
          case TokenKind.Id: {
            // for ID we have to look ahead and see if next token 
            // is separator or op. In this case, id is just id
            // if next token is left paren, it is a call
            let nextToken = this.tokenizer.peek();

            children.push(c);
            break;
          }
        }
      }
    }
  }
}

export class BasicGenerator {

}
