import { Predicate } from "@siteimprove/alfa-util";

const { max, min } = Math;

export class Stream<T> {
  private input: ArrayLike<T>;

  public position: number = 0;

  public constructor(input: ArrayLike<T>) {
    this.input = input;
  }

  public peek(offset: number): T | null {
    const position = this.position + offset;

    if (position < 0 || position >= this.input.length) {
      return null;
    }

    return this.input[position];
  }

  public next(): T | null {
    const next = this.peek(0);
    this.advance(1);
    return next;
  }

  public range(start: number, end: number): Array<T> {
    const result: Array<T> = new Array(end - start);

    for (let i = start, j = 0; i < end; i++, j++) {
      result[j] = this.input[i];
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
      result = reducer(result, this.input[i]);
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
    const position = min(this.position + max(times, 1), this.input.length);

    if (position === this.position) {
      return false;
    }

    this.position = position;

    return true;
  }

  public backup(times: number): boolean {
    const position = max(this.position - max(times, 1), 0);

    if (position === this.position) {
      return false;
    }

    this.position = position;

    return true;
  }

  public accept<U extends T>(predicate: Predicate<T, U>): Array<U> | false {
    let next = this.peek(0);
    let start = this.position;

    while (next !== null && predicate(next)) {
      if (this.advance(1)) {
        next = this.peek(0);
      } else {
        break;
      }
    }

    if (start === this.position) {
      return false;
    }

    return this.range(start, this.position) as Array<U>;
  }
}
