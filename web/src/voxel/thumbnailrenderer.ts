import { Mesh, Object3D, PCFSoftShadowMap, PerspectiveCamera, Scene, Vector3, WebGLRenderer, WebGLRenderTarget } from "three";
import * as pngStream from 'three-png-stream';
import { bytesToBase64 } from "../posh/base64";

export class ThumbnailRenderer {
  private renderer!: WebGLRenderer;
  private camera!: PerspectiveCamera;
  private scene!: Scene;
  private width: number;
  private height: number;

  public visible_distance = 500; // from player to hide chunks + enemies.

  public constructor(width: number, height: number) {
    this.scene = new Scene();
    this.width = width;
    this.height = height;

    // Iosmetric view
    Object3D.DefaultUp = new Vector3(0, 0, 1);

    this.camera = new PerspectiveCamera(35, width / height, 1, this.visible_distance);
    this.camera.up.set(0, 0, 1);
    this.camera.position.set(0, 0, 100);

    this.renderer = new WebGLRenderer({ antialias: false, preserveDrawingBuffer: false });
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    //this.element.appendChild(this.renderer.domElement);
  };

  public render(target: Mesh): string {
    var point = new Vector3(0, 0, 0);
    this.camera.lookAt(point);
    let angleY = Math.PI / 4;
    this.camera.lookAt(new Vector3(0, 0, 0));

    // (re)Position the camera See
    // http://stackoverflow.com/questions/14614252/how-to-fit-camera-to-object
    const fov = this.camera.fov * (Math.PI / 180);
    target.geometry.computeBoundingSphere();
    const distance = Math.abs(target.geometry.boundingSphere!.radius / Math.sin(fov / 2));
    const newPosition = this.camera
      .position
      .clone()
      .normalize()
      .multiplyScalar(distance);
    this.camera
      .position
      .set(newPosition.x, newPosition.y, newPosition.z);
    this.camera.updateProjectionMatrix();

    const renderTarget = new WebGLRenderTarget(this.width, this.height);
    this.renderer.setRenderTarget(renderTarget);
    this.renderer.render(this.scene, this.camera);
    const b = pngStream(this.renderer, target).toBytes();
    return bytesToBase64(b);
  }
}