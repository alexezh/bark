import { Mesh } from "three";
import { wireSetStrings, WireString } from "../fetchadapter";
import { base64ToBytes, bytesToBase64 } from "../posh/base64";
import { ICommandBar } from "../ui/commandBar";
import { IAction } from "../ui/iaction";
import { defaultMaterial } from "../voxel/igamemap";
import { ThumbnailRenderer } from "../voxel/thumbnailrenderer";
import { Vox } from "../voxel/vox";
import { VoxelGeometryWriter } from "../voxel/voxelgeometrywriter";
import { VoxelModel, VoxelModelFrame } from "../voxel/voxelmodel";

export class UploadVoxAction implements IAction {
  private static _nextId: number = 1;
  private _id: number;
  private _inputElem: HTMLInputElement | undefined;
  private _bar: ICommandBar;

  get tags(): string[] { return ['upload', 'vox', 'block'] }

  public constructor(bar: ICommandBar) {
    this._id = UploadVoxAction._nextId++;
    this._bar = bar;
  }

  public get name(): string { return 'Upload' }

  public render(parent: HTMLElement) {
    let d = document.createElement('input');
    d.id = 'upload_' + this._id;
    d.type = 'file';
    d.multiple = true;
    d.onchange = () => {
      this.processUpload();
    }

    this._inputElem = d;
    parent.appendChild(d);
  }

  public destroy(parent: HTMLElement) {
    if (this._inputElem === undefined) {
      return;
    }
    parent.removeChild(this._inputElem);
    this._inputElem = undefined;
  }

  private async processUpload() {
    if (this._inputElem!.files === null) {
      return;
    }

    for (let f of this._inputElem!.files) {
      let fn = f.name;
      if (!fn.endsWith('.vox')) {
        this._bar.displayError('File extension is not .vox');
        return;
      }
    }

    let vox = new Vox();
    let tr = new ThumbnailRenderer(128, 128);
    let wireFiles: WireString[] = [];
    for (let f of this._inputElem!.files) {
      let data = await f.arrayBuffer();
      let fn = f.name;
      if (!fn.endsWith('.vox')) {
        return;
      }

      let thumb = this.renderThumbnail(vox, tr, data, fn);
      if (thumb === undefined) {
        return;
      }

      let str = bytesToBase64(data as Uint8Array);
      wireFiles.push({ key: 'vox/' + fn, data: str });
    }

    await wireSetStrings(wireFiles);
  }

  renderThumbnail(vox: Vox, tr: ThumbnailRenderer, data: ArrayBuffer, fn: string): string | undefined {
    let voxelFile = vox.loadModel(data, fn);
    if (voxelFile === undefined || voxelFile.frames.length === 0) {
      this._bar.displayError('Cannot load model ' + fn);
      return undefined;
    }

    let mf = new VoxelModelFrame(voxelFile.frames[0]);
    let writer = new VoxelGeometryWriter();
    mf.build(writer);

    let geo = writer.getGeometry();
    let mm = new Mesh(geo, defaultMaterial);
    mm.geometry.center();

    return tr.render(mm);
  }
}