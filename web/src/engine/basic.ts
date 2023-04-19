export class Tokeniser {
  public read(): string {
    return '';
  }

  public peek(): string {
    return '';
  }

  public hasToken(): boolean {
    return false;
  }
}

export type AstNode = {

}

export type StatementNode = AstNode & {

}

export type VarDefNode = AstNode & {
  name: string;
  value: ExpressionNode | undefined;
}

export type AssingmentNode = StatementNode & {
  name: string;
  value: ExpressionNode;
}

export type CallNode = StatementNode & {
  name: string;
  params: ExpressionNode[];
}

export type BlockNode = {
  statements: StatementNode[];
}

export type ExpressionNode = AstNode & {
  //exp
}

export type IfNode = StatementNode & {
  exp: AstNode;
  th: AstNode;
  // elif translated to el -> IfNode
  el: AstNode | undefined;
}

export class ParseError {

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
  private tokeniser: Tokeniser = new Tokeniser();

  processLine() {
    while (this.tokeniser.hasToken()) {
      let token = this.tokeniser.read();
      switch (token) {
        case 'proc':
          this.parseFuncDef();
          break;
        case 'var':
          this.parseVarDef();
          break;
        case 'if':
          this.parseIf();
          break;
      }
    }
  }

  parseFuncDef() {
    let name = this.tokeniser.read();
    let startParam = this.tokeniser.read();
    if (startParam !== '(') {
      throw new ParseError();
    }
    while (this.tokeniser.peek() !== ')') {
      this.parseFuncParam();
    }
    this.tokeniser.read();
    if (this.tokeniser.peek() === ':') {
      this.tokeniser.read();
      this.parseTypeName();
    }
  }

  parseFuncParam() {

  }

  parseTypeName() {

  }


  parseIf(): IfNode {
    let exp = this.parseExpression();
    let checkEnd = (): boolean => {
      let endToken = this.tokeniser.peek();
      if (endToken === 'else' || endToken === 'elif' || endToken === 'end') {
        return true;
      }

      return false;
    }


    let thenToken = this.tokeniser.read();
    if (thenToken !== 'then') {
      throw new ParseError();
    }

    let th = this.parseBlock(checkEnd);
    let endToken = this.tokeniser.read();
    if (endToken === 'else') {
      return {
        exp: exp, th: th, el: this.parseBlock(checkEnd)
      }
    } else if (endToken === 'elif') {
      return {
        exp: exp, th: th, el: this.parseIf()
      }
    } else if (endToken === 'end') {
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
    let name = this.tokeniser.read();
    if (this.tokeniser.peek() === ':=') {
      this.tokeniser.read();
      return { name: name, value: this.parseExpression() }
    } else {
      return { name: name, value: undefined }
    }
  }

  parseStatement(): StatementNode {
    let token = this.tokeniser.read();
    switch (token) {
      case 'if':
        return this.parseIf();
    }

    // otherwise, it is either call or assingment
    // the latter can be detected by having :=
    let nextToken = this.tokeniser.peek();
    if (nextToken === ':=') {
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
    return {
      name: 'hallo',
      params: []
    }
  }

  parseExpression(): ExpressionNode {
    return {

    }
  }
}

export class BasicGenerator {

}
