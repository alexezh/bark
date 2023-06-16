import { AstNode, AstNodeKind, getModule, replaceNode } from "./ast";
import { parseFuncDef, parseOnDef, parseStatement, parseVarDef } from "./basic";
import { BasicParser } from "./basicparser";
import { validateModule } from "./checker";
import { BasicLexer } from "./lexer";
import { ParseError, ParseErrorCode } from "./parseerror";
import { ATextSegment, TextBlock, TextSpan } from "./textblock";

/**
 * update ast to include text
 */
export function updateAst(ast: AstNode, text: string): AstNode | undefined {
  let parent = ast.parent;

  if (ast.kind === AstNodeKind.linePlaceholder) {
    // the simplest is to find position in text, insert to text and reparse everything
    // and then rebuild things. The biggest challenge is matching to existing nodes so 
    // we can keep selection....
    //block.ast

  } else {
    let module = getModule(ast);
    if (!module) {
      return undefined;
    }
    let replAst = buildAst(ast, text);
    validateModule(module, loader);
    replaceNode(ast, replAst);
    return replAst;
  }
}

function buildAst(ast: AstNode, text: string): AstNode {
  let lx = BasicLexer.load(text);
  let parser = new BasicParser(lx);
  if (!ast.parent) {
    throw new ParseError(ParseErrorCode.InvalidArg, undefined, 'unconnected node');
  }
  let module = getModule(ast);
  if (!module) {
    throw new ParseError(ParseErrorCode.InvalidArg, undefined, 'unconnected node');
  }

  switch (ast.kind) {
    case AstNodeKind.funcDef:
      let func = parseFuncDef(parser, module);
      return func;
    case AstNodeKind.on:
      let ondef = parseOnDef(parser, module);
      return ondef;
    case AstNodeKind.funcDef:
      let vdef = parseVarDef(parser);
      return vdef;
    default:
      parser.read();
      let statement = parseStatement(parser.token, parser);
      if (!statement) {
        return;
      }
      return statement;
  }
}
