import { Mesh } from "three";
import { wireSetStrings, WireString } from "../lib/fetchadapter";
import { base64ToBytes, bytesToBase64 } from "../lib/base64";
import { ICommandBar } from "./commandBar";
import { IAction } from "../ui/iaction";
import { defaultMaterial } from "../ui/ivoxelmap";
import { ThumbnailRenderer } from "../voxel/thumbnailrenderer";
import { Vox } from "../voxel/vox";
import { VoxelGeometryWriter } from "../voxel/voxelgeometrywriter";
import { VoxelModel, VoxelModelFrame } from "../voxel/voxelmodel";
import { createButton } from "../lib/htmlutils";
import { encode as PngEncode } from 'fast-png';

type UploadFile = {
  fn: string;
  vox: Uint8Array;
  png: ImageData;
}

export class UploadVoxAction implements IAction {
  private static _nextId: number = 1;
  private _id: number;
  private _element: HTMLDivElement | undefined;
  private _inputElem: HTMLInputElement | undefined;
  private _bar: ICommandBar;
  private parent!: HTMLElement;

  get tags(): string[] { return ['upload', 'vox', 'block'] }

  public constructor(bar: ICommandBar) {
    this._id = UploadVoxAction._nextId++;
    this._bar = bar;
  }

  public get name(): string { return 'Upload' }

  public renderButton(parent: HTMLElement) {
    this.parent = parent;

    let div = this.createUploadButton();
    this._element = div;

    parent.appendChild(div);
  }

  public destroyButton(parent: HTMLElement) {
    if (this._element === undefined) {
      return;
    }
    parent.removeChild(this._element);
    this._element = undefined;
    this._inputElem = undefined;
  }

  private createUploadButton(): HTMLDivElement {
    let d = document.createElement('input');
    d.id = 'upload_' + this._id;
    d.name = d.id;
    d.type = 'file';
    d.style.display = "none";
    d.multiple = true;
    d.accept = ".vox";
    d.onchange = () => {
      this.processUpload();
    }
    this._inputElem = d;

    let label = document.createElement('label') as HTMLLabelElement;
    label.htmlFor = d.id;
    label.className = "commandButton";
    label.textContent = 'Upload';

    let div = document.createElement('div') as HTMLDivElement;
    div.appendChild(label);
    div.appendChild(d);

    return div;
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

    let uploadFiles = await this.loadVox(this._inputElem!.files);
    this.displayPane(uploadFiles);
  }

  private async loadVox(files: FileList): Promise<UploadFile[]> {
    let vox = new Vox();
    let tr = new ThumbnailRenderer(128, 128);
    let uploadFiles: UploadFile[] = [];
    for (let f of files) {
      let data = await f.arrayBuffer();
      let fn = f.name;
      if (!fn.endsWith('.vox')) {
        console.log('file is not vox');
        continue;
      }

      let thumb = await this.renderThumbnail(vox, tr, data, fn);
      if (thumb === undefined) {
        console.log('cannot render thumbnail');
        continue;
      }

      uploadFiles.push({ fn: fn, vox: new Uint8Array(data), png: thumb });
    }

    return uploadFiles;
  }

  private async renderThumbnail(vox: Vox, tr: ThumbnailRenderer, data: ArrayBuffer, fn: string): Promise<ImageData | undefined> {
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

    let imageData = tr.render(mm);

    return imageData;
  }

  private async displayPane(uploadFiles: UploadFile[]) {

    let d = document.createElement('div');
    d.className = 'commandPane';

    for (let file of uploadFiles) {
      let bitmap = await createImageBitmap(file.png);

      let canvas: HTMLCanvasElement = document.createElement('canvas');
      let ctx = canvas.getContext("2d");
      ctx?.drawImage(bitmap, 0, 0);
      d.appendChild(canvas);
    }

    let upload = createButton(d, 'Upload', () => { this.upload(uploadFiles); });

    this._bar.openDetailsPane(d);
  }

  private async upload(uploadFiles: UploadFile[]) {

    let wireFiles: WireString[] = [];
    for (let file of uploadFiles) {
      let dataStr = bytesToBase64(file.vox);
      wireFiles.push({ key: 'vox/' + file.fn, data: dataStr });

      let thumbName = file.fn.replace('.vox', '.png');

      // const b = new PNG().pack().toBytes();
      const png = PngEncode({ width: file.png.width, height: file.png.height, data: file.png.data })
      let pngStr = bytesToBase64(png);

      wireFiles.push({ key: 'thumpnail/' + thumbName, data: pngStr });
    }

    await wireSetStrings(wireFiles);

    this._bar.closeDetailsPane();
  }
}

