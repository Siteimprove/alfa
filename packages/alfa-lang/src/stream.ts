import { Predicate } from "@siteimprove/alfa-util";

const { max, min } = Math;

export type StreamReader<T> = (index: number) => T;

export class Stream<T> {
  private readonly length: number;

  private readonly read: StreamReader<T>;

  public position: number = 0;

  public constructor(length: number, reader: StreamReader<T>) {
    this.length = length;
    this.read = reader;
  }

  public peek(offset: number): T | null {
    const i = this.position + offset;

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

  public range(start: number, end: number): Array<T> {
    const result: Array<T> = new Array(end - start);

    for (let i = start, j = 0; i < end; i++, j++) {
      result[j] = this.read(i);
    }

    return result;
  }

  public reduce<U>(
    start: number,
    end: number,
    reducer: (accumulator: U, next: T) => U,
    initial: U
  ): U {
    let result = initial;

    for (let i = start; i < end; i++) {
      result = reducer(result, this.read(i));
    }

    return result;
  }

  public restore(position: number): void {
    const difference = position - this.position;

    if (difference > 0) {
      this.advance(difference);
    }

    if (difference < 0) {
      this.backup(difference * -1);
    }
  }

  public advance(times: number): boolean {
    const position = min(this.position + times, this.length);
    const success = position - this.position !== 0;

    this.position = position;

    return success;
  }

  public backup(times: number): boolean {
    const position = max(this.position - times, 0);
    const success = position - this.position !== 0;

    this.position = position;

    return success;
  }

  public accept<U extends T>(
    predicate: Predicate<T, U>,
    result?: Array<U>
  ): boolean {
    const start = this.position;

    let next = this.peek(0);

    while (next !== null && predicate(next)) {
      if (result !== undefined) {
        result.push(next);
      }

      this.advance(1);
      next = this.peek(0);
    }

    return start !== this.position;
  }
}
