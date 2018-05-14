import { Predicate, isNewline } from "@alfa/util";
import { Token, Location } from "./types";

const { isArray } = Array;

export class Stream<T> {
  protected _input: Array<T>;
  protected _position: number = 0;
  protected _start: number = 0;
  protected _line: number = 0;
  protected _column: number = 0;

  public constructor(input: Array<T>) {
    this._input = input;
  }

  public location(): Location {
    return { line: this._line, column: this._column };
  }

  public peek(offset: number = 0): T | null {
    const position = this._position + offset;

    if (position < this._input.length) {
      return this._input[position];
    }

    return null;
  }

  public next(): T | null {
    const next = this.peek();
    this.advance();
    return next;
  }

  public ignore(): void {
    this._start = this._position;
  }

  public range(start: number, end: number): Array<T> {
    return this._input.slice(start, end);
  }

  public result(): Array<T> {
    return this._input.slice(this._start, this._position);
  }

  public progressed(): boolean {
    return this._start !== this._position;
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

  public advance(times: number = 1, callback?: () => void): boolean {
    let advanced = false;

    do {
      if (this._position < this._input.length) {
        advanced = true;
        this._position++;
        callback && callback();
      }
    } while (--times > 0);

    return advanced;
  }

  public backup(times: number = 1, callback?: () => void): boolean {
    let backedup = false;

    do {
      if (this._position > 0) {
        backedup = true;
        this._position--;
        callback && callback();
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
    let start = this._position;

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

    return this.range(start, this._position) as Array<U>;
  }
}

/**
 * @internal
 */
export class CharacterStream extends Stream<string> {
  public constructor(input: string) {
    super(input.split(""));
  }

  public advance(times?: number): boolean {
    return super.advance(times, () => {
      const next = this.peek();

      if (next !== null && isNewline(next)) {
        this._line++;
        this._column = 0;
      } else {
        this._column++;
      }
    });
  }

  public backup(times?: number): boolean {
    return super.backup(times, () => {
      const prev = this.peek();

      if (prev !== null && isNewline(prev)) {
        this._line--;
        this._column = 0;
      } else {
        this._column--;
      }
    });
  }
}

/**
 * @internal
 */
export class TokenStream<T extends Token> extends Stream<T> {}
