import { Mesh } from "three";
import { wireSetStrings, WireString } from "../lib/fetchadapter";
import { bytesToBase64 } from "../lib/base64";
import { IAction, ICommandBar } from "../ui/iaction";
import { defaultMaterial } from "../ui/ivoxelmap";
import { ThumbnailRenderer } from "../voxel/thumbnailrenderer";
import { Vox } from "../voxel/vox";
import { VoxelGeometryWriter } from "../voxel/voxelgeometrywriter";
import { VoxelModelFrame } from "../voxel/voxelmodel";
import { createButton } from "../lib/htmlutils";
import { encode as PngEncode } from 'fast-png';

type UploadFile = {
  fn: string;
  vox: Uint8Array;
  png: ImageData;
}

export class ImportVoxAction implements IAction {
  private static _nextId: number = 1;
  private _id: number;
  private _element: HTMLDivElement | undefined;
  private _inputElem: HTMLInputElement | undefined;

  get tags(): string[] { return ['import', 'upload', 'vox', 'block'] }
  public get name(): string { return 'Import Vox' }

  public constructor() {
    this._id = ImportVoxAction._nextId++;
  }

  public renderButton(parent: HTMLElement, bar: ICommandBar) {

    let div = this.createUploadButton(bar);
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

  private createUploadButton(bar: ICommandBar): HTMLDivElement {
    let d = document.createElement('input');
    d.id = 'upload_' + this._id;
    d.name = d.id;
    d.type = 'file';
    d.style.display = "none";
    d.multiple = true;
    d.accept = ".vox";
    d.onchange = () => {
      this.processUpload(bar);
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

  private async processUpload(bar: ICommandBar) {
    if (this._inputElem!.files === null) {
      return;
    }

    for (let f of this._inputElem!.files) {
      let fn = f.name;
      if (!fn.endsWith('.vox')) {
        bar.displayError('File extension is not .vox');
        return;
      }
    }

    let uploadFiles = await this.loadVox(bar, this._inputElem!.files);
    this.displayPane(bar, uploadFiles);
  }

  private async loadVox(bar: ICommandBar, files: FileList): Promise<UploadFile[]> {
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

      let thumb = await this.renderThumbnail(bar, vox, tr, data, fn);
      if (thumb === undefined) {
        console.log('cannot render thumbnail');
        continue;
      }

      uploadFiles.push({ fn: fn, vox: new Uint8Array(data), png: thumb });
    }

    return uploadFiles;
  }

  private async renderThumbnail(
    bar: ICommandBar,
    vox: Vox,
    tr: ThumbnailRenderer,
    data: ArrayBuffer,
    fn: string): Promise<ImageData | undefined> {
    let voxelFile = vox.loadModel(data, fn);
    if (voxelFile === undefined || voxelFile.frames.length === 0) {
      bar.displayError('Cannot load model ' + fn);
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

  private async displayPane(bar: ICommandBar, uploadFiles: UploadFile[]) {

    let d = document.createElement('div');
    d.className = 'commandPane';

    for (let file of uploadFiles) {
      let bitmap = await createImageBitmap(file.png);

      let canvas: HTMLCanvasElement = document.createElement('canvas');
      let ctx = canvas.getContext("2d");
      ctx?.drawImage(bitmap, 0, 0);
      d.appendChild(canvas);
    }

    let upload = createButton(d, 'Upload', () => { this.upload(bar, uploadFiles); });

    bar.openDetailsPane(d);
  }

  private async upload(bar: ICommandBar, uploadFiles: UploadFile[]) {

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

    bar.closeDetailsPane();
  }
}

