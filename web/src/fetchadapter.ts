import Queue from "queue";
import { SpriteSheetProps } from "./graphics/imageatlas";
import { WireTileCollectionProps, TileDef, WireTileDefProps, WireAddCompositeTileResponse } from "./world/tiledef";
import { WireTileLayerUpdate } from "./world/tilelayer";
import { WorldProps } from "./world/gamemap";
import { WireMapData, WireWorldLayer } from "./world/gamelayer";
import { WireSpawnCharacterRequest, WireSpawnPokemonRequest } from "./world/gamestate";
import { WireAvatarProps } from "./world/iavatar";

export interface IFetchAdapter {
  get(uri: string): Promise<any>;
  post(uri: string, body: string): Promise<any>
}

let fetchAdapter: IFetchAdapter | undefined = undefined;
let worldId: string;
let updateQueue: Queue = new Queue();

export function currentWorldId(): string {
  return worldId;
}

export function setFetchAdapter(adapter: IFetchAdapter) {
  fetchAdapter = adapter;
}

export async function fetchWorld(id: string): Promise<WorldProps> {
  worldId = id;

  let worldProps = await (await fetchAdapter!.get(`/api/world/get/${id}`)).json();
  if (worldProps === undefined) {
    throw "cannot connect to server";
  }

  // set some defaults
  worldProps.humanStepDuration = worldProps.humanStepDuration ?? 300;

  // @ts-ignore
  return worldProps;
}

export async function fetchSpriteSheets(): Promise<SpriteSheetProps[]> {
  let atlasPropColl = await (await fetchAdapter!.get(`/api/resource/getatlases/${worldId}`)).json();
  if (atlasPropColl === undefined) {
    throw "cannot connect to server";
  }

  // @ts-ignore
  return atlasPropColl;
}

export async function fetchTiles(): Promise<WireTileCollectionProps> {
  let tileColl = await (await fetchAdapter!.get(`/api/resource/gettiles/${worldId}`)).json();
  if (tileColl === undefined) {
    throw "cannot connect to server";
  }

  // @ts-ignore
  return tileColl;
}

export async function addTileSet(tileSetProps: SpriteSheetProps) {
  updateQueue.push(async () => {
    await fetchAdapter!.post(`/api/resource/addtileset/${worldId}`, JSON.stringify(tileSetProps));
    return true;
  })

  updateQueue.start();
}

export async function storeFile(name: string, data: string): Promise<boolean> {
  let request = JSON.stringify({ name: name, data: data });
  await fetchAdapter!.post(`/api/resource/storefile/${worldId}`, request);
  return true;
}

export function storeFileBackground(name: string, data: string) {
  updateQueue.push(async () => {
    let request = JSON.stringify({ name: name, data: data });
    await fetchAdapter!.post(`/api/resource/storefile/${worldId}`, request);
  })

  updateQueue.start();
}

export type WireFile = {
  name: string;
  data: string;
}

export async function fetchFiles(pattern: string): Promise<WireFile[]> {
  let request = JSON.stringify({ pattern: pattern });
  let files = await (await fetchAdapter!.post(`/api/resource/fetchfiles/${worldId}`, request)).json();
  return files;
}

export async function updateTile(tileProps: WireTileDefProps) {
  updateQueue.push(async () => {
    await fetchAdapter!.post(`/api/resource/updatetile/${worldId}`, JSON.stringify(tileProps));
    return true;
  })

  updateQueue.start();
}

export async function fetchMap(mapId: string): Promise<WireMapData> {
  let tileColl = await (await fetchAdapter!.get(`/api/world/getmap/${worldId + "!" + mapId}`)).json();
  if (tileColl === undefined) {
    throw "cannot connect to server";
  }

  return tileColl;
}

export async function fetchAvatars(): Promise<WireAvatarProps[]> {
  let avatarColl = await (await fetchAdapter!.get(`/api/world/getavatars/${worldId}`)).json();
  if (avatarColl === undefined) {
    throw "cannot connect to server";
  }

  return avatarColl;
}

export async function updateTileLayer(updateMsg: WireTileLayerUpdate) {
  updateQueue.push(async () => {
    await fetchAdapter!.post(`/api/world/updatetilelayer/${worldId}`, JSON.stringify(updateMsg));
    return true;
  })

  updateQueue.start();
}

export async function addCompositeTile(tileProps: WireTileDefProps): Promise<WireAddCompositeTileResponse> {
  let response = await (await fetchAdapter!.post(`/api/resource/addcompositetile/${worldId}`, JSON.stringify(tileProps))).json();
  return response;
}

export function updateAvatarRuntimeProps(avatarId: string, rt: any) {
  updateQueue.push(async () => {
    let rtStr = JSON.stringify(rt);
    let request = JSON.stringify({ avatarId: avatarId, rt: rtStr });
    await fetchAdapter!.post(`/api/world/updateavatarruntimeprops/${worldId}`, request);
    return true;
  });

  updateQueue.start();
}

export async function fetchText(uri: string) {
  return await (await fetchAdapter!.get(uri)).text();
}

export async function spawnPokemon(params: WireSpawnPokemonRequest): Promise<WireAvatarProps> {
  let avatar = await (await fetchAdapter!.post(`/api/world/spawnpokemon/${worldId}`, JSON.stringify(params))).json();
  return avatar;
}

export async function spawnCharacter(params: WireSpawnCharacterRequest): Promise<WireAvatarProps> {
  let avatar = await (await fetchAdapter!.post(`/api/world/spawncharacter/${worldId}`, JSON.stringify(params))).json();
  return avatar;
}

export async function removeAvatar(id: string): Promise<boolean> {
  await fetchAdapter!.post(`/api/world/removeavatar/${worldId}`, JSON.stringify({ id: id }));
  return true;
}
