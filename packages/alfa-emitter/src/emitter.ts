import { Callback } from "@siteimprove/alfa-callback";
import { Continuation } from "@siteimprove/alfa-continuation";
import { Functor } from "@siteimprove/alfa-functor";
import { Mapper } from "@siteimprove/alfa-mapper";

/**
 * @public
 */
export class Emitter<T> implements Functor.Invariant<T>, AsyncIterable<T> {
  public static of<T = void>(): Emitter<T> {
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

  public on(listener: Callback<T>): this {
    this._listeners.set(listener, listener);
    return this;
  }

  public once(): Promise<T>;

  public once(listener: Callback<T>): this;

  public once(listener?: Callback<T>): this | Promise<T> {
    const once: Continuation<T> = (done) => {
      const listener: Callback<T> = (event) => {
        this._listeners.delete(done);
        done(event);
      };

      this._listeners.set(done, listener);
    };

    if (listener) {
      once(listener);
      return this;
    } else {
      return new Promise(once);
    }
  }

  public off(listener: Callback<never>): this {
    this._listeners.delete(listener);
    return this;
  }

  public emit(event: T): boolean {
    const empty = this._listeners.size === 0;

    for (const [, listener] of this._listeners) {
      listener(event);
    }

    return !empty;
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
