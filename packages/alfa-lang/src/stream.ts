import { Predicate } from "@siteimprove/alfa-util";

const { max, min } = Math;

export type StreamReader<T> = (index: number) => T;

export class Stream<T> {
  private readonly length: number;
  private readonly read: StreamReader<T>;
  private _position = 0;

  public constructor(length: number, reader: StreamReader<T>) {
    this.length = length;
    this.read = reader;
  }

  public done(): boolean {
    return this._position === this.length;
  }

  public position(): number {
    return this._position;
  }

  public peek(offset: number): T | null {
    const i = this._position + offset;

    if (i < 0 || i >= this.length) {
      return null;
    }

    return this.read(i);
  }

  public next(): T | null {
    const next = this.peek(0);
    this.advance(1);
    return next;
  }

  public restore(position: number): void {
    const difference = position - this._position;

    if (difference > 0) {
      this.advance(difference);
    }

    if (difference < 0) {
      this.backup(difference * -1);
    }
  }

  public advance(times: number): boolean {
    const position = min(this._position + times, this.length);
    const success = position - this._position !== 0;

    this._position = position;

    return success;
  }

  public backup(times: number): boolean {
    const position = max(this._position - times, 0);
    const success = position - this._position !== 0;

    this._position = position;

    return success;
  }

  public accept<U extends T>(
    predicate: Predicate<T, U>,
    result?: Array<U>
  ): boolean {
    const start = this._position;

    let next = this.peek(0);

    while (next !== null && predicate(next)) {
      if (result !== undefined) {
        result.push(next);
      }

      this.advance(1);
      next = this.peek(0);
    }

    return start !== this._position;
  }
}
