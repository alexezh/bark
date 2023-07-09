import Queue from "queue";

export interface IFetchAdapter {
  get(uri: string): Promise<Response>;
  post(uri: string, body: string): Promise<any>
}

let fetchAdapter: IFetchAdapter | undefined = undefined;
let sessionId: string | undefined;
let projectId: string = '7fa84179-dc58-4939-8678-03370fd137f3';
let updateQueue: Queue = new Queue();

export function getSessionId(): string | undefined {
  return sessionId;
}

export function setSessionId(id: string) {
  sessionId = id;
}

export function setProjectId(id: string) {
  projectId = id;
}

export function getProjectId(): string {
  return projectId;
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

export type WireGetStringsRequest = {
  pattern?: string;
  keys?: string[];
}

export type WireGetStringsResponse = {
  values: WireString[];
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

export type WireCreateProjectRequest = {
  name: string;
}

export type WireCreateProjectResponse = {
  id: string;
}

export type WireLevelInfo = {
  id: string;
  name: string;
  sx: number
  sy: number;
  sz: number;
}

export type WireProjectConfig = {
  version: number;
}

export async function wireCreateProject(name: string): Promise<WireCreateProjectResponse> {
  let request: WireCreateProjectRequest = {
    name: name
  }
  let response = await (await fetchAdapter!.post(`/api/projectlist/createproject`, JSON.stringify(request))).json();

  return response;
}

export async function wireGetUserString(key: string): Promise<string | undefined> {
  let request = JSON.stringify({ pattern: key });
  let files = await (await fetchAdapter!.post(`/api/user/getstrings/${sessionId}`, request)).json();
  if (files.length !== 1) {
    return undefined;
  }

  return files[0].data;
}

export async function wireSetUserString(key: string, value: string): Promise<void> {
  let request: WireString[] = [{ key: key, data: value }]
  let requestData = JSON.stringify(request);
  let res = await (await fetchAdapter!.post(`/api/user/setstrings/${sessionId}`, requestData)).json();
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
  let request: WireGetStringsRequest = { keys: [key], pattern: undefined };
  let response: WireGetStringsResponse = await (await fetchAdapter!.post(`/api/project/getstrings/${projectId}`, JSON.stringify(request))).json();
  if (response.values === undefined || response.values.length !== 1) {
    return undefined;
  }

  let o = JSON.parse(response.values[0].data);
  return o;
}

export async function wireGetStrings(request: WireGetStringsRequest): Promise<WireString[]> {
  let response: WireGetStringsResponse = await (await fetchAdapter!.post(`/api/project/getstrings/${projectId}`, JSON.stringify(request))).json();
  return response.values;
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

export function getWireResourceUri(relativeUrl: string): string {
  return `/api/project/getresource/${projectId}?url=${relativeUrl}`;
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

export type WireDict = {
  field: string;
  value: string;
}

export type WireGetDictRequest = {
  key: string;
  fields: string[] | null | undefined;
}

export type WireGetDictResponse = {
  fields: WireDict[] | null | undefined;
}

export type WireSetDictRequest = {
  key: string;
  fields: WireDict[];
}

export type WireIncrementRequest = {
  key: string;
  count: number;
}

export type WireIncrementResponse = {
  start: number;
  count: number;
}

export async function wireIncrement(key: string, delta: number): Promise<number | undefined> {
  let request: WireIncrementRequest = { key: key, count: delta };
  let data = await (await fetchAdapter!.post(`/api/project/increment/${projectId}`, JSON.stringify(request))).json();
  return data.start;
}

export async function wireGetDict(key: string, fields: string[] | null | undefined): Promise<WireDict[] | undefined> {
  let request: WireGetDictRequest = { key: key, fields: fields };
  let data: WireGetDictResponse = await (await fetchAdapter!.post(`/api/project/getdict/${projectId}`, JSON.stringify(request))).json();
  return (data.fields === null) ? undefined : data.fields;
}

/**
 * set list of fields to specific values
 * does not affect fields which are not listed
 */
export async function wireSetDict(key: string, fields: WireDict[]): Promise<void> {
  try {
    let valueData: string[] = [];
    let request: WireSetDictRequest = { key: key, fields: fields };
    let res = await (await fetchAdapter!.post(`/api/project/setdict/${projectId}`, JSON.stringify(request))).json();
  }
  catch (e) {
    console.log('setDict failed:' + e);
  }
}

export function wireSetDictBackground<T>(key: string, fields: WireDict[]): void {
  updateQueue.push(() => {
    return wireSetDict(key, fields)
  });

  updateQueue.start();
}

/*
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
*/
//wireSetArrayRangeBackground