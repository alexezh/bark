import { GridRect, PxRect } from "../posh/pos";
import { IGameMechanics } from "../mechanics/igamemechanics";
import { IGamePhysics } from "../graphics/igamephysics";
import { ILocationCode, LocationAPI } from "../mechanics/locationcode";
import { codeLoader } from "../mechanics/codeloader";
import { storeFileBackground } from "../fetchadapter";

export type MapProps = {
  id: string;
  gridWidth: number;
  gridHeight: number;
  cellWidth: number;
  cellHeight: number;
  humanStepDuration: number;
}

export type MapCodeLib = {
  battle: string | null | undefined;
}

// defines named location on the map with code
// code cannot be shared (for simplicity)
export type MapLocationProps = {
  mapId: string;
  layerId: string;
  id: string;
  rect: GridRect;
  code: string | null | undefined;
}

export class MapLocation {
  public readonly props: MapLocationProps;
  public code!: ILocationCode;

  public constructor(props: MapLocationProps) {
    this.props = props;

    if (this.props.code === null || this.props.code === undefined || this.props.code.length === 0) {
      this.props.code = `
// placeholder for function which handles location. 
// The function accepts location object 'self' and return location code object with onEnter/onExit methods
// executed when any avatar enters or exits the location. See <needurl> for more details
return {
  location: self,
  onEnter: (avatar) => {
    console.log('enter');
  },
  onExit: (avatar) => {
    console.log('exit');
  }
}`
    }
  }

  public get codeFileName(): string { return `${this.props.mapId}/${this.props.layerId}/${this.props.id}` };

  public updateCode(text: string) {
    codeLoader!.loadFunction(this.codeFileName, text);
    this.props.code = text;
    this.code = codeLoader!.invokeFunction(this.codeFileName, new LocationAPI());
    let locS = JSON.stringify(this.props);
    storeFileBackground(this.codeFileName, locS);
  }
}

export interface IGameMap {
  readonly props: MapProps;
  readonly codeLib: MapCodeLib;
  readonly physics: IGamePhysics;
  readonly mechanics: IGameMechanics;
  setViewport(pxRect: PxRect): void;
  getLayer(id: string | undefined): any | undefined;
  forEachLayer(startLayer: string | undefined, func: (layer: any) => void): void;
}