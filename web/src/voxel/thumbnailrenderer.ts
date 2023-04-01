import { AmbientLight, Mesh, Object3D, PCFSoftShadowMap, PerspectiveCamera, Scene, Vector3, WebGLRenderer, WebGLRenderTarget } from "three";

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
    //Object3D.DefaultUp = new Vector3(0, 0, 1);

    this.camera = new PerspectiveCamera(35, width / height, 1, this.visible_distance);
    //this.camera.up.set(0, 0, 1);

    this.renderer = new WebGLRenderer({ antialias: false, preserveDrawingBuffer: false });
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    //this.element.appendChild(this.renderer.domElement);
  };

  public render(target: Mesh): ImageData {
    this.camera.position.set(200, 0, 100);
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

    this.scene.add(target);
    let ambient_light = new AmbientLight(0xFFFFFF, 0.8);
    this.scene.add(ambient_light);

    const renderTarget = new WebGLRenderTarget(this.width, this.height);
    this.renderer.setRenderTarget(renderTarget);
    this.renderer.render(this.scene, this.camera);


    let pixels = new Uint8ClampedArray(this.width * this.height * 4);
    this.renderer.readRenderTargetPixels(renderTarget, 0, 0, this.width, this.height, pixels);

    return new ImageData(pixels, this.width, this.height);
  }
}