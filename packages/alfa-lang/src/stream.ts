import { Predicate } from "@siteimprove/alfa-util";

export class Stream<T> {
  protected input: ArrayLike<T>;
  protected position: number = 0;
  protected start: number = 0;

  public constructor(input: ArrayLike<T>) {
    this.input = input;
  }

  public peek(offset: number = 0): T | null {
    const position = this.position + offset;

    if (position >= this.input.length) {
      return null;
    }

    return this.input[position];
  }

  public next(): T | null {
    const next = this.peek();
    this.advance();
    return next;
  }

  public ignore(): void {
    this.start = this.position;
  }

  public range(start: number, end: number): Array<T> {
    const result: Array<T> = new Array(end - start);

    for (let i = start, j = 0; i < end; i++, j++) {
      result[j] = this.input[i];
    }

    return result;
  }

  public result(): Array<T> {
    return this.range(this.start, this.position);
  }

  public progressed(): boolean {
    return this.start !== this.position;
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

  public advance(times: number = 1): boolean {
    let advanced = false;

    do {
      if (this.position < this.input.length) {
        advanced = true;
        this.position++;
      }
    } while (--times > 0);

    return advanced;
  }

  public backup(times: number = 1): boolean {
    let backedup = false;

    do {
      if (this.position > 0) {
        backedup = true;
        this.position--;
      }
    } while (--times > 0);

    return backedup;
  }

  public accept<U extends T>(predicate: Predicate<T, U>): Array<U> | false;

  public accept<U extends T>(predicate: Predicate<T, U>, times: 1): U | false;

  public accept<U extends T>(
    predicate: Predicate<T, U>,
    times: number
  ): Array<U> | false;

  public accept<U extends T>(
    predicate: Predicate<T, U>,
    minimum: number,
    maximum: number
  ): Array<U> | false;

  public accept<U extends T>(
    predicate: Predicate<T, U>,
    minimum?: number,
    maximum?: number
  ): U | Array<U> | false {
    if (minimum === undefined) {
      minimum = 0;
      maximum = Infinity;
    }

    if (maximum === undefined) {
      maximum = minimum;
    }

    let next = this.peek();

    if (minimum === 1 && maximum === 1) {
      if (next !== null && predicate(next)) {
        this.advance();
        return next;
      }

      return false;
    }

    let accepted = 0;
    let start = this.position;

    while (next !== null && predicate(next)) {
      accepted++;

      if (accepted === maximum || !this.advance()) {
        break;
      }

      next = this.peek();
    }

    if (accepted < minimum) {
      this.restore(start);
      return false;
    }

    return this.range(start, this.position) as Array<U>;
  }
}
