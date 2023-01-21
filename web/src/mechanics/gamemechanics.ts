import { AvatarGameState, IAvatar } from "../world/iavatar";
import { Ticker as PixiTicker } from 'pixijs';
import { IGameMechanics } from "./igamemechanics";
import { IGameCollisionHandler, IGamePhysics } from "../graphics/igamephysics";
import { IGameMap, MapLocation } from "../world/igamemap";
import { codeLoader, CodeModule, printCodeException } from "./codeloader";
import { AvatarAPI } from "./avatarapi";
import { CodeAction, CodeActionKind, MoveAction, SayAction } from "./iavatarapi";
import { SpriteMoveAnimation } from "../world/spritemoveanimation";
import { terminal } from "../ui/igameterminal";
import { greenText, resetColor } from "../posh/termcolors";
import { Pokemon, PokemonProps } from "../world/pokemon";
import { BattleAction, BattleActionKind, BattleAttackAction, IBattleAPI } from "./ibattleapi";
import _ from "lodash";
import { runBattles, startBattle } from "./battlemechanics";
import { Character, CharacterProps } from "../world/character";
import { runCatch, startCatch } from "./catchmechanics";
import { IAvatarCode } from "./iavatarcode";
import { CharacterProxy, PokemonProxy } from "./avatarcode";
import { AvatarCollection } from "../world/avatarcollection";

export class BattleAPI implements IBattleAPI {
  prompt(s: string): Promise<string> {
    return terminal!.prompt(s);
  }
  makeRunAction(): BattleAction {
    return {
      kind: BattleActionKind.run
    }
  }
  makeAttackAction(moveId: string): BattleAttackAction {
    return {
      kind: BattleActionKind.attack,
      moveId: moveId
    }
  }
}

type LiveAvatar = {
  avatar: IAvatar;
  proxy: any;
}

export class GameMechanics implements IGameMechanics, IGameCollisionHandler {
  private ticker?: PixiTicker;
  private lastMoveTick: number = 0;
  private physics: IGamePhysics;
  private map: IGameMap;
  private readonly avatarCollection: AvatarCollection;
  private readonly liveAvatars: Map<string, LiveAvatar> = new Map<string, LiveAvatar>();

  public constructor(map: IGameMap, physics: IGamePhysics, avatarCollection: AvatarCollection) {
    this.map = map;
    this.physics = physics;
    this.avatarCollection = avatarCollection;
  }

  public start(ticker: PixiTicker) {
    this.physics.attachCollisionHandler(this);
    this.ticker = ticker;
    this.ticker.add(() => this.runStep())
  }

  public addLiveAvatar(avatar: IAvatar): void {
    if (avatar instanceof Pokemon) {
      this.liveAvatars.set(avatar.id, { avatar: avatar, proxy: new PokemonProxy(avatar.props as PokemonProps) });
    } else {
      this.liveAvatars.set(avatar.id, { avatar: avatar, proxy: new CharacterProxy(avatar.props as CharacterProps) });
    }
  }

  public removeLiveAvatar(avatar: IAvatar): void {
    this.liveAvatars.delete(avatar.id);
  }

  public onCollision(a1: IAvatar, a2: IAvatar): void {
    if (a1 instanceof Pokemon && a2 instanceof Pokemon) {
      let c1 = codeLoader.getCode(a1.rt.code);
      if (c1?.battleTurn === undefined) {
        terminal?.printError('no battle code for ' + a1.rt.name);
        return;
      }

      let c2 = codeLoader.getCode(a2.rt.code);
      if (c2?.battleTurn === undefined) {
        terminal?.printError('no battle code for ' + a2.rt.name);
        return;
      }

      startBattle(a1, a2);
    }
    else {
      let character = (a1 instanceof Character) ? a1 as Character : a2 as Character;
      let pokemon = (a1 instanceof Pokemon) ? a1 as Pokemon : a2 as Pokemon;

      startCatch(character, pokemon);
    }
  }

  public onLocation(a: IAvatar, loc: MapLocation): boolean {
    loc.code.onEnter(new CharacterProxy((a as Character).characterProps));
    return true;
  }

  private runStep() {
    this.runMoveStep();
    runBattles();
    runCatch();
  }

  private runMoveStep() {
    let now = performance.now();
    if (now - this.lastMoveTick < 300) {
      return;
    }

    this.lastMoveTick = now;
    let api = new AvatarAPI(this.avatarCollection!, this.map!);
    for (let e of this.liveAvatars) {
      let la = e[1];
      let entry = codeLoader.getCodeModule(la.avatar.rt.code);
      if (entry === undefined || !entry.enabled) {
        continue;
      }

      if (la.avatar.gameState !== AvatarGameState.move) {
        continue;
      }

      api.self = la.avatar;

      try {
        if (entry.codeObj.next === undefined) {
          continue;
        }

        let action = (entry.codeObj as IAvatarCode).next(la.proxy, api);
        if (action === undefined) {
          continue;
        }
        this.executeAction(la.avatar, entry, action);
      }
      catch (e) {
        printCodeException(la.avatar.rt.name, e);
        entry.enabled = false;
      }
    }
  }

  private executeAction(avatar: IAvatar, entry: CodeModule, action: CodeAction) {
    switch (action.kind) {
      case CodeActionKind.move:
        let moveAction = action as MoveAction;

        this.physics!.moveAvatar({
          avatar: avatar,
          dir: moveAction.dir,
          animator: SpriteMoveAnimation.create
        });
        break;
      case CodeActionKind.say:
        terminal?.print(`${greenText}${avatar.rt.name} says: ${(action as SayAction).text}${resetColor}`);
        break;
      case CodeActionKind.idle:
        break;
      default:
        break;
    }
  }
}