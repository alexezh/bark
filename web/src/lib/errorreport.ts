import { terminal } from "../ui/igameterminal";

export function printNetworkError(s: string) {
  terminal?.printError(`Failed to call communicate with server. Try refreshing browser. Function ${s}`);
}