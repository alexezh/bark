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
  NotImpl,
}

export class ParseError {
  public readonly msg: string;
  public readonly code: ParseErrorCode;
  public readonly token: Token | undefined;

  public constructor(code: ParseErrorCode, token: Token | undefined, msg: string) {
    this.msg = msg;
    this.code = code;
    this.token = token;
  }
}
