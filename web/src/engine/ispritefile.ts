import { RigitBodyKind } from "../voxel/irigitbody";
import { Sprite3 } from "./sprite3";

export interface ISpriteFile {
  name: string;
  code: string;

  addSkin(url: string, skinName?: string): Promise<void>;
  removeSkin(skinName: string): Promise<void>;

  createSprite(bodyKind: RigitBodyKind, skinName: string | undefined, scale?: number): Promise<Sprite3>
}