import { Mesh } from "three";
import { wireSetStrings, WireString } from "../lib/fetchadapter";
import { bytesToBase64 } from "../lib/base64";
import { DetailsPaneKind, IAction, ICommandLayer } from "./iaction";
import { defaultMaterial } from "../ui/ivoxelmap";
import { ThumbnailRenderer } from "../voxel/thumbnailrenderer";
import { Vox } from "../voxel/vox";
import { VoxelGeometryWriter } from "../voxel/voxelgeometrywriter";
import { VoxelModelFrame } from "../voxel/voxelmodel";
import { createButton } from "../lib/htmlutils";
import { encode as PngEncode } from 'fast-png';
import { ImportFile, modelCache, VoxelModelCache, WireModelInfo } from "../voxel/voxelmodelcache";

export class ImportVoxAction implements IAction {
  private static _nextId: number = 1;
  private _id: number;
  private _element: HTMLDivElement | undefined;
  private _inputElem: HTMLInputElement | undefined;
  private _labelElem: HTMLLabelElement | undefined;
  private _paneElem: HTMLElement | undefined;
  private _filesElem: HTMLElement | undefined;

  get tags(): string[] { return ['import', 'upload', 'vox', 'block'] }
  public get name(): string { return 'Import Vox' }

  public constructor() {
    this._id = ImportVoxAction._nextId++;
  }

  public renderButton(parent: HTMLElement, bar: ICommandLayer) {

    this._element = document.createElement('div') as HTMLDivElement;
    this.createImportButton(bar);

    parent.appendChild(this._element);
  }

  public destroyButton(parent: HTMLElement) {
    if (this._element === undefined) {
      return;
    }
    parent.removeChild(this._element);
    this._element = undefined;
    this._inputElem = undefined;
  }

  public getChildActions(): Iterable<IAction> {
    return [];
  }

  private createImportButton(bar: ICommandLayer) {
    if (this._inputElem) {
      this._element?.removeChild(this._inputElem);
      this._inputElem = undefined;
    }
    if (this._labelElem) {
      this._element?.removeChild(this._labelElem);
      this._labelElem = undefined;
    }

    let d = document.createElement('input');
    d.id = 'upload_' + this._id;
    d.name = d.id;
    d.type = 'file';
    d.style.display = "none";
    d.multiple = true;
    d.accept = ".vox";
    d.onchange = () => {
      bar.closeDetailsPane();
      this.processImport(bar);
      // update button for next time
      this.createImportButton(bar);
    }
    this._inputElem = d;

    this._labelElem = document.createElement('label') as HTMLLabelElement;
    this._labelElem.htmlFor = d.id;
    this._labelElem.className = "commandButton";
    this._labelElem.textContent = this.name;

    this._element!.appendChild(this._labelElem);
    this._element!.appendChild(this._inputElem);
  }

  private async processImport(bar: ICommandLayer) {
    if (this._inputElem!.files === null) {
      return;
    }

    let importFiles: ImportFile[] = [];
    for (let f of this._inputElem!.files) {
      let fn = f.name;
      if (!fn.endsWith('.vox')) {
        bar.displayError('File extension is not .vox');
        return;
      }

      let data = await f.arrayBuffer();
      importFiles.push({
        fn: fn,
        vox: new Uint8Array(data),
        rotateYZ: false,
        png: undefined
      });
    }

    this.displayPane(bar, importFiles);
  }

  private async loadVox(bar: ICommandLayer, importFiles: ImportFile[], rotateYZ: boolean = false): Promise<void> {
    let vox = new Vox();
    let tr = new ThumbnailRenderer(128, 128);
    for (let f of importFiles) {
      let thumb = await ImportVoxAction.renderThumbnail(vox, tr, f, rotateYZ);
      if (typeof thumb === 'string') {
        bar.displayError(thumb);
        continue;
      } else if (thumb === undefined) {
        continue;
      }

      f.rotateYZ = rotateYZ;
      f.png = thumb;
    }
  }

  public static async renderThumbnail(
    vox: Vox,
    tr: ThumbnailRenderer,
    file: ImportFile,
    rotateYZ: boolean): Promise<ImageData | string | undefined> {
    let voxelFile = vox.loadModel(file.vox, rotateYZ);
    if (voxelFile === undefined || voxelFile.frames.length === 0) {
      return 'Cannot load model:' + file.fn;
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

  private async displayPane(bar: ICommandLayer, importFiles: ImportFile[]) {

    this._paneElem = document.createElement('div');
    this._paneElem.className = 'commandPane';
    this._filesElem = undefined;

    let rotateYZ = false;
    await this.loadVox(bar, importFiles, rotateYZ);
    await this.renderFiles(importFiles);

    createButton(this._paneElem, 'formButton', 'Y-Z', () => {
      setTimeout(async () => {
        rotateYZ = !rotateYZ;
        await this.loadVox(bar, importFiles, rotateYZ);
        await this.renderFiles(importFiles);
      })
    });

    createButton(this._paneElem, 'formButton', 'Upload', () => {
      ImportVoxAction.upload(importFiles);
      bar.closeDetailsPane();
    });

    bar.openDetailsPane(this._paneElem, DetailsPaneKind.Partial);
  }

  private async renderFiles(importFiles: ImportFile[]): Promise<void> {
    if (this._filesElem) {
      this._paneElem!.removeChild(this._filesElem);
      this._filesElem = undefined;
    }

    this._filesElem = document.createElement('div');
    if (this._paneElem?.firstChild !== null) {
      this._paneElem!.insertBefore(this._filesElem, this._paneElem?.firstChild!);
    } else {
      this._paneElem!.appendChild(this._filesElem);
    }

    for (let file of importFiles) {
      let bitmap = await createImageBitmap(file.png!);

      let canvas: HTMLCanvasElement = document.createElement('canvas');
      let ctx = canvas.getContext("2d");
      //ctx?.scale(1, -1);
      ctx?.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height);
      this._filesElem.appendChild(canvas);
    }
  }

  /**
   * return list of models (with IDs)
   */
  public static async upload(importFiles: ImportFile[]): Promise<WireModelInfo[] | undefined> {

    let wireFiles: WireString[] = [];
    for (let file of importFiles) {
      let dataStr = bytesToBase64(file.vox);
      let voxUrl = 'vox/' + file.fn;
      wireFiles.push({ key: voxUrl, data: dataStr });

      let thumbName = file.fn.replace('.vox', '.png');
      let thumbUrl = 'thumbnail/' + thumbName;

      file.voxUrl = voxUrl;
      file.thumbnailUrl = thumbUrl;

      // const b = new PNG().pack().toBytes();
      const png = PngEncode({ width: file.png!.width, height: file.png!.height, data: file.png!.data })
      let pngStr = bytesToBase64(png);

      wireFiles.push({ key: thumbUrl, data: pngStr });
    }

    await wireSetStrings(wireFiles);

    return await modelCache.importFiles(importFiles);
  }
}

