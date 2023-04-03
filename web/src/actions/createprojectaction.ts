import { WireLevelInfo, getProjectId, setProjectId, wireCreateProject, wireSetObject, wireSetUserString } from "../lib/fetchadapter";
import { CommandAction, FormPane } from "./commandaction";
import { v4 as uuidv4 } from 'uuid';
import { vm } from "../engine/ivm";
import { ICommandBar } from "../ui/iaction";

export class CreateProjectAction extends CommandAction {
  get name(): string { return 'CreateProject' }
  get tags(): string[] { return ['project', 'create'] }

  protected override onClick(bar: ICommandBar) {
    let pane = new FormPane();
    pane.addTextField('Name', 'MyProject');
    //pane.addIntField('Blocks X', 100);
    //pane.addIntField('Blocks Z', 100);
    pane.addButtom('Create', () => this.createProject(pane));
    bar.openDetailsPane(pane.element);
  }

  private async createProject(pane: FormPane): Promise<void> {
    let oldProject: string | undefined = getProjectId();
    try {
      let name = pane.values['Name'];
      let response = await wireCreateProject(name);

      // switch project id for next requests
      // at this point we are switching to new project; so we have to reload
      // but before we reload, create a level so we have somewhere to go
      // if we fail; go bath
      setProjectId(response.id);

      await CreateLevelAction.createLevelParams('default', 100, 100);

      await vm.loadProject(response.id);

      //await wireSetUserString('lastProject', response.id);
    }
    catch (e) {
      console.log('createProject failed');
      if (oldProject !== undefined) {
        setProjectId(oldProject);
      }
    }
  }
}

export class CreateLevelAction extends CommandAction {
  get name(): string { return 'CreateLevel' }
  get tags(): string[] { return ['level', 'create', 'level'] }

  protected override onClick(bar: ICommandBar) {
    let pane = new FormPane();
    pane.addTextField('Name', 'MyLevel');
    pane.addIntField('Blocks X', 100);
    pane.addIntField('Blocks Z', 100);
    pane.addButtom('Create', () => this.createLevel(pane));
    bar.openDetailsPane(pane.element);
  }

  private createLevel(pane: FormPane): Promise<void> {
    return CreateLevelAction.createLevelParams(pane.values['Name'], pane.values['Block X'], pane.values['Block Z'])
  }

  public static async createLevelParams(name: string, sx: number, sz: number): Promise<void> {
    let levelInfo: WireLevelInfo = {
      name: name,
      id: uuidv4(),
      sx: sx,
      sy: 1,
      sz: sz,
    }
    wireSetObject(`levels/info/${levelInfo.id}`, levelInfo);
  }
}


