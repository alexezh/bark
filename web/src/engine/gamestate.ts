import _ from "lodash";
import { v4 as uuidv4 } from 'uuid';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from "@microsoft/signalr";
import { Repl } from "../posh/repl";
import { Avatar } from "./avatar";
import { GridPos, gridPosToPxPos } from "../posh/pos";
import { currentWorldId } from "../fetchadapter";
import { IAvatar } from "./iavatar";
import { printNetworkError } from "../ui/errorreport";
import { terminal } from "../ui/igameterminal";
import { gameState, IGameState, setGameState } from "./igamestate";
import { IGameMap } from "../voxel/igamemap";
import { GameMap } from "../engine/gamemap";
import AsyncEventSource from "../AsyncEventSource";

export type WireSpawnCharacterRequest = {
  name: string;
  skinUrl: string;
}

export type WireAvatarMove = {
  id: string;
  currentPos: GridPos;
  newPos: GridPos;
}

export enum RtcConnectionStatus {
  pending,
  connected,
  error,
}

export type RtcUpdateAvatarPosition = {
  worldId: string;
  avatarId: string;
  newPos: GridPos | undefined;
  oldPos: GridPos | undefined;
}

// manages game state (network updates and so on)
export class GameState implements IGameState {
  private sessionId?: string;
  private connection?: HubConnection;
  private connectionStatus: RtcConnectionStatus = RtcConnectionStatus.connected;

  public map: IGameMap | undefined;
  public readonly repl: Repl;
  public onLoaded: boolean = false;

  public readonly mapLoaded: AsyncEventSource<boolean> = new AsyncEventSource<boolean>();
  public readonly onMapClosed: AsyncEventSource<boolean> = new AsyncEventSource<boolean>();

  //public readonly avatarCollection: AvatarCollection = new AvatarCollection();

  constructor() {
    this.repl = new Repl();

    _.bindAll(this, [
      "onAvatarPosChanged",
      "onUpdateAvatarPositionRtc"
    ]);

    // this.bus.onReceive = (msg) => this.onReceive(msg);
    this.connectSignalR();
  }

  public async load(): Promise<boolean> {

    this.map = new GameMap();
    await this.map.load();
    /*
        let wireAvatars = await fetchAvatars();
        for (let avatarProps of wireAvatars) {
          if (avatarProps.character !== undefined && avatarProps.character !== null) {
            let character = new Character(avatarProps.character, this.onAvatarPosChanged);
            try {
              await character.load();
              this.addAvatar(character);
            }
            catch (e) {
              terminal?.printError(`Failed to load character ${character.id}`);
            }
          } else if (avatarProps.pokemon !== undefined && avatarProps.pokemon !== null) {
            let pokemon = new Pokemon(avatarProps.pokemon, this.onAvatarPosChanged);
            try {
              await pokemon.load();
              this.addAvatar(pokemon);
            }
            catch (e) {
              terminal?.printError(`Failed to load pokemon ${pokemon.id}`);
            }
          }
        }
    */
    this.onLoaded = true;
    this.mapLoaded.invoke(true);

    return true;
  }

  public spawnCharacter(name: string, skinUrl: string) {
    /*
        setTimeout(async () => {
          let existintAvatar = this.avatarCollection.getAvatar(name);
          if (existintAvatar !== undefined) {
            terminal?.printError(`Character ${name} already exists`);
            return;
          }
    
          let wireSpawnCharacter = {
            name: name,
            skinUrl: skinUrl,
          }
          let wireAvatar = await spawnCharacter(wireSpawnCharacter);
          if (wireAvatar === undefined || wireAvatar.character === undefined) {
            printNetworkError('spawnCharacter');
            return;
          }
    
          let character = new Character(wireAvatar.character, this.onAvatarPosChanged);
          await character.load();
    
          this.addAvatar(character);
        });
        */
  }

  private onAvatarPosChanged(avatar: IAvatar, oldPos: GridPos | undefined, newPos: GridPos | undefined) {

    let msg: RtcUpdateAvatarPosition = {
      worldId: currentWorldId(),
      avatarId: avatar.id,
      newPos: newPos,
      oldPos: oldPos
    }
    this.connection?.invoke('UpdateAvatarPosition', this.sessionId, JSON.stringify(msg));
  }

  private addAvatar(avatar: Avatar) {
    /*
        this.avatarCollection.addAvatar(avatar);
    
        if (avatar.props.layerId !== undefined) {
          let layer = this.gameMap!.getLayer(avatar.props.layerId);
          if (layer === undefined) {
            throw 'unknown layer';
          }
          layer.addAvatar(avatar);
        }*/
  }

  private connectSignalR() {
    this.sessionId = uuidv4();
    this.connection = new HubConnectionBuilder()
      .withUrl('/updates')
      .build();

    // Create a function that the hub can call to broadcast messages.
    this.connection.on('broadcastMessage', function (userNum) {
      console.log('broadcast');
    });

    this.connection.on('onUpdateAvatarPosition', this.onUpdateAvatarPositionRtc);

    // Transport fallback functionality is now built into start.
    this.connection.start()
      .then(() => {
        this.connectionStatus = RtcConnectionStatus.connected;
      })
      .catch(error => {
        this.connectionStatus = RtcConnectionStatus.error;
      });
  }

  private onUpdateAvatarPositionRtc(sessionId: string, message: string): void {
    /*
    if (sessionId === this.sessionId) {
      return;
    }

    let updateMsg = JSON.parse(message) as RtcUpdateAvatarPosition;
    let avatar = gameState.avatarCollection.getAvatar(updateMsg.avatarId);
    if (avatar === undefined) {
      return;
    }

    avatar.onRemoteUpdateCurrentPos(updateMsg.newPos);
    //this.gameMap?.physics.moveAvatarRemote(avatar, updateMsg.newPos!, (props) => { return SpriteMoveAnimation.create(props) });
    terminal?.refresh();
    */
  }
}

export function createGameState(): IGameState {
  setGameState(new GameState());
  return gameState;
}

//export let game: Main;

//export function createVoxelGame(container: HTMLElement) {
//  game = new Main();
//  game.init(container)
//}