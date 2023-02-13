import _ from "lodash";
import { BufferGeometry, Camera, Line, LineBasicMaterial, Raycaster, Scene, Vector3 } from "three";
import { WorldProps } from "../fetchadapter";
import { ShowKeyBindingsDef } from "../posh/keybindcommands";
import { mapEditorState } from "../posh/mapeditorstate";
import { PxSize } from "../posh/pos";
import { IMapEditor } from "../ui/imapeditor";
import { KeyBinder, MEvent } from "../ui/keybinder";
import { IGameMap } from "./igamemap";
import { MapBlockCoord, MapLayer } from "./maplayer";
import { GridPos3, GridSize3, WorldCoord3, WorldSize3 } from "./pos3";
import { modelCache } from "./voxelmodelcache";

export function addEditorShortcuts(showKeyBindingsDef: ShowKeyBindingsDef) {
  let editor = 'Editor'

  // we can late bind later... pass name and bind object
  showKeyBindingsDef.addKeyBinding('C', 'Copy block of tiles to buffer');
  showKeyBindingsDef.addKeyBinding('V', 'Paste block of tiles from buffer');
  showKeyBindingsDef.addKeyBinding('X', 'Clear block from layer');
  showKeyBindingsDef.addKeyBinding('L', 'Fill block of tiles from buffer');

  showKeyBindingsDef.addKeyBinding('A', 'Move camera up');
  showKeyBindingsDef.addKeyBinding('S', 'Move camera down');
  showKeyBindingsDef.addKeyBinding('D', 'Move camera right');
  showKeyBindingsDef.addKeyBinding('W', 'Move camera left');
}

export interface IMapEditorHost {
  //get 
  // refresh(): void;
  //    scrollBy(pxSize: PxSize): void;
  //    ensureVisible(pos: GridPos): void;
}

export class MapEditor implements IMapEditor {
  private viewSize: PxSize;
  private camera: Camera;
  private scene: Scene;
  private isDown: boolean = false;
  private map: IGameMap;
  static material = new LineBasicMaterial({ color: 0x0000ff });

  private selectedBlock: MapBlockCoord | undefined = undefined;
  private selection: Line | undefined = undefined;

  public constructor(
    viewSize: PxSize,
    scene: Scene,
    camera: Camera,
    input: KeyBinder,
    map: IGameMap) {

    mapEditorState.onChanged(this, (evt) => this.onStateChanged())

    this.viewSize = viewSize;
    this.map = map;
    this.camera = camera;
    this.scene = scene;

    _.bindAll(this, [
      'onCopyBlock',
      'onPasteBlock',
      'pasteBlockWorker',
      'onClearBlock',
    ])

    input.registerKeyUp('KeyC', this.onCopyBlock);
    input.registerKeyUp('KeyV', this.onPasteBlock);
    input.registerKeyUp('KeyX', this.onClearBlock);
  }

  private onStateChanged() {

  }

  public onMouseDown(evt: MEvent): boolean {
    let coords = {
      x: (evt.x / this.viewSize.w) * 2 - 1,
      y: -(evt.y / this.viewSize.h) * 2 + 1
    }

    let raycaster = new Raycaster();
    raycaster.setFromCamera(coords, this.camera);

    var intersects = raycaster.intersectObjects(this.scene.children, false);

    if (intersects.length > 0) {
      this.selectBlockFace(intersects[0].point);
    }
    return true;
  };

  onMouseUp(evt: MEvent): boolean {
    this.isDown = false;
    /*
    let coords = {
        x: (evt.clientX / window.innerWidth) * 2 - 1,
        y: -(evt.clientY / window.innerHeight) * 2 + 1
    }

    let raycaster = new Raycaster();
    raycaster.setFromCamera(coords, this.camera);

    var intersects = raycaster.intersectObjects(this.scene.children, false);

    if (intersects.length > 0) {
        var object = intersects[0].object;
        // @ts-ignore
        object.material.color.set(Math.random() * 0xffffff);
        this.selected = object;
        //object.geometry.setAttribute('color', Math.random() * 0xffffff);
    }
    */
    return true;
  };

  onMouseMove(evt: MEvent): boolean {
    if (this.isDown === false) {
      return true;
    }

    return true;
    /*
            if (this.selected === undefined) {
                return;
            }
    
            let coords = {
                x: (evt.clientX / window.innerWidth) * 2 - 1,
                y: -(evt.clientY / window.innerHeight) * 2 + 1
            }
    
            let raycaster = new Raycaster();
            raycaster.setFromCamera(coords, this.camera);
    
            var intersects = raycaster.intersectObjects(this.scene.children, false);
    
            if (intersects.length > 0) {
                let intersect = intersects[0];
    
                this.selected.position.copy(intersect.point).add(intersect!.face!.normal);
                this.selected.position.divideScalar(16).floor().multiplyScalar(16).addScalar(8);
                //object.geometry.setAttribute('color', Math.random() * 0xffffff);
            }
           */
  };

  private onCopyBlock() {

  }

  private onPasteBlock() {
    setTimeout(this.pasteBlockWorker);
  }

  private async pasteBlockWorker(): Promise<boolean> {
    if (this.selectedBlock === undefined) {
      return false;
    }

    let block = await modelCache.getVoxelModel('./assets/vox/dungeon_entrance.vox');
    let pos = this.selectedBlock.gridPos;
    if (this.selectedBlock.model !== undefined) {
      this.map.addBlock({ x: pos.x, y: pos.y, z: pos.z + 1 }, block);
    } else {
      this.map.addBlock({ x: pos.x, y: pos.y, z: pos.z }, block);
    }

    return true;
  }

  private onClearBlock() {
    if (this.selectedBlock === undefined || this.selectedBlock.model === undefined) {
      return;
    }

    this.map.deleteBlock(this.selectedBlock);
    this.selectedBlock = undefined;
    this.scene.remove(this.selection!);
    this.selection = undefined;
  }

  private selectBlockFace(point: Vector3) {
    let block: MapBlockCoord | undefined;

    if (point.z <= 0) {
      point.z = 0;
    }

    block = this.map.findBlock(point);
    if (block === undefined) {
      return;
    }

    // for now select top face and draw rect
    if (this.selection !== undefined) {
      this.scene.remove(this.selection);
      this.selection = undefined;
      this.selectedBlock = undefined;
    }

    let pos = this.map.gridPosToWorldPos(block.gridPos);
    let size: GridSize3;
    if (block.model !== undefined) {
      size = this.map.gridSizeToWorldSize(block.model.gridSize);
    } else {
      size = this.map.gridSizeToWorldSize({ sx: 1, sy: 1, sz: 1 });
    }
    this.buildSelectionBox(pos, size);

    this.selectedBlock = block;
  }

  private buildSelectionBox(pos: WorldCoord3, size: WorldSize3) {
    const points: Vector3[] = [];
    points.push(new Vector3(pos.x, pos.y, pos.z + size.sz));
    points.push(new Vector3(pos.x, pos.y + size.sy, pos.z + size.sz));
    points.push(new Vector3(pos.x + size.sx, pos.y + size.sy, pos.z + size.sz));
    points.push(new Vector3(pos.x + size.sx, pos.y, pos.z + size.sz));
    points.push(new Vector3(pos.x, pos.y, pos.z + size.sz));

    points.push(new Vector3(pos.x + size.sx, pos.y, pos.z + size.sz));
    points.push(new Vector3(pos.x + size.sx, pos.y, pos.z));
    points.push(new Vector3(pos.x + size.sx, pos.y + size.sy, pos.z));
    points.push(new Vector3(pos.x + size.sx, pos.y + size.sy, pos.z + size.sz));

    points.push(new Vector3(pos.x + size.sx, pos.y + size.sy, pos.z));
    points.push(new Vector3(pos.x, pos.y + size.sy, pos.z));
    points.push(new Vector3(pos.x, pos.y + size.sy, pos.z + size.sz));

    const geometry = new BufferGeometry().setFromPoints(points);

    this.selection = new Line(geometry, MapEditor.material);
    this.scene.add(this.selection);
  }
}