import { GridPos } from "../posh/pos";

export enum WObjectKind {
  character = 'character',
  pokemon = 'pokemon',
}

export type WObject = {
  x: number,
  y: number,
  kind: WObjectKind,
}

export type WCharacter = WObject & {
  friend: boolean,
}

export type WPokemon = WObject & {
  friend: boolean,
  scary: number;
}

export interface IAvatarAPI {
  look(func: (x: WObject) => boolean): void;

  // return true if avatar can move in direction
  canMove(dir: MoveDirection): boolean;

  // returns direction (as x and y) to avatar
  lookFor(name: string): GridPos | null;

  // actions which avatar can take
  // move in absolute direction
  makeMove(dir: MoveDirection): MoveAction;
  // move relative to current direction
  makeRelMove(dir: RelMoveDirection): MoveAction;
  makeIdle(): CodeAction;
  say(s: string): SayAction;
}

export enum CodeActionKind {
  idle,
  move,
  say,
  teleport,
}

export type CodeAction = {
  kind: CodeActionKind;
}

export enum MoveDirection {
  none = 'none',
  up = 'up',
  down = 'down',
  left = 'left',
  right = 'right'
}

export enum RelMoveDirection {
  none = 'none',
  forward = 'forward',
  back = 'back',
  left = 'left',
  right = 'right'
}

export type MoveAction = CodeAction & {
  dir: MoveDirection;
}

export type SayAction = CodeAction & {
  text: string;
}

export type TeleportAction = CodeAction & {
  mapId: string | undefined;
  layerId: string | undefined;
  pos: GridPos;
}

export const maxLookDistance = 5;

export function dirByRelDirection(dir: MoveDirection, newDir: RelMoveDirection): MoveDirection {
  // for left/right, rotate the vector
  switch (newDir) {
    case RelMoveDirection.forward: return dir;
    case RelMoveDirection.back:
      switch (dir) {
        case MoveDirection.up: return MoveDirection.down;
        case MoveDirection.down: return MoveDirection.up;
        case MoveDirection.right: return MoveDirection.left;
        case MoveDirection.left: return MoveDirection.right;
        default: throw Error('invalid direction');
      }
      break;
    case RelMoveDirection.right:
      switch (dir) {
        case MoveDirection.up: return MoveDirection.left;
        case MoveDirection.down: return MoveDirection.right;
        case MoveDirection.right: return MoveDirection.up;
        case MoveDirection.left: return MoveDirection.down;
        default: throw Error('invalid direction');
      }
      break;
    case RelMoveDirection.left:
      switch (dir) {
        case MoveDirection.up: return MoveDirection.left;
        case MoveDirection.down: return MoveDirection.right;
        case MoveDirection.right: return MoveDirection.down;
        case MoveDirection.left: return MoveDirection.up;
        default: throw Error('invalid direction');
      }
      break;
    default: throw Error('invalid direction');
  }
}

export function deltaByAbsDirection(dir: MoveDirection): GridPos {
  switch (dir) {
    case MoveDirection.down: return { x: 0, y: 1 };
    case MoveDirection.up: return { x: 0, y: -1 };
    case MoveDirection.left: return { x: -1, y: 0 };
    case MoveDirection.right: return { x: 1, y: 0 };
    default: throw Error('invalid direction');
  }
}

