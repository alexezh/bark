import Queue from "queue";

export interface IFetchAdapter {
  get(uri: string): Promise<Response>;
  post(uri: string, body: string): Promise<any>
}

let fetchAdapter: IFetchAdapter | undefined = undefined;
let projectId: string = '7fa84179-dc58-4939-8678-03370fd137f3';
let updateQueue: Queue = new Queue();

export function setProjectId(id: string) {
  projectId = id;
}

export function setFetchAdapter(adapter: IFetchAdapter) {
  fetchAdapter = adapter;
}

// get static resource
export async function fetchResource(url: string): Promise<ArrayBuffer> {
  return await (await (await fetchAdapter!.get(url)).blob()).arrayBuffer();
}

export type WireString = {
  key: string;
  data: string;
}

export type WireSetArrayRange = {
  key: string;
  pos: number;
  count: number;
  value: string[];
}

export type WireGetArrayRange = {
  key: string;
  pos: number;
  // -1 is whole range
  count: number;
}

export type WireArray = {
  value: string[];
}

export async function wireGetString(pattern: string): Promise<string | undefined> {
  let request = JSON.stringify({ pattern: pattern });
  let files = await (await fetchAdapter!.post(`/api/project/getstrings/${projectId}`, request)).json();
  if (files.length !== 1) {
    return undefined;
  }

  return files[0].data;
}

export async function wireGetStrings(pattern: string): Promise<WireString[]> {
  let request = JSON.stringify({ pattern: pattern });
  let files = await (await fetchAdapter!.post(`/api/project/getstrings/${projectId}`, request)).json();
  return files;
}

export async function wireSetString(key: string, value: string): Promise<void> {
  let request: WireString[] = [{ key: key, data: value }]
  let requestData = JSON.stringify(request);
  let res = await (await fetchAdapter!.post(`/api/project/setstrings/${projectId}`, requestData)).json();
}

export async function wireSetStrings(keys: WireString[]): Promise<void> {
  let requestData = JSON.stringify(keys);
  let res = await (await fetchAdapter!.post(`/api/project/setstrings/${projectId}`, requestData)).json();
}

export async function wireGetArrayRange(key: string, idx: number, count: number): Promise<WireArray | undefined> {
  let request: WireGetArrayRange = { key: key, pos: idx, count: count };
  let requestData = JSON.stringify(request);
  let data = await (await fetchAdapter!.post(`/api/project/getarray/${projectId}`, requestData)).json();
  return data;
}

export async function wireSetArrayRange(key: string, idx: number, count: number, value: string[]): Promise<void> {
  let request: WireSetArrayRange = { key: key, pos: idx, count: count, value: value };
  let requestData = JSON.stringify(request);
  let res = await (await fetchAdapter!.post(`/api/project/setarrayrange/${projectId}`, requestData)).json();
}
