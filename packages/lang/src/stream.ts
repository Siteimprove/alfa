import { isNewline } from "@alfa/util";
import { Token, Location } from "./types";

export type Predicate<T, U extends T> =
  | ((n: T) => boolean)
  | ((n: T) => n is U);

export type StreamItems<T> = T extends string ? string : Array<T>;

export abstract class Stream<T> {
  protected _input: StreamItems<T>;

  protected _position: number = 0;
  protected _start: number = 0;
  protected _line: number = 0;
  protected _column: number = 0;

  abstract range(start: number, end: number): StreamItems<T>;

  public constructor(input: StreamItems<T>) {
    this._input = input;
  }

  public location(): Location {
    return { line: this._line, column: this._column };
  }

  public peek(offset: number = 0): T | null {
    const position = this._position + offset;

    if (position < this._input.length) {
      return this._input[position] as T;
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

  public result(): StreamItems<T> {
    return this.range(this._start, this._position);
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

  public advance(times: number = 1, callback: () => void = () => {}): boolean {
    let advanced = false;

    do {
      if (this._position < this._input.length) {
        callback();
        advanced = true;
        this._position++;
      }
    } while (--times > 0);

    return advanced;
  }

  public backup(times: number = 1, callback: () => void = () => {}): boolean {
    let backedup = false;

    do {
      if (this._position > 0) {
        backedup = true;
        this._position--;
        callback();
      }
    } while (--times > 0);

    return backedup;
  }

  public accept<U extends T>(predicate: Predicate<T, U>, times: 1): U | false;

  public accept<U extends T>(
    predicate: Predicate<T, U>,
    times?: number
  ): StreamItems<U> | false;

  public accept<U extends T>(
    predicate: Predicate<T, U>,
    times?: number
  ): U | StreamItems<U> | false {
    let accepted = false;
    let next = this.peek();
    let start = this._position;

    const single = times === 1;

    while (
      next !== null &&
      predicate(next) &&
      (times === undefined || times-- > 0)
    ) {
      accepted = times === undefined || times === 0;

      if (!this.advance()) {
        break;
      }

      next = this.peek();
    }

    if (accepted === false) {
      return false;
    }

    const range = this.range(start, this._position);

    return single ? (range[0] as U) : (range as StreamItems<U>);
  }
}

/**
 * @internal
 */
export class CharacterStream extends Stream<string> {
  public constructor(input: string) {
    super(input);
  }

  public range(start: number, end: number): StreamItems<string> {
    return this._input.substring(start, end);
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
export class TokenStream<T extends Token> extends Stream<T> {
  public constructor(input: Array<T>) {
    super(input as StreamItems<T>);
  }

  public range(start: number, end: number): StreamItems<T> {
    return this._input.slice(start, end) as StreamItems<T>;
  }
}
