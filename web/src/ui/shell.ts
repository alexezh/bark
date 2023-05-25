import { CommandLayer } from "../actions/commandlayer";
import { UiCompositor2 } from "./uicompositor";
import { createMapEditorState, mapEditorState } from "./mapeditorstate";
import { CodeEditor } from "../actions/codeeditor";
import { IGameShell as IGameShell } from "./igameshell";
import { decorateCommand } from "../lib/termcolors";
import { CameraLayer } from "./cameralayer";
import { IVoxelLevel } from "./ivoxelmap";

export class ShellProps {
  public width: number = 0;
  public height: number = 0;
  // scaled width and height for drawing
  // will go to layer at some point
  public canvasWidth: number = 0;
  public canvasHeight: number = 0;
  public scale: number = 1;
  public scrollX: number = 0;
  public scrollY: number = 0;
  public commandPaneHeight: number = 48;
  public commandListWidthRation: number = 0.20;
  public propertyPaneWidthRation: number = 0.40;
  public uiLayerHeight: number = 32;
  public mediumButtonWidth = 64;
  public mediumButtonHeight = 32;
}

export class Shell implements IGameShell {
  private map!: IVoxelLevel;
  private container: HTMLDivElement;
  public camera?: CameraLayer;
  private compositor2: UiCompositor2;
  private props: ShellProps;
  private barLayer: CommandLayer;

  public constructor(gameContainer: HTMLDivElement) {
    this.container = gameContainer;
    this.props = new ShellProps();
    this.props.width = this.container.offsetWidth;
    this.props.height = this.container.offsetHeight;
    this.props.scale = 1; // window.devicePixelRatio;
    this.props.canvasWidth = this.props.width / this.props.scale;
    this.props.canvasHeight = this.props.height / this.props.scale;

    createMapEditorState();
    mapEditorState.onChanged(this, (evt) => this.refresh());

    this.compositor2 = new UiCompositor2(gameContainer, { w: this.props.width, h: this.props.height });

    this.refresh();

    // now add UI layers
    this.barLayer = new CommandLayer({
      id: "bar",
      x: 0, y: 0,
      w: this.props.width,
      h: this.props.height,
      shellProps: this.props,
      visible: true,
      mapEditorState: mapEditorState
    });
    this.compositor2.appendLayer(this.barLayer);

    // add camera
    this.camera = new CameraLayer({
      id: "camera",
      x: 0, y: 0,
      w: this.props.width, h: this.props.height,
      scale: this.props.scale,
      visible: true
    });

    this.compositor2.insertLayerBefore(this.camera, 'bar');
  }

  public refresh() {
    //this.camera?.refresh();
  }

  public printError(s: string): void {
  }

  public print(s: string): void {
  }

  public printException(e: any): void {
  }
}

