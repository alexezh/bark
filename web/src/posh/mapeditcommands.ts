import { AstNode, AstNodeKind, createFuncCall, intParam, stringParam } from "./ast";
import { Repl } from "./repl";
import { CutRegionDef, CopyRegionDef, FillRegionDef, GetRegionInfoDef, PasteRegionDef, withRegionAsync, withRegion } from "./regioncommands";
import { mapEditorState, MapEditorState } from "./mapeditorstate";
import { HideLayerDef, SelectLayerDef, ShowLayerDef } from "./layercommands";
import { BindKeyDef, ShowKeyBindingsDef } from "./keybindcommands";
import { addEditorShortcuts } from "../ui/mapeditor";
import { addCameraShortcuts } from "../ui/cameralayer";
import { SpawnCharacterDef } from "./charactercommands";
import { PoshFunction, printEditModeError, printHelp, printNoRegion, registerFunction } from "./poshregistry";
import { resourceLib } from "../graphics/resourceLib";
import { gameState } from "../world/igamestate";

export let fillRegionDef: FillRegionDef | undefined = undefined;
export let showKeyBindingsDef: ShowKeyBindingsDef | undefined = undefined;

export function populateMapEditCommands(repl: Repl, mapEditorState: MapEditorState) {
  fillRegionDef = new FillRegionDef(mapEditorState, repl);
  showKeyBindingsDef = new ShowKeyBindingsDef(mapEditorState);

  repl.addFunc(new GetRegionInfoDef(mapEditorState));
  repl.addFunc(fillRegionDef);
  repl.addFunc(new CopyRegionDef(mapEditorState));
  repl.addFunc(new PasteRegionDef(mapEditorState, repl));
  repl.addFunc(new CutRegionDef(mapEditorState));
  repl.addFunc(new SelectLayerDef(mapEditorState));
  repl.addFunc(new ShowLayerDef(mapEditorState));
  repl.addFunc(new HideLayerDef(mapEditorState));
  repl.addFunc(new BindKeyDef(mapEditorState));
  repl.addFunc(showKeyBindingsDef);

  repl.addFunc(new SpawnCharacterDef(mapEditorState));

  addEditorShortcuts(showKeyBindingsDef);
  addCameraShortcuts(showKeyBindingsDef);

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

export function addLocation(args: { id: string }) {
  withRegion((layer, region) => {
    layer.addLocation(args.id, region);
  });

  return undefined;
}

export function deleteLocation(args: { id: string }) {
  if (mapEditorState.currentLayer === undefined) {
    printEditModeError();
    return;
  }

  mapEditorState.currentLayer!.deleteLocation(args.id);

  return undefined;
}

export function registerMapCommands() {
  registerFunction('addLocation', ['id:string'], addLocation, 'Add location.');
  registerFunction('deleteLocation', ['id:string'], deleteLocation, 'Add location.');
}
