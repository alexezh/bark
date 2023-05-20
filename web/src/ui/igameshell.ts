
export interface IGameShell {
  refresh(): void;
  // setInteractiveAvatar(player: IAvatar): void;
  printError(s: string): void;
  print(s: string): void;
  printException(e: any): void;
  editCode(): void;
}

export let shell!: IGameShell;

export function setShell(t: IGameShell) {
  shell = t;
}