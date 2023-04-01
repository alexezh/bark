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

export async function wireGetString(key: string): Promise<string | undefined> {
  let request = JSON.stringify({ pattern: key });
  let files = await (await fetchAdapter!.post(`/api/project/getstrings/${projectId}`, request)).json();
  if (files.length !== 1) {
    return undefined;
  }

  return files[0].data;
}

export async function wireGetObject<T>(key: string): Promise<T | undefined> {
  let request = JSON.stringify({ pattern: key });
  let files = await (await fetchAdapter!.post(`/api/project/getstrings/${projectId}`, request)).json();
  if (files.length !== 1) {
    return undefined;
  }

  let o = JSON.parse(files[0].data);
  return o;
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

export async function wireSetObject<T>(key: string, value: T): Promise<void> {
  let valueData = JSON.stringify(value);
  let request: WireString[] = [{ key: key, data: valueData }]
  let requestData = JSON.stringify(request);
  let res = await (await fetchAdapter!.post(`/api/project/setstrings/${projectId}`, requestData)).json();
}

export function wireSetObjectBackground<T>(key: string, value: T): void {
  updateQueue.push(async () => {
    let valueData = JSON.stringify(value);
    let request: WireString[] = [{ key: key, data: valueData }]
    let requestData = JSON.stringify(request);
    let res = await (await fetchAdapter!.post(`/api/project/setstrings/${projectId}`, requestData)).json();
  });

  updateQueue.start();
}

export async function wireGetArrayRange<T>(key: string, idx: number, count: number): Promise<T[] | undefined> {
  let request: WireGetArrayRange = { key: key, pos: idx, count: count };
  let requestData = JSON.stringify(request);
  let data = await (await fetchAdapter!.post(`/api/project/getarray/${projectId}`, requestData)).json();
  let res: T[] = [];
  for (let s of data) {
    res.push(JSON.parse(s));
  }
  return res;
}

export async function wireSetArrayRange<T>(key: string, idx: number, count: number, value: T[]): Promise<void> {
  let valueData: string[] = [];
  for (let v of value) {
    valueData.push(JSON.stringify(v));
  }
  let request: WireSetArrayRange = { key: key, pos: idx, count: count, value: valueData };
  let requestData = JSON.stringify(request);
  let res = await (await fetchAdapter!.post(`/api/project/setarrayrange/${projectId}`, requestData)).json();
}
