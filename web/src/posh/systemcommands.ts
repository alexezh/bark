import { terminal } from "../ui/igameterminal";
import { FuncCategory, GenericFuncDef, ParamDef, ParamType } from "./funcdef";
import { PoshFunction, printHelp, registerFunction } from "./poshregistry";

export type LoginParams = {
  name: string;
}

export function login(args: { name: string }) {
  if (args.name === undefined) {
    printHelp(login as PoshFunction);
    return;
  }

  terminal?.login(args.name);
}

export function logout() {
  terminal?.logout();
}

export function registerSystemCommands() {
  registerFunction('login', ['name:string'], login, 'Login user.');
  registerFunction('logout', [], logout, 'Logout user.');
}
