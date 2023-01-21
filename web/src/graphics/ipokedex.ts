export type WirePokedexEntry = {
  id: string;
  value: string;
}

export enum PokemonKind {
  grass = 'grass',
  water = 'water',
  fire = 'fire'
}

export type PokedexProps = {
  id: string,
  name: string;
  kind: PokemonKind;
  battlerFrontUrl: string;
  battlerBackUrl: string;
  iconUrl: string;
  skinUrl: string;
  hp: number;
  hpMax: number;
  code: string;
  moves: string[];
}

export class PokedexEntry {
  public props: PokedexProps;

  constructor(props: PokedexProps) {
    this.props = props;
  }
}

export interface IPokedex {

  loadPokedex(): Promise<boolean>;
  addPokedexEntry(id: any, props: PokedexProps): void;
  updatePokedexEntry(id: any, props: PokedexProps): void;
  getPokedexEntry(id: any): PokedexEntry | undefined;
}