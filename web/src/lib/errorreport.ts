import { shell } from "../ui/igameterminal";

export function printNetworkError(s: string) {
  shell?.printError(`Failed to call communicate with server. Try refreshing browser. Function ${s}`);
}