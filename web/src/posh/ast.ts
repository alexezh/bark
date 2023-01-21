export type PtObj = {
  kind: string;
}

export type PtCall = PtObj & {
  name: object;
  params: object[];
}

export type PtSequence = PtObj & {
  name: object;
  expressions: object[];
}

export enum AstNodeKind {
  Sequence,
  Func,
  Param,
  Value
}

export class AstNode {
  public name: string;
  public value: any;
  public kind: AstNodeKind;
  public children: AstNode[] = [];

  public constructor(kind: AstNodeKind, name: string, value: any) {
    this.name = name;
    this.value = value;
    this.kind = kind;
  }
}

export function createFuncCall(name: string, args?: any): AstNode {
  let ast = new AstNode(AstNodeKind.Func, name, undefined);

  if (args !== undefined) {
    for (let key in Object.keys(args)) {
      ast.children!.push({ name: key, value: args[key], kind: AstNodeKind.Param, children: [] });
    }
  }

  return ast;
}

export function intParam(name: string, value: any): AstNode {
  if (typeof value === 'string') {
    return new AstNode(AstNodeKind.Param, name, parseInt(value));
  } else {
    return new AstNode(AstNodeKind.Param, name, value);
  }
}

export function stringParam(name: string, value: any): AstNode {
  return new AstNode(AstNodeKind.Param, name, value);
}

export function formatAst(node: AstNode): string {
  let s: string = '';
  switch (node.kind) {
    case AstNodeKind.Func:
      s += node.name;
      if (node.children !== undefined) {
        node.children.forEach(x => {
          s += ' ';
          s += formatAst(x);
        });
      }
      break;
    case AstNodeKind.Param:
      s += JSON.stringify(node.value);
      break;
    case AstNodeKind.Value:
      s += node.value;
      break;
    default:
      throw 'unknown node kind';
  }
  return s;
}