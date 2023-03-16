export class FrameClock {
  private _lastTick: number = 0;
  private _delta: number = 0;
  private _running: boolean = false;

  public get delta() { return this._delta; }
  public get lastTick() { return this._lastTick; }

  start() {
    this._lastTick = now() / 1000;
    this._delta = 0;
    this._running = true;
  }

  tick() {
    let t = now() / 1000;
    this._delta = t - this._lastTick;
    this._lastTick = t;
  }
}

function now() {

  return (typeof performance === 'undefined' ? Date : performance).now(); // see #10732

}