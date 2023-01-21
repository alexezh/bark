import { fetchFiles, storeFile, storeFileBackground } from "../fetchadapter";
import { codeLoader } from "../mechanics/codeloader";
import { IPokedex, PokedexEntry, PokedexProps } from "./ipokedex";

export class Pokedex implements IPokedex {
  private pokedex: Map<string, PokedexEntry> = new Map<string, PokedexEntry>();

  public async loadPokedex(): Promise<boolean> {
    let files = await fetchFiles('pokedex/*');
    for (let p of files) {
      let parts = p.name.split('/');
      if (parts.length === 2) {
        let entry = JSON.parse(p.data);
        if (typeof entry === 'string') {
          await storeFile(p.name, entry);
          entry = JSON.parse(entry);
        }

        this.pokedex.set(parts[1], new PokedexEntry(entry));
      } else if (parts.length === 3) {
        codeLoader.updateCode(p.name, p.data);
      }
    }

    return true;
  }

  private makePokedexId(id: any): string | undefined {
    if (id === undefined || id === null) {
      return undefined;
    }

    let sid = String(id).padStart(3, '0');

    return sid;
  }

  public addPokedexEntry(id: any, props: PokedexProps) {
    let sid = this.makePokedexId(id);
    if (sid === undefined) {
      return undefined;
    }

    this.pokedex.set(sid, new PokedexEntry(props));

    storeFile('pokedex/' + sid, JSON.stringify(props));
  }

  public updatePokedexEntry(id: any, props: PokedexProps) {
    let sid = this.makePokedexId(id);
    if (sid === undefined) {
      return undefined;
    }

    let pd = this.pokedex.get(sid);
    if (pd === undefined) {
      return undefined;
    }

    pd.props = props;
    storeFile('pokedex/' + sid, JSON.stringify(props));
  }

  public getPokedexEntry(id: any): PokedexEntry | undefined {
    let sid = this.makePokedexId(id);
    if (sid === undefined) {
      return undefined;
    }

    return this.pokedex.get(sid);
  }

  public updatePokedexCode(entry: PokedexEntry, text: string): void {
    codeLoader.updateCode(entry.props.code, text);
    storeFileBackground(entry.props.code, text);
  }

  public getPokedexCode(entry: PokedexEntry): string {
    let file = codeLoader.getCodeModule(entry.props.code);

    return (file !== undefined) ? file.code : '';
  }
}
