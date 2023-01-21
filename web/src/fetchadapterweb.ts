import { IFetchAdapter } from "./fetchadapter";

export class FetchAdapterWeb implements IFetchAdapter {
  get(uri: string): Promise<any> {
    return fetch(uri);
  }
  post(uri: string, body: string): Promise<any> {
    return fetch(uri, { method: "POST", headers: { "accept": "application/json" }, body: body });
  }
}
