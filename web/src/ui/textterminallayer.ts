import { FitAddon } from 'xterm-addon-fit';
import { Readline } from "../readline/readline";
import { Terminal as TT } from 'xterm';
import { Repl } from "../posh/repl";
import { UiLayer2, UiLayerProps } from "./uilayer";
import { MapEditorState } from "../posh/mapeditorstate";
import { throws } from 'assert';

export type TerminalLayerProps = UiLayerProps & {
  repl: Repl;
  visible: boolean;
  mapEditorState: MapEditorState;
  onCloseTerminal: () => void;
}

export class TextTerminalLayer extends UiLayer2<TerminalLayerProps> {
  private rl?: Readline;
  private term?: TT;
  private repl: Repl;
  private fitAddon?: FitAddon;
  private mapEditorState?: MapEditorState;

  public constructor(props: TerminalLayerProps) {
    let element = document.createElement('div');
    element.className = 'terminalLayer';
    element.id = props.id;
    element.style.visibility = (props.visible) ? 'visible' : 'hidden';

    super(props, element);
    this.repl = props.repl;
    this.repl.onPrint = (s: string) => this.rl?.println(s);

    this.mapEditorState = props.mapEditorState;

    let self = this;
    this.element.addEventListener('keyup', (evt) => self.onKeyUp(evt), false);

    this.createTerminal();
  }

  public focus() {
    this.term?.focus();
  }

  public print(s: string) {
    this.term?.write(s);
    this.term?.write('\r\n');
  }

  private onKeyUp(evt: KeyboardEvent) {
    if (evt.code == 'Escape') {
      this.props.onCloseTerminal();
      evt.cancelBubble = true;
    }
  }

  private createTerminal() {
    this.rl = new Readline();
    this.term = new TT({});
    this.term.loadAddon(this.rl);
    this.fitAddon = new FitAddon();
    this.term.loadAddon(this.fitAddon);

    this.term.open(this.element);
    this.fitAddon.fit();

    this.term.attachCustomKeyEventHandler((key: KeyboardEvent) => {
      if (key.code === 'KeyC' || key.code === 'KeyV') {
        if (key.ctrlKey && key.shiftKey) {
          return false;
        }
      }
      return true;
    });

    // this.term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ')

    setTimeout(() => this.readLine());
  }

  public fit(count?: number) {
    // wait for terminal to render
    let dim = this.fitAddon?.proposeDimensions();

    if (dim === undefined) {
      let newCount = (count === undefined) ? 1 : count + 1;
      if (newCount > 100) {
        throw 'cannot initialize';
      }
      window.requestAnimationFrame(() => this.fit(newCount));
    }
    else {
      this.fitAddon?.fit();
    }
  }

  public async prompt(s: string): Promise<string> {
    this.rl!.cancelRead();
    let res = await this.rl!.read(s, true);
    // restart readline
    this.readLine();
    return res;
  }

  public async promptMenu(s: string): Promise<string> {
    this.rl!.cancelRead();
    let res = await this.rl!.readChar(s)
    // restart readline
    this.readLine();
    return res;
  }

  private readLine() {
    this.rl!.read(":").then(
      (x) => this.processLine(x),
      (r) => console.log(r));
  }

  private processLine(text: string) {
    let output = this.repl.processLine(text);
    if (output !== undefined) {
      this.rl!.println(output);
    }
    setTimeout(() => this.readLine());
  }
}