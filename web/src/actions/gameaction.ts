import { vm } from "../engine/ivm";
import { BasicAction } from "./commandaction";
import { ICommandLayer } from "./iaction";


export class RunGameAction extends BasicAction {
  public constructor() {
    super('Start', { tags: ['game'] });
  }

  protected override onClick(bar: ICommandLayer) {
    setTimeout(async () => {
      await vm.start();
    });
  }
}
