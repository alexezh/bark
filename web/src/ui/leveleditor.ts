import _ from "lodash";
import { BufferGeometry, Line, LineBasicMaterial, Raycaster, Vector3 } from "three";
import { BlockRegister, ILevelEditor as ILevelEditor, getBlockRegister, setBlockRegister } from "./ileveleditor";
import { KeyBinder } from "./keybinder";
import { IVoxelLevel, MapBlockCoord } from "./ivoxellevel";
import { BlockPos3, BlockSize3, WorldCoord3, WorldSize3 } from "../voxel/pos3";
import { ICameraLayer } from "../engine/icameralayer";
import { VoxelModel } from "../voxel/voxelmodel";
import { PointerLockControls } from "./pointerlockcontrols";

export interface IMapEditorHost {
  //get 
  // refresh(): void;
  //    scrollBy(pxSize: PxSize): void;
  //    ensureVisible(pos: GridPos): void;
}

export class LevelEditor implements ILevelEditor {
  private camera: ICameraLayer;
  private isDown: boolean = false;
  private level: IVoxelLevel;
  private input: KeyBinder;
  static material = new LineBasicMaterial({ color: 0x0000ff });
  private orbitControls: PointerLockControls;

  private selectedArea: { pos: BlockPos3, size: BlockSize3 } | undefined = undefined;
  private selection: Line | undefined = undefined;

  public constructor(
    camera: ICameraLayer,
    level: IVoxelLevel) {

    this.camera = camera;

    this.level = level;

    this.input = new KeyBinder(this.camera.canvas, undefined, true);

    this.input.registerKeyUp('KeyC', this.copyBlock.bind(this), 'Copy block to buffer');
    this.input.registerKeyUp('KeyV', this.pasteBlock.bind(this));
    this.input.registerKeyUp('KeyX', this.clearBlock.bind(this));

    this.input.registerKeyUp('KeyA', () => this.moveCamera(-5, 0));
    this.input.registerKeyUp('KeyS', () => this.moveCamera(0, 5));
    this.input.registerKeyUp('KeyD', () => this.moveCamera(5, 0));
    this.input.registerKeyUp('KeyW', () => this.moveCamera(0, -5));

    _.bindAll(this, ['onMouseDown', 'onMouseUp']);

    this.camera.canvas.addEventListener('mousedown', this.onMouseDown);
    this.camera.canvas.addEventListener('mouseup', this.onMouseUp);

    this.orbitControls = new PointerLockControls(this.camera.camera, this.camera.canvas);
  }

  public dispose() {
    this.input.detach();
  }

  private onMouseDown(evt: MouseEvent): boolean {
    let coords = {
      x: (evt.x / this.camera.viewSize.w) * 2 - 1,
      y: -(evt.y / this.camera.viewSize.h) * 2 + 1
    }

    let raycaster = new Raycaster();
    raycaster.setFromCamera(coords, this.camera.camera);

    var intersects = raycaster.intersectObjects(this.camera.scene!.children, false);

    if (intersects.length > 0) {
      this.selectBlockFace(intersects[0].point);

      if (evt.shiftKey) {
        // do nothing
      } else if (evt.ctrlKey || evt.button === 2) {
        this.clearBlock();
      } else {
        this.pasteBlock();
      }
    }

    return true;
  };

  private onMouseUp(evt: MouseEvent): boolean {
    if (this.orbitControls.isLocked) {
      this.orbitControls.unlock();
    } else {
      this.isDown = false;
      //let evt = makeMEvent(htmlEvt, undefined, this.props.scale);

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
    }
    return true;
  };

  public onMouseMove(evt: MouseEvent): boolean {
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

  public editCamera() {
    console.log('LevelEditor.lock')
    this.orbitControls.lock();
  }

  /**
   * x and z are relative to the direction of the camera
   */
  private moveCamera(dx: number, dz: number) {
    this.orbitControls.moveDirection(dx, dz);
  }

  rotateXZ(): void {
    if (this.selectedArea === undefined) {
      return;
    }

    let pos = this.selectedArea.pos;
    let block = this.level.getBlockByPos(pos.x, pos.y, pos.z);
    if (!block) {
      return;
    }

    this.level.rotateBlockXZ(block);
  }

  flipX(): void {

  }

  flipZ(): void {

  }

  public copyBlock(): void {
    if (this.selectedArea === undefined) {
      return;
    }

    let pos = this.selectedArea.pos;
    let block = this.level.getBlockByPos(pos.x, pos.y, pos.z);

    if (block) {
      setBlockRegister(block.model);
    }
  }

  public cutBlock(): void {

  }

  public pasteBlock(): void {
    setTimeout(() => this.pasteBlockWorker());
  }

  private async pasteBlockWorker(): Promise<boolean> {
    let regBlock = getBlockRegister();
    if (this.selectedArea === undefined || regBlock === undefined) {
      return false;
    }

    let pos = this.selectedArea.pos;
    let block = this.level.getBlockByPos(pos.x, pos.y, pos.z);

    // if block has something, paste on top
    if (block !== undefined) {
      this.level.file.addBlock({ x: pos.x, y: pos.y + 1, z: pos.z }, regBlock.id);
    } else {
      this.level.file.addBlock({ x: pos.x, y: pos.y, z: pos.z }, regBlock.id);
    }

    return true;
  }

  public clearBlock() {
    if (this.selectedArea === undefined) {
      return;
    }

    this.level.file.deleteBlock(this.selectedArea.pos);
    this.selectedArea = undefined;
    this.camera.scene!.remove(this.selection!);
    this.selection = undefined;
  }

  private selectBlockFace(point: Vector3) {
    let block: MapBlockCoord | undefined;

    if (point.y <= 0) {
      point.y = 0;
    }

    block = this.level.getBlockByPoint(point);
    let gridPos: BlockPos3;
    let gridSize: BlockSize3;
    if (block === undefined) {
      gridPos = this.level.worldPosToBlockPos(point);
      gridSize = { sx: 1, sy: 1, sz: 1 };
    } else {
      gridPos = block.mapPos;
      gridSize = block.mapSize;
    }

    console.log(`selectBlockFace: ${gridPos.x} ${gridPos.y} ${gridPos.z} y:${point.y}`)
    // for now select top face and draw rect
    if (this.selection !== undefined) {
      this.camera.scene!.remove(this.selection);
      this.selection = undefined;
      this.selectedArea = undefined;
    }

    let pos = this.level.blockPosToWorldPos(gridPos);
    let size = this.level.blockSizeToWorldSize(gridSize);

    this.buildSelectionBox(pos, size);

    this.selectedArea = { pos: gridPos, size: gridSize }
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
    this.camera.scene!.add(this.selection);
  }
}