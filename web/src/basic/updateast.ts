import { AstNodeKind } from "./ast";
import { ATextSegment, TextBlock, TextSpan } from "./textblock";

/**
 * update ast to include text
 */
export function updateAst(block: TextBlock | ATextSegment | TextSpan, text: string) {
  if (block.ast?.kind === AstNodeKind.placeholder) {
    // the simplest is to find position in text, insert to text and reparse everything
    // and then rebuild things. The biggest challenge is matching to existing nodes so 
    // we can keep selection....
    //block.ast
  } else {
    // replace existing
  }
}