import { vm } from "../engine/ivm";
import { CodeEditor } from "./codeeditor";
import { CommandAction, FuncAction } from "./commandaction";
import { DetailsPaneKind, IAction, ICommandLayer } from "./iaction";


export function registerEditCodeActions(actions: IAction[]) {
  actions.push(new EditCodeAction());
}

export class EditCodeAction extends CommandAction {
  private codeEditor?: CodeEditor;

  get name(): string { return 'EditCode'; }
  get tags(): string[] { return ['edit', 'code'] }

  public constructor() {
    super('EditCode', ['edit', 'code']);
  }

  protected override onClick(bar: ICommandLayer) {
    vm.stop();
    this.codeEditor = new CodeEditor();
    this.codeEditor.loadContent();

    bar.pushActions(
      [
        new FuncAction('Back', [], () => this.onBack(bar)),
        new FuncAction('Copy', [], () => this.codeEditor!.copyText()),
        new FuncAction('Cut', [], () => this.codeEditor!.cutText()),
        new FuncAction('Paste', [], () => this.codeEditor!.pasteText()),
        new FuncAction('Add Line Above', [], () => this.codeEditor!.addAbove()),
        new FuncAction('Add Line Below', [], () => this.codeEditor!.addBelow())
      ]);
    bar.openDetailsPane(this.codeEditor.editEditor, DetailsPaneKind.Full);
  }

  public onBack(bar: ICommandLayer) {
    bar.popActions();
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