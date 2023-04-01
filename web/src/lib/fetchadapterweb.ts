import { IFetchAdapter } from "./fetchadapter";

export class FetchAdapterWeb implements IFetchAdapter {
  get(uri: string): Promise<Response> {
    return fetch(uri);
  }
  post(uri: string, body: string): Promise<any> {
    return fetch(uri, { method: "POST", headers: { "accept": "application/json" }, body: body });
  }
}

/*
async function login(): Promise<string | undefined> {
  console.log("login");
  let name = document.getElementById("userName") as HTMLInputElement;
  let pwd = document.getElementById("pwd") as HTMLInputElement;

  let req = {
    name: name.value,
    pwd: pwd
  };

  try {
    let reqStr = JSON.stringify(req);
    let response = await (await fetch(`/api/login`, { method: "POST", headers: { "accept": "application/json" }, body: reqStr })).json();

    if (response.url !== undefined) {
      location.href = response.url;
    } else {
      return 'Login failed; try again';
    }
  }
  catch (e) {
    return 'Login failed; try again';
  }
}
*/