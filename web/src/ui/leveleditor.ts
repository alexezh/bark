import _ from "lodash";
import { BufferGeometry, Camera, Line, LineBasicMaterial, PerspectiveCamera, Raycaster, Scene, Vector3 } from "three";
import { mapEditorState } from "../posh/mapeditorstate";
import { PxSize } from "../posh/pos";
import { ILevelEditor as ILevelEditor } from "./ileveleditor";
import { KeyBinder, MEvent } from "./keybinder";
import { IVoxelLevel, IVoxelLevelFile, MapBlockCoord } from "./ivoxelmap";
import { BlockSize3, WorldCoord3, WorldSize3 } from "../voxel/pos3";
import { modelCache } from "../voxel/voxelmodelcache";
import { ICamera } from "../engine/icamera";
import { vm } from "../engine/ivm";

export interface IMapEditorHost {
  //get 
  // refresh(): void;
  //    scrollBy(pxSize: PxSize): void;
  //    ensureVisible(pos: GridPos): void;
}

export class LevelEditor implements ILevelEditor {
  private camera: ICamera;
  private isDown: boolean = false;
  private level: IVoxelLevel;
  private input: KeyBinder;
  static material = new LineBasicMaterial({ color: 0x0000ff });

  private selectedBlock: MapBlockCoord | undefined = undefined;
  private selection: Line | undefined = undefined;

  public constructor(
    camera: ICamera,
    level: IVoxelLevel) {

    this.camera = camera;

    this.level = level;

    _.bindAll(this, [
      'onCopyBlock',
      'onPasteBlock',
      'pasteBlockWorker',
      'onClearBlock',
    ])

    this.input = new KeyBinder(this.camera.canvas, undefined, true);
    this.input.registerKeyUp('KeyC', this.onCopyBlock, 'Copy block to buffer');
    this.input.registerKeyUp('KeyV', this.onPasteBlock);
    this.input.registerKeyUp('KeyX', this.onClearBlock);

    this.input.registerKeyUp('KeyA', () => this.onScroll(0, -1, 0));
    this.input.registerKeyUp('KeyS', () => this.onScroll(1, 0, 0));
    this.input.registerKeyUp('KeyD', () => this.onScroll(0, 1, 0));
    this.input.registerKeyUp('KeyW', () => this.onScroll(-1, 0, 0));
    this.input.registerKeyUp('KeyQ', () => this.onScroll(0, 0, 1), 'Move camera up');
    this.input.registerKeyUp('KeyE', () => this.onScroll(0, 0, -1), 'Move camera down');
  }

  public dispose() {
    this.input.detach();
  }

  private onScroll(x: number, y: number, z: number) {
    //this.cameraLayer.scrollBy(this.level.blockPosToWorldPos({ x: x, y: y, z: z }));
  }

  public onMouseDown(evt: MEvent): boolean {
    let coords = {
      x: (evt.x / this.camera.viewSize.w) * 2 - 1,
      y: -(evt.y / this.camera.viewSize.h) * 2 + 1
    }

    let raycaster = new Raycaster();
    raycaster.setFromCamera(coords, this.camera.camera);

    var intersects = raycaster.intersectObjects(this.camera.scene.children, false);

    if (intersects.length > 0) {
      this.selectBlockFace(intersects[0].point);
    }
    return true;
  };

  public onMouseUp(evt: MEvent): boolean {
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

  public onMouseMove(evt: MEvent): boolean {
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
    let pos = this.selectedBlock.mapPos;
    if (this.selectedBlock.model !== undefined) {
      this.level.file.addBlock({ x: pos.x, y: pos.y, z: pos.z + 1 }, block);
    } else {
      this.level.file.addBlock({ x: pos.x, y: pos.y, z: pos.z }, block);
    }

    return true;
  }

  private onClearBlock() {
    if (this.selectedBlock === undefined || this.selectedBlock.model === undefined) {
      return;
    }

    this.level.file.deleteBlock(this.selectedBlock);
    this.selectedBlock = undefined;
    this.camera.scene.remove(this.selection!);
    this.selection = undefined;
  }

  private selectBlockFace(point: Vector3) {
    let block: MapBlockCoord | undefined;

    if (point.z <= 0) {
      point.z = 0;
    }

    block = this.level.findBlock(point);
    if (block === undefined) {
      return;
    }

    // for now select top face and draw rect
    if (this.selection !== undefined) {
      this.camera.scene.remove(this.selection);
      this.selection = undefined;
      this.selectedBlock = undefined;
    }

    let pos = this.level.blockPosToWorldPos(block.mapPos);
    let size: BlockSize3;
    if (block.model !== undefined) {
      size = this.level.blockSizeToWorldSize(block.mapSize);
    } else {
      size = this.level.blockSizeToWorldSize({ sx: 16, sy: 16, sz: 16 });
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

    this.selection = new Line(geometry, LevelEditor.material);
    this.camera.scene.add(this.selection);
  }
}