import _ from "lodash";
import { Camera, Raycaster, Scene } from "three";

export class MapEditor {
  private container: HTMLElement;
  private camera: Camera;
  private scene: Scene;
  private isDown: boolean = false;

  public constructor(container: HTMLElement, scene: Scene, camera: Camera) {
    this.container = container;
    this.camera = camera;
    this.scene = scene;

    _.bindAll(this, [
      'onMouseDown',
      'onMouseUp',
      'onMouseMove'
    ])

    this.container.addEventListener('mousedown', this.onMouseDown, false);
    this.container.addEventListener('mouseup', this.onMouseUp, false);
    this.container.addEventListener('mousemove', this.onMouseMove, false);
  }

  onMouseDown(evt: MouseEvent) {
    let coords = {
      x: (evt.clientX / window.innerWidth) * 2 - 1,
      y: -(evt.clientY / window.innerHeight) * 2 + 1
    }

    let raycaster = new Raycaster();
    raycaster.setFromCamera(coords, this.camera);

    var intersects = raycaster.intersectObjects(this.scene.children, false);

    if (intersects.length > 0) {
      var object = intersects[0].object;
      // @ts-ignore
      object.material.color.set(Math.random() * 0xffffff);
      //this.selected = object;
      //object.geometry.setAttribute('color', Math.random() * 0xffffff);
    }
  };

  onMouseUp(evt: MouseEvent) {
    this.isDown = false;
    /*
    let coords = {
        x: (evt.clientX / window.innerWidth) * 2 - 1,
        y: -(evt.clientY / window.innerHeight) * 2 + 1
    }

    let raycaster = new Raycaster();
    raycaster.setFromCamera(coords, this.camera);

    var intersects = raycaster.intersectObjects(this.scene.children, false);

    if (intersects.length > 0) {
        var object = intersects[0].object;
        // @ts-ignore
        object.material.color.set(Math.random() * 0xffffff);
        this.selected = object;
        //object.geometry.setAttribute('color', Math.random() * 0xffffff);
    }
    */
  };

  onMouseMove(evt: MouseEvent) {
    if (this.isDown === false) {
      return;
    }

    return;
    /*
            if (this.selected === undefined) {
                return;
            }
    
            let coords = {
                x: (evt.clientX / window.innerWidth) * 2 - 1,
                y: -(evt.clientY / window.innerHeight) * 2 + 1
            }
    
            let raycaster = new Raycaster();
            raycaster.setFromCamera(coords, this.camera);
    
            var intersects = raycaster.intersectObjects(this.scene.children, false);
    
            if (intersects.length > 0) {
                let intersect = intersects[0];
    
                this.selected.position.copy(intersect.point).add(intersect!.face!.normal);
                this.selected.position.divideScalar(16).floor().multiplyScalar(16).addScalar(8);
                //object.geometry.setAttribute('color', Math.random() * 0xffffff);
            }
           */
  };

}