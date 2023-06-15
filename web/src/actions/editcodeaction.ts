import { AstTemplate, eventTemplateAst, eventTemplates, functionTemplateAst, varTemplateAst } from "../basic/intellisense";
import { vm } from "../engine/ivm";
import { CodeEditor } from "./codeeditor";
import { BasicAction, FuncAction, MenuAction } from "./commandaction";
import { DetailsPaneKind, IAction, ICommandLayer } from "./iaction";


export function registerEditCodeActions(actions: IAction[]) {
  actions.push(new EditCodeAction());
}

function addOn(codeEditor: CodeEditor) {
  codeEditor.addBlock('hello world');
}

export class AddAstAction extends BasicAction {
  private tmpl: AstTemplate;
  private editor: CodeEditor;

  public constructor(editor: CodeEditor, t: AstTemplate) {
    super(t.name, { closePane: false })
    this.tmpl = t;
    this.editor = editor;
  }
  protected override onClick(bar: ICommandLayer) {
    this.editor.addTemplate(this.tmpl.ast);
  }
}

function makeAddAstActions(editor: CodeEditor, tmpl: AstTemplate[]): AddAstAction[] {
  return tmpl.map((x) => new AddAstAction(editor, x));
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
        new FuncAction('Delete', { closePane: false }, () => this.codeEditor!.deleteText()),
        new FuncAction('Edit Text', { closePane: false }, () => this.codeEditor!.editText()),
        new MenuAction('Insert', ['edit'],
          [
            new FuncAction('Line Above', { closePane: false }, () => this.codeEditor!.addAbove()),
            new FuncAction('Line Below', { closePane: false }, () => this.codeEditor!.addBelow()),
            new MenuAction('Events', ['edit'], makeAddAstActions(this.codeEditor!, eventTemplates())),
            new AddAstAction(this.codeEditor!, { name: 'Variable', ast: varTemplateAst }),
            new AddAstAction(this.codeEditor!, { name: 'Function', ast: functionTemplateAst }),
            //            new MenuAction('Control', controlTemplates()),
            //            new MenuAction('Operator', operatorTemplates),
            //            new MenuAction('Math', moduleTemplates()),
            //            new MenuAction('Physics', moduleTemplates()),
            //            new MenuAction('Sprite', moduleTemplates()),
            //            new MenuAction('System', moduleTemplates())
          ])
        //new FuncAction('Add proc', { closePane: false }, () => this.codeEditor!.addBelow()),
        //new FuncAction('Add on', { closePane: false }, () => addOn(this.codeEditor!)),
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