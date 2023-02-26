import { IGameMap } from "../voxel/igamemap";

export interface IGameTerminal {
  login(name: string): void;
  logout(): void;
  refresh(): void;
  setGameMap(map: IGameMap): void;
  // setInteractiveAvatar(player: IAvatar): void;
  printError(s: string): void;
  print(s: string): void;
  printException(e: any): void;
  prompt(s: string): Promise<string>;
  promptMenu(s: string): Promise<string>;
  editFile(text: string | undefined | null, onSave: ((text: string) => void) | undefined): void;
}

export let terminal: IGameTerminal | undefined;

export function setTerminal(t: IGameTerminal) {
  terminal = t;
}