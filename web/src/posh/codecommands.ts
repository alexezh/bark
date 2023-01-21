import { storeFileBackground } from "../fetchadapter";
import { resourceLib } from "../graphics/resourceLib";
import { codeLoader, printCodeException } from "../mechanics/codeloader";
import { CodeCategory, FileCategory } from "../mechanics/iavatarcode";
import { terminal } from "../ui/igameterminal";
import { gameState } from "../world/igamestate";
import { mapEditorState } from "./mapeditorstate";
import { printEditModeError, printNoRegion, registerFunction } from "./poshregistry";
import { withRegion } from "./regioncommands";

export function editCode(args: { category: string, id: string }) {
  editCodeWorker(args, true);
}

export function viewCode(args: { category: string, id: string }) {
  editCodeWorker(args, false);
}

function editCodeWorker(args: { category: string, id: string }, allowEdit: boolean) {
  if (args.category === undefined) {
    terminal?.printError('Category is not defined ' + args.category);
  }

  if (args.category === FileCategory.avatar) {
    let avatar = gameState.avatarCollection.getAvatar(args.id);
    if (avatar === undefined) {
      terminal?.printError('Avatar not found ' + args.id);
      return;
    }

    let code = avatar.getCode();

    let onSave = (allowEdit) ? (text: string) => { avatar!.updateCode(text); } : undefined;

    terminal?.editFile(code, onSave);
  } else if (args.category === FileCategory.pokedex) {
    editPokedexCode(args.id, allowEdit);
  } else if (args.category === FileCategory.location) {
    editLocationCode(args.id, allowEdit);
  } else if (args.category === FileCategory.tile) {
    editTileCode(args.id, allowEdit);
  } else {
    terminal?.printError('Unknown category ' + args.category);
  }
}

function editPokedexCode(name: string, allowEdit: boolean) {
  let pd = resourceLib.pokedex.getPokedexEntry(name);
  if (pd !== undefined) {
    let code = resourceLib.pokedex.getPokedexCode(pd);
    let onSave = (allowEdit) ? (text: string) => { resourceLib.pokedex.updatePokedexCode(pd!, text); } : undefined;

    terminal?.editFile(code, onSave);
  } else {
    if (name === 'default') {
      let codeName = 'pokedex/code/' + name;
      let file = codeLoader.getCodeModule(codeName);
      let onSave = (allowEdit) ? (text: string) => {
        codeLoader!.updateCode(codeName, text);
        storeFileBackground(codeName, text);
      } : undefined;

      terminal?.editFile(file?.code, onSave);
    }
  }
}

function editLocationCode(name: string, allowEdit: boolean) {
  if (mapEditorState.currentLayer === undefined) {
    printEditModeError();
    return;
  }

  let loc = mapEditorState.currentLayer.getLocation(name);
  if (loc === undefined) {
    terminal?.printError('Unknown location : ' + name);
  }

  let onSave = (allowEdit) ? (text: string) => {
    loc!.updateCode(text);
  } : undefined;

  terminal?.editFile(loc!.props.code, onSave);
}

function editTileCode(id: string, allowEdit: boolean) {
  withRegion((layer, region) => {
    let buffer = layer.getRegion(region);
    let codeFile: string | undefined;
    for (let tileId of buffer.tiles) {
      let tile = resourceLib.getTileById(tileId);
      if (tile === undefined) {
        continue;
      }

      if (codeFile !== undefined && codeFile !== tile.props.codeFile) {
        terminal?.printError('tiles use different files; clear ')
      }
    }
  });
}

export function editObject(args: { category: string, id: string }) {
  if (args.category === undefined) {
    terminal?.printError('Category name is not defined ' + args.category);
    return;
  }

  if (args.id === undefined) {
    terminal?.printError('Object name is not defined ' + args.id);
    return;
  }

  if (args.category === FileCategory.avatar) {
    let avatar = gameState.avatarCollection.getAvatar(args.id);
    if (avatar === undefined) {
      terminal?.printError('Avatar not found ' + args.id);
      return;
    }

    let rt = avatar.rt ?? {};
    let rtStr = JSON.stringify(rt, undefined, 2);

    terminal?.editFile(rtStr, (text: string) => {
      try {
        let newRt = JSON.parse(text);
        avatar?.updateRuntimeProps(newRt);
      }
      catch (e) {
        printCodeException(avatar!.id, e);
      }
    });
  } else if (args.category === FileCategory.pokedex) {
    let pd = resourceLib.pokedex.getPokedexEntry(args.id);
    if (pd === undefined) {
      terminal?.printError('Unknown pokemon ' + args.id);
      return;
    }

    let pdStr = JSON.stringify(pd.props, undefined, 2);

    terminal?.editFile(pdStr, (text: string) => {
      try {
        let newPd = JSON.parse(text);
        resourceLib.pokedex.updatePokedexEntry(args.id, newPd);
      }
      catch (e) {
        printCodeException(args.id, e);
      }
    });
  } else {
    terminal?.printError('Unknown category ' + args.category);
  }
}

export function registerCodeCommands() {
  registerFunction('editCode', ['category:string', 'id:string', 'jsonDecode:boolean'], editCode);
  registerFunction('viewCode', ['category:string', 'id:string'], viewCode);
  registerFunction('editObject', ['category:string', 'id:string'], editObject);
}
