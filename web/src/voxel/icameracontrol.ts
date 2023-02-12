import { IGameMap } from "./igamemap";

export interface ICameraLayer {

  //loadMap(map: IGameMap);
  refresh(): void;
  //    scrollBy(pxSize: PxSize): void;
  //    ensureVisible(pos: GridPos): void;
}

