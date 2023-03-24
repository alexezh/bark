import { shell } from "../ui/igameterminal";
import { redText, resetColor } from "../lib/termcolors";

export type CodeModule = {
  code: string,
  codeObj: any;
  enabled: boolean;
}

export class CodeLoader {
  private codeLib: Map<string, CodeModule> = new Map<string, CodeModule>();
  private functionLib: Map<string, Function> = new Map<string, Function>();

  public getCode(id: string): any {
    let entry = this.codeLib.get(id);
    if (entry === undefined) {
      return undefined;
    }

    return entry.codeObj;
  }

  public updateCode(id: string, code: string) {
    if (code === null || code === undefined) {
      return;
    }

    try {
      let obj = eval(code);
      this.codeLib.set(id, {
        code: code,
        codeObj: obj,
        enabled: true
      });
    }
    catch (e) {
      printCodeException(id, e);
    }
  }

  public getCodeModule(id: string): CodeModule | undefined {
    return this.codeLib.get(id);
  }

  // register function for creating code blocks 
  public loadFunction(id: string, ...args: string[]): boolean {
    try {
      let func = new Function(...args);
      this.functionLib.set(id, func);
      return true;
    }
    catch (e) {
      printCodeException(id, e);
      return false;
    }
  }

  public invokeFunction<T>(id: string, ...args: any): T {
    let f = this.functionLib.get(id);
    if (f === undefined) {
      throw Error('Unknown code');
    }

    return f(...args);
  }
}

export function printCodeException(avatar: string, e: any) {
  let message: string;
  if (typeof e === "string") {
    message = e as string;
  } else if (e instanceof Error) {
    message = (e as Error).message;
  } else {
    message = 'unknown';
  }

  shell?.printError(`${redText}Code for ${avatar} failed to compile. Error: ${message}${resetColor}`);
}

export let codeLoader = new CodeLoader();
