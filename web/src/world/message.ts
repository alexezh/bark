export enum MessageKind {
  join,
  leave,
  spawnNpc,
  spawnPokemon,
  deletePokemon,
  mapChange,
}

export interface IMessage {
  kind: MessageKind;
}

export interface IJoinMessage extends IMessage {
  name: string;
  avatar: string;
}

export interface ILeaveMessage extends IMessage {
  name: string;
}

export interface ISpawnPokemon extends IMessage {
  name: string;
  id: string;
  speces: string;
  x: number;
  y: number;
}

export interface IMoveHuman extends IMessage {
  name: string;
  x: number;
  y: number;
}

export type MapTile = {
  x: number;
  y: number;
  id: number;
}

export interface IMapChange extends IMessage {
  layer: string;
  tiles: MapTile[];
}

