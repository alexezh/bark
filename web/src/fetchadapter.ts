import Queue from "queue";

export type WorldProps = {

}

export interface IFetchAdapter {
  get(uri: string): Promise<Response>;
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

export async function fetchResource(url: string): Promise<ArrayBuffer> {
  return await (await (await fetchAdapter!.get(url)).blob()).arrayBuffer();
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

export async function fetchFile(pattern: string): Promise<string | undefined> {
  let request = JSON.stringify({ pattern: pattern });
  let files = await (await fetchAdapter!.post(`/api/resource/fetchfiles/${worldId}`, request)).json();
  if (files.length !== 1) {
    return undefined;
  }

  return files[0].data;
}

export async function fetchFiles(pattern: string): Promise<WireFile[]> {
  let request = JSON.stringify({ pattern: pattern });
  let files = await (await fetchAdapter!.post(`/api/resource/fetchfiles/${worldId}`, request)).json();
  return files;
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

