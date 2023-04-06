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
import { modelCache, VoxelModelCache, WireModelInfo } from "../voxel/voxelmodelcache";

export type UploadFile = {
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

    let div = this.createImportButton(bar);
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

  private createImportButton(bar: ICommandBar): HTMLDivElement {
    let d = document.createElement('input');
    d.id = 'upload_' + this._id;
    d.name = d.id;
    d.type = 'file';
    d.style.display = "none";
    d.multiple = true;
    d.accept = ".vox";
    d.onchange = () => {
      this.processImport(bar);
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

  private async processImport(bar: ICommandBar) {
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

      let thumb = await ImportVoxAction.renderThumbnail(vox, tr, data, fn);
      if (typeof thumb === 'string') {
        bar.displayError(thumb);
        continue;
      } else if (thumb === undefined) {
        continue;
      }

      uploadFiles.push({ fn: fn, vox: new Uint8Array(data), png: thumb });
    }

    return uploadFiles;
  }

  public static async renderThumbnail(
    vox: Vox,
    tr: ThumbnailRenderer,
    data: ArrayBuffer,
    fn: string): Promise<ImageData | string | undefined> {
    let voxelFile = vox.loadModel(data, fn);
    if (voxelFile === undefined || voxelFile.frames.length === 0) {
      return 'Cannot load model ' + fn;
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

    let upload = createButton(d, 'Upload', () => {
      ImportVoxAction.upload(uploadFiles);
      bar.closeDetailsPane();
    });

    bar.openDetailsPane(d);
  }

  /**
   * return list of models (with IDs)
   */
  public static async upload(uploadFiles: UploadFile[]): Promise<WireModelInfo[] | undefined> {

    let wireFiles: WireString[] = [];
    let modelRefs: { voxUrl: string, thumbnailUrl: string }[] = [];
    for (let file of uploadFiles) {
      let dataStr = bytesToBase64(file.vox);
      let voxUrl = 'vox/' + file.fn;
      wireFiles.push({ key: voxUrl, data: dataStr });

      let thumbName = file.fn.replace('.vox', '.png');

      // const b = new PNG().pack().toBytes();
      const png = PngEncode({ width: file.png.width, height: file.png.height, data: file.png.data })
      let pngStr = bytesToBase64(png);

      let thumbUrl = 'thumbnail/' + thumbName;
      wireFiles.push({ key: thumbUrl, data: pngStr });

      modelRefs.push({ voxUrl: voxUrl, thumbnailUrl: thumbUrl });
    }

    await wireSetStrings(wireFiles);

    return await VoxelModelCache.addModelReferences(modelRefs);
  }
}

