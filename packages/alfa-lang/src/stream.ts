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
    const position = min(this.position + times, this.input.length);
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

  public accept<U extends T>(predicate: Predicate<T, U>): Array<U> | false {
    const result: Array<U> = [];

    let next = this.peek(0);

    while (next !== null && predicate(next)) {
      result.push(next);
      this.advance(1);
      next = this.peek(0);
    }

    if (result.length === 0) {
      return false;
    }

    return result;
  }
}
