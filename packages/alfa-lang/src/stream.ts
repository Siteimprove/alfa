import { clamp } from "@siteimprove/alfa-math";
import { Predicate } from "@siteimprove/alfa-predicate";

const { max, min } = Math;

export type StreamReader<T> = (index: number) => T;

export class Stream<T> {
  private readonly length: number;
  private readonly read: StreamReader<T>;
  private offset: number;

  public constructor(length: number, reader: StreamReader<T>, offset = 0) {
    this.length = length;
    this.read = reader;
    this.offset = clamp(offset, 0, length - 1);
  }

  public done(): boolean {
    return this.offset === this.length;
  }

  public position(): number {
    return this.offset;
  }

  public peek(offset: number): T | null {
    const i = this.offset + offset;

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
    const difference = position - this.offset;

    if (difference > 0) {
      this.advance(difference);
    }

    if (difference < 0) {
      this.backup(difference * -1);
    }
  }

  public advance(times: number): boolean {
    const position = min(this.offset + times, this.length);
    const success = position - this.offset !== 0;

    this.offset = position;

    return success;
  }

  public backup(times: number): boolean {
    const position = max(this.offset - times, 0);
    const success = position - this.offset !== 0;

    this.offset = position;

    return success;
  }

  public accept<U extends T>(
    predicate: Predicate<T, U>,
    result?: Array<U>
  ): boolean {
    const start = this.offset;

    let next = this.peek(0);

    while (next !== null && predicate(next)) {
      if (result !== undefined) {
        result.push(next);
      }

      this.advance(1);
      next = this.peek(0);
    }

    return start !== this.offset;
  }
}
