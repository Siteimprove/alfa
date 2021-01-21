import { Callback } from "@siteimprove/alfa-callback";
import { Continuation } from "@siteimprove/alfa-continuation";
import { Functor } from "@siteimprove/alfa-functor";
import { Mapper } from "@siteimprove/alfa-mapper";

export class Emitter<T> implements Functor.Invariant<T>, AsyncIterable<T> {
  public static of<T>(): Emitter<T> {
    return new Emitter(new Map());
  }

  /**
   * @remarks
   * Listeners are stored in a map keyed by the original listener. This ensures
   * that listeners can be deregistered even in derived emitters, such as those
   * created by `#contraMap()`.
   */
  private readonly _listeners: Map<Callback<never>, Callback<T>>;

  private constructor(listeners: Map<Callback<never>, Callback<T>>) {
    this._listeners = listeners;
  }

  public contraMap<U>(mapper: Mapper<U, T>): Emitter<U> {
    return new Emitter(
      new Map(
        [...this._listeners].map(([key, listener]) => [
          key,
          Callback.contraMap(listener, mapper),
        ])
      )
    );
  }

  public on(listener: Callback<T>): void {
    this._listeners.set(listener, listener);
  }

  public once(): Promise<T>;

  public once(listener: Callback<T>): void;

  public once(listener?: Callback<T>): void | Promise<T> {
    const once: Continuation<T> = (done) => {
      const listener: Callback<T> = (event) => {
        this.off(listener);
        done(event);
      };

      this.on(listener);
    };

    return listener ? once(listener) : new Promise(once);
  }

  public off(listener: Callback<never>): void {
    this._listeners.delete(listener);
  }

  public emit(event: T): void {
    for (const [, listener] of this._listeners) {
      listener(event);
    }
  }

  public async *asyncIterator(): AsyncIterator<T> {
    while (true) {
      yield await this.once();
    }
  }

  public [Symbol.asyncIterator](): AsyncIterator<T> {
    return this.asyncIterator();
  }
}
