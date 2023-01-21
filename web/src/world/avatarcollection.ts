import { Character } from "./character";
import { IAvatar } from "./iavatar";

export class AvatarCollection {
  private avatars: Map<string, IAvatar> = new Map<string, IAvatar>();

  public getAvatar(id: number | string | null | undefined): IAvatar | undefined {
    if (id === null || id === undefined) {
      return undefined;
    }

    if (typeof id === 'number') {
      return this.avatars.get(id.toString());
    } else {
      return this.avatars.get(id);
    }
  }

  public findCharacterByName(name: string): IAvatar | undefined {
    for (let x of this.avatars) {
      if (x[1] instanceof Character) {
        let c = x[1] as Character;
        if (c.rt.name === name) {
          return c;
        }
      }
    }

    return undefined;
  }

  public removeAvatar(avatar: IAvatar): void {
    this.avatars.delete(avatar.id);
  }

  public addAvatar(avatar: IAvatar) {
    this.avatars.set(avatar.id, avatar);
  }
}