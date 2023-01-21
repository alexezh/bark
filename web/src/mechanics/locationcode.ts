import { CodeAction, CodeActionKind, TeleportAction } from "./iavatarapi";
import { IAvatarProxy } from "./iavatarcode";

export interface ILocationAPI {
  // teleport avatar to different location on a map or different map
  makeTeleportAction(
    mapId: string | undefined,
    layerId: string | undefined,
    x: number,
    y: number): TeleportAction;
}

export interface ILocationCode {
  onEnter(avatar: IAvatarProxy): CodeAction;
  onExit(avatar: IAvatarProxy): CodeAction;
}

export class LocationAPI implements ILocationAPI {
  makeTeleportAction(mapId: string | undefined, layerId: string | undefined, x: number, y: number): TeleportAction {
    return {
      kind: CodeActionKind.teleport,
      mapId: mapId,
      layerId: layerId,
      pos: {
        x: x,
        y: y
      }
    }
  }
}