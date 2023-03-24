import { shell } from "../ui/igameshell";

export function printNetworkError(s: string) {
  shell?.printError(`Failed to call communicate with server. Try refreshing browser. Function ${s}`);
}