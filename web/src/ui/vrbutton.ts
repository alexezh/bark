import _ from "lodash";
import { Renderer } from "three";

export class VRButton {
  public element!: HTMLElement;
  private renderer: Renderer;
  private currentSession: XRSession | null = null;
  public xrSessionIsGranted: boolean = false;
  private sessionChanged: (xrSession: XRSession | undefined)=>void;

  public constructor(renderer: Renderer, sessionChanged: (xrSession: XRSession | undefined)=>void) {
    this.renderer = renderer;
    this.sessionChanged = sessionChanged;

    this.registerSessionGrantedListener();

    _.bindAll(this, ['onSessionEnded']);

    if ('xr' in navigator) {
      let button = document.createElement('button');

      button.id = 'VRButton';
      button.style.display = 'none';

      VRButton.stylizeElement(button);

      navigator.xr!.isSessionSupported('immersive-vr').then((supported) => {

        supported ? this.showEnterVR() : this.showWebXRNotFound();

        if (supported && this.xrSessionIsGranted) {
          button.click();
        }

      }).catch(this.showVRNotAllowed.bind(this));
      this.element = button;
    } else {

      const message = document.createElement('a');

      if (window.isSecureContext === false) {

        message.href = document.location.href.replace(/^http:/, 'https:');
        message.innerHTML = 'WEBXR NEEDS HTTPS'; // TODO Improve message

      } else {

        message.href = 'https://immersiveweb.dev/';
        message.innerHTML = 'WEBXR NOT AVAILABLE';

      }

      message.style.left = 'calc(50% - 90px)';
      message.style.width = '180px';
      message.style.textDecoration = 'none';
      VRButton.stylizeElement(message);
      this.element = message;
    }
}

  async onSessionStarted(session: XRSession) {

      session.addEventListener('end', this.onSessionEnded);

      // @ts-ignore
      await this.renderer.xr!.setSession(session);
      this.element.textContent = 'EXIT VR';

      this.currentSession = session;
      this.sessionChanged(session);
    }

    onSessionEnded( /*event*/) {
      this.currentSession!.removeEventListener('end', this.onSessionEnded);

      this.element.textContent = 'ENTER VR';

      this.currentSession = null;
      this.sessionChanged(undefined);
    }

    showEnterVR( /*device*/) {
      this.element.style.display = '';

      this.element.style.cursor = 'pointer';
      this.element.style.left = 'calc(50% - 50px)';
      this.element.style.width = '100px';

      this.element.textContent = 'ENTER VR';

      this.element.onmouseenter = () => {

        this.element.style.opacity = '1.0';

      };

      this.element.onmouseleave = () => {

        this.element.style.opacity = '0.5';

      };

      this.element.onclick = () => {

        if (this.currentSession === null) {

          // WebXR's requestReferenceSpace only works if the corresponding feature
          // was requested at session creation time. For simplicity, just ask for
          // the interesting ones as optional features, but be aware that the
          // requestReferenceSpace call will fail if it turns out to be unavailable.
          // ('local' is always available for immersive sessions and doesn't need to
          // be requested separately.)

          const sessionInit = { optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking', 'layers'] };
          // @ts-ignore
          navigator.xr.requestSession('immersive-vr', sessionInit).then(onSessionStarted);

        } else {
          // @ts-ignore
          currentSession.end();
        }
      };
    }

    disableButton() {

      this.element.style.display = '';

      this.element.style.cursor = 'auto';
      this.element.style.left = 'calc(50% - 75px)';
      this.element.style.width = '150px';

      this.element.onmouseenter = null;
      this.element.onmouseleave = null;

      this.element.onclick = null;
    }

    showWebXRNotFound() {

      this.disableButton();

      this.element.textContent = 'VR NOT SUPPORTED';

    }

    private showVRNotAllowed(exception) {

      this.disableButton();

      console.warn('Exception when trying to call xr.isSessionSupported', exception);

      this.element.textContent = 'VR NOT ALLOWED';

    }

    private static stylizeElement(element) {

      element.style.position = 'absolute';
      element.style.bottom = '20px';
      element.style.padding = '12px 6px';
      element.style.border = '1px solid #fff';
      element.style.borderRadius = '4px';
      element.style.background = 'rgba(0,0,0,0.1)';
      element.style.color = '#fff';
      element.style.font = 'normal 13px sans-serif';
      element.style.textAlign = 'center';
      element.style.opacity = '0.5';
      element.style.outline = 'none';
      element.style.zIndex = '999';

    }

  registerSessionGrantedListener() {

    if ('xr' in navigator) {

      // WebXRViewer (based on Firefox) has a bug where addEventListener
      // throws a silent exception and aborts execution entirely.
      if (/WebXRViewer\//i.test(navigator.userAgent)) return;

      navigator.xr!.addEventListener('sessiongranted', () => {
        this.xrSessionIsGranted = true;
      });
    }
  }
}


