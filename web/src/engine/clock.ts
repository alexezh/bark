export class FrameClock {
  private _lastTick: number = 0;
  private _delta: number = 0;
  private _running: boolean = false;

  /**
   * delta from the last tick
   * vm calls tick before every update
   */
  public get delta() { return this._delta; }
  public get lastTick() { return this._lastTick; }

  start() {
    this._lastTick = now() / 1000;
    this._delta = 0;
    this._running = true;
  }

  stop() {
    this._running = false;
  }

  tick() {
    if (!this._running) {
      return 0;
    }
    let t = now() / 1000;
    this._delta = t - this._lastTick;
    this._lastTick = t;
  }
}

function now() {
  return (typeof performance === 'undefined' ? Date : performance).now(); // see #10732
}