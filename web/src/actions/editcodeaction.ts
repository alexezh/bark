import { vm } from "../engine/ivm";
import { CodeEditor } from "./codeeditor";
import { BasicAction, FuncAction } from "./commandaction";
import { DetailsPaneKind, IAction, ICommandLayer } from "./iaction";


export function registerEditCodeActions(actions: IAction[]) {
  actions.push(new EditCodeAction());
}

function addOn(codeEditor: CodeEditor) {
  codeEditor.addBlock('hello world');
}

export class EditCodeAction extends BasicAction {
  private codeEditor?: CodeEditor;

  get name(): string { return 'EditCode'; }
  get tags(): string[] { return ['edit', 'code'] }

  public constructor() {
    super('EditCode', { tags: ['edit', 'code'] });
  }

  protected override onClick(bar: ICommandLayer) {
    vm.stop();
    this.codeEditor = new CodeEditor();
    this.codeEditor.loadContent();

    bar.pushActions(
      [
        new FuncAction('Copy', { closePane: false }, () => this.codeEditor!.copyText()),
        new FuncAction('Cut', { closePane: false }, () => this.codeEditor!.cutText()),
        new FuncAction('Paste', { closePane: false }, () => this.codeEditor!.pasteText()),
        new FuncAction('Add Line Above', { closePane: false }, () => this.codeEditor!.addAbove()),
        new FuncAction('Add Line Below', { closePane: false }, () => this.codeEditor!.addBelow()),
        new FuncAction('Edit Text', { closePane: false }, () => this.codeEditor!.editText()),
        new FuncAction('Add prod', { closePane: false }, () => this.codeEditor!.addBelow()),
        new FuncAction('Add on', { closePane: false }, () => addOn(this.codeEditor!)),
      ]);
    bar.openDetailsPane(this.codeEditor.editEditor, DetailsPaneKind.Full);
  }

  public editCode() {

    //    this.openTextEditor((text: string) => {
    //      this.closeTextEditor();
    //    });
  }
  /*
    private openTextEditor(onSave: ((text: string) => void) | undefined) {
      if (this.codeEditor === undefined) {
        this.codeEditor = new CodeEditor({
          id: "codeeditor",
          x: 40,
          y: 40,
          w: this.props.width - 80,
          h: this.props.height - 80,
          visible: false
        });
  
        this.compositor2.appendLayer(this.codeEditor);
      }
  
      this.codeEditor.load(onSave, () => this.closeTextEditor());
  
      this.codeEditor.visible = true;
      this.codeEditor.focus();
    }
  
    private closeTextEditor() {
      this.codeEditor!.visible = false;
      this.camera?.focus();
    }
    */
}