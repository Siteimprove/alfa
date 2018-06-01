import { Token, Pattern } from "./types";
import { Stream } from "./stream";

export class Alphabet<T extends Token, S = null> {
  private readonly _pattern: Pattern<T, S>;
  private readonly _state: (stream: Stream<number>) => S;

  public get pattern(): Pattern<T, S> {
    return this._pattern;
  }

  public constructor(
    pattern: Pattern<T, S>,
    state: (stream: Stream<number>) => S
  ) {
    this._pattern = pattern;
    this._state = state;
  }

  public state(stream: Stream<number>): S {
    return this._state(stream);
  }
}
