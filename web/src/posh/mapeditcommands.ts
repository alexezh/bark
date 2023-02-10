import { Repl } from "./repl";
import { mapEditorState, MapEditorState } from "./mapeditorstate";
import { BindKeyDef, ShowKeyBindingsDef } from "./keybindcommands";
import { SpawnCharacterDef } from "./charactercommands";
import { PoshFunction, printEditModeError, printHelp, printNoRegion, registerFunction } from "./poshregistry";
import { gameState } from "../world/igamestate";
import { addEditorShortcuts } from "../voxel/mapeditor";

export let showKeyBindingsDef: ShowKeyBindingsDef | undefined = undefined;

export function populateMapEditCommands(repl: Repl, mapEditorState: MapEditorState) {
  showKeyBindingsDef = new ShowKeyBindingsDef(mapEditorState);

  repl.addFunc(new BindKeyDef(mapEditorState));
  repl.addFunc(showKeyBindingsDef);

  repl.addFunc(new SpawnCharacterDef(mapEditorState));

  addEditorShortcuts(showKeyBindingsDef);
  //addCameraShortcuts(showKeyBindingsDef);

  /*
    repl.addFunc({
      name: 'set-key-binding',
      category: 'edit',
      help: `set binding to a key. Use ${greenText}set-key-binding <key> <func>${resetColor}`,
      func: setKeyBinding
    });
  
    repl.addFunc({
      name: 'list-key-bindings',
      category: 'edit',
      help: `display all key bindings. Use ${greenText}list-key-binding${resetColor}`,
      func: listKeyBindings
    });
*/
}
