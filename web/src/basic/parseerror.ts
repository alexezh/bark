import { Token, TokenKind } from "./token";

export enum ParseErrorCode {
  Unknown,
  NoStringEnding,
  ReadEos,
  WrongToken,
  InvalidArg,
  InvalidExpression,
  InvalidFuncParams,
  InvalidToken,
}

export class ParseError {
  public readonly msg: string;

  public constructor(code: ParseErrorCode, token: Token | undefined, msg: string) {
    this.msg = msg;
  }
}
