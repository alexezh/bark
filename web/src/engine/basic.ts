import { FuncDef } from "../posh/funcdef";
import { ParseError, Token, TokenKind, Tokenizer as Tokenizer, isOpTokenKind } from "./basictokeniser";

export type AstNode = {

}

export type ModuleNode = AstNode & {
  children: AstNode[];
}

export type StatementNode = AstNode & {

}

export type ParamDefNode = AstNode & {
  name: Token;
  paramType: Token;
}

export type FuncDefNode = AstNode & {
  name: Token;
  returnValue: Token | undefined;
  params: ParamDefNode[];
  body: BlockNode;
}

export type VarDefNode = AstNode & {
  name: Token;
  value: ExpressionNode | undefined;
}

export type AssingmentNode = StatementNode & {
  name: Token;
  value: ExpressionNode;
}

export type CallNode = StatementNode & {
  name: Token;
  params: ExpressionNode[];
}

export type BlockNode = {
  statements: StatementNode[];
}

export type OpNode = AstNode & {
  op: Token;
}

export type ConstNode = AstNode & {
  value: Token;
}

export type IdNode = AstNode & {
  name: Token;
}

export type ExpressionNode = AstNode & {
  children: AstNode[];
}

export type IfNode = StatementNode & {
  exp: AstNode;
  th: AstNode;
  // elif translated to el -> IfNode
  el: AstNode | undefined;
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
  private tokenizer: Tokenizer;

  public constructor(text: string) {
    this.tokenizer = new Tokenizer(text);
  }

  parse(): ModuleNode {
    let children: AstNode[] = [];

    while (this.tokenizer.hasToken()) {
      let token = this.tokenizer.read();
      switch (token.kind) {
        case TokenKind.Proc:
          children.push(this.parseFuncDef());
          break;
        case TokenKind.Var:
          children.push(this.parseVarDef());
          break;
      }
    }

    return {
      children: children
    }
  }

  parseFuncDef(): FuncDefNode {
    let name = this.tokenizer.read();
    let startParam = this.tokenizer.read();
    if (startParam.kind !== TokenKind.ParenLeft) {
      throw new ParseError();
    }
    let params: ParamDefNode[] = [];
    while (this.tokenizer.peek().kind !== TokenKind.ParenRight) {
      params.push(this.parseFuncParam());
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
  parseFuncParam(): ParamDefNode {
    let name = this.tokenizer.read();
    let colon = this.tokenizer.read();
    if (colon.kind !== TokenKind.Colon) {
      throw new ParseError();
    }
    let paramType = this.tokenizer.read();
    return {
      name: name,
      paramType: paramType
    }
  }

  parseIf(): IfNode {
    let exp = this.parseExpression();
    let checkEnd = (): boolean => {
      let endToken = this.tokenizer.peek();
      if (endToken.kind === TokenKind.Else || endToken.kind === TokenKind.ElIf || endToken.kind === TokenKind.End) {
        return true;
      }

      return false;
    }

    let thenToken = this.tokenizer.read();
    if (thenToken.kind !== TokenKind.Then) {
      throw new ParseError();
    }

    let th = this.parseBlock(checkEnd);
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

  parseBlock(endPred: () => boolean): BlockNode {
    let block: BlockNode = { statements: [] };

    while (true) {
      if (endPred()) {
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

  parseCallParams(endPred: () => boolean): ExpressionNode[] {
    let params: ExpressionNode[] = [];
    while (true) {
      if (endPred()) {
        break;
      }

      let checkEnd = () => {
        if (endPred()) {
          return true;
        }
        let endToken = this.tokenizer.peek();
        if (endToken.kind === TokenKind.Comma) {
          return true;
        }
        return false;
      }

      params.push(this.parseExpression(checkEnd));
    }
    return params;
  }

  // expression has form X op Y where X and Y can be either expression, call or id
  parseExpression(endPred: () => boolean): ExpressionNode {
    let children: AstNode[] = [];

    while (true) {
      if (endPred()) {
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
            children.push(this.parseExpression(() => {
              let endToken = this.tokenizer.peek();
              if (endToken.kind === TokenKind.ParenRight) {
                return true;
              }
              return false;
            }));
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
