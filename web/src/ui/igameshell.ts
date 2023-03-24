import { IVoxelMap } from "./ivoxelmap";

export interface IGameShell {
  login(name: string): void;
  logout(): void;
  refresh(): void;
  // setInteractiveAvatar(player: IAvatar): void;
  printError(s: string): void;
  print(s: string): void;
  printException(e: any): void;
  editFile(text: string | undefined | null, onSave: ((text: string) => void) | undefined): void;
}

export let shell: IGameShell | undefined;

export function setShell(t: IGameShell) {
  shell = t;
}