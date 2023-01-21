export class QueueTTT<T> {
  private items: T[] = []

  public push(x: T) {
    this.items.push(x);
  }

  public pop(): T {
    let x = this.items.shift();
    if (x === undefined) {
      throw "queue is empty";
    }
    return x;
  }

  public isEmpty(): boolean {
    return this.items.length == 0;
  }
}
