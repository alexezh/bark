import { IAction } from "./iaction";

export class MoveCameraAction implements IAction {
  get name(): string { return 'MoveCamera' }

  render(parent: HTMLElement) {
  }
  destroy(parent: HTMLElement) {
  }
}

export class UploadAction implements IAction {
  private static _nextId: number = 1;
  private _id: number;
  private _inputElem: HTMLInputElement | undefined;

  public constructor() {
    this._id = UploadAction._nextId++;
  }

  public get name(): string { return 'Upload' }

  public render(parent: HTMLElement) {
    let d = document.createElement('input');
    d.id = 'upload_' + this._id;
    d.type = 'file';
    d.onclick = () => {
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

  private processUpload() {
    if (this._inputElem!.files === null) {
      return;
    }

    var myUploadedFile = this._inputElem!.files[0];
  }
}