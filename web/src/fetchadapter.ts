import Queue from "queue";

export interface IFetchAdapter {
  get(uri: string): Promise<Response>;
  post(uri: string, body: string): Promise<any>
}

let fetchAdapter: IFetchAdapter | undefined = undefined;
let projectId: string;
let updateQueue: Queue = new Queue();

export function currentProjectId(): string {
  return projectId;
}

export function setFetchAdapter(adapter: IFetchAdapter) {
  fetchAdapter = adapter;
}

export type WireString = {
  name: string;
  data: string;
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

export async function wireSetString(key: string, value: string): Promise<WireString[]> {
  let request: WireString[] = [{ name: key, data: value }]
  let requestData = JSON.stringify(request);
  let files = await (await fetchAdapter!.post(`/api/project/setstrings/${projectId}`, requestData)).json();
  return files;
}
