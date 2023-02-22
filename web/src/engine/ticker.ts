import _ from "lodash";

export class Ticker {
    private inTick: boolean = false;
    private static tickerSymbol: Symbol = Symbol('ticker owner');
    private handlers: (() => void)[] = [];
    private updates: (() => void)[] = [];

    public tick() {
        this.inTick = true;
        for(let t of this.handlers) {
            t();
        }
        this.inTick = false;
        this.applyUpdates();
    }

    public add(target: any, func: () => void) {
        this.updates.push(() => {
            // @ts-ignore
            target[Ticker.tickerSymbol] = func;
        });
        this.applyUpdates();
    }

    public remove(target: any) {
        this.updates.push(() => {
            // @ts-ignore
            let func = target[Ticker.tickerSymbol];
            _.remove(this.handlers, (x) => x === func);
        });
        this.applyUpdates();
    }

    private applyUpdates() {
        if(this.updates.length === 0 || this.inTick) {
            return;
        }

        for(let u of this.updates) {
            u();
        }
        this.updates = [];
    }
}