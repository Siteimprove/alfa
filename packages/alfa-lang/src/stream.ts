import { Predicate } from "@siteimprove/alfa-util";

const { max, min } = Math;

export type StreamReader<T> = (index: number) => T;

export class Stream<T> {
  private readonly length: number;
  private readonly read: StreamReader<T>;
  private position: number = 0;

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
