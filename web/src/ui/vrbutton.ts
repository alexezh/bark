import { Renderer } from "three";

export class VRButton {
  private button: HTMLButtonElement;
  private renderer: Renderer;
  private currentSession: XRSession | null = null;

  static createButton(renderer: Renderer) {
    return new VRButton(renderer);
  }

  public constructor(renderer: Renderer) {
    this.button = document.createElement('button');
    this.renderer = renderer;

    _.bindAll(this, ['onSessionEnded']);

    if ('xr' in navigator) {

      button.id = 'VRButton';
      button.style.display = 'none';

      stylizeElement(button);

      navigator.xr.isSessionSupported('immersive-vr').then(function (supported) {

        supported ? showEnterVR() : showWebXRNotFound();

        if (supported && VRButton.xrSessionIsGranted) {

          button.click();

        }

      }).catch(showVRNotAllowed);

      return button;

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

      stylizeElement(message);

      return message;
    }

  async onSessionStarted(session: XRSession) {

      session.addEventListener('end', this.onSessionEnded);

      await this.renderer.xr.setSession(session);
      this.button.textContent = 'EXIT VR';

      this.currentSession = session;
    }

    onSessionEnded( /*event*/) {
      this.currentSession!.removeEventListener('end', this.onSessionEnded);

      this.button.textContent = 'ENTER VR';

      this.currentSession = null;
    }

    showEnterVR( /*device*/) {
      this.button.style.display = '';

      this.button.style.cursor = 'pointer';
      this.button.style.left = 'calc(50% - 50px)';
      this.button.style.width = '100px';

      this.button.textContent = 'ENTER VR';

      this.button.onmouseenter = () => {

        this.button.style.opacity = '1.0';

      };

      this.button.onmouseleave = () => {

        this.button.style.opacity = '0.5';

      };

      this.button.onclick = () => {

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

      this.button.style.display = '';

      this.button.style.cursor = 'auto';
      this.button.style.left = 'calc(50% - 75px)';
      this.button.style.width = '150px';

      this.button.onmouseenter = null;
      this.button.onmouseleave = null;

      this.button.onclick = null;
    }

    showWebXRNotFound() {

      this.disableButton();

      this.button.textContent = 'VR NOT SUPPORTED';

    }

    showVRNotAllowed(exception) {

      this.disableButton();

      console.warn('Exception when trying to call xr.isSessionSupported', exception);

      this.button.textContent = 'VR NOT ALLOWED';

    }

    stylizeElement(element) {

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

  static registerSessionGrantedListener() {

    if ('xr' in navigator) {

      // WebXRViewer (based on Firefox) has a bug where addEventListener
      // throws a silent exception and aborts execution entirely.
      if (/WebXRViewer\//i.test(navigator.userAgent)) return;

      navigator.xr.addEventListener('sessiongranted', () => {

        VRButton.xrSessionIsGranted = true;

      });

    }

  }

}

VRButton.xrSessionIsGranted = false;
VRButton.registerSessionGrantedListener();

