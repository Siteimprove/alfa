import { Token, Pattern } from "./types";
import { Stream } from "./stream";

export class Alphabet<T extends Token, S = any> {
  private readonly _pattern: Pattern<T, S>;
  private readonly _state: (stream: Stream<string>) => S;

  public get pattern(): Pattern<T, S> {
    return this._pattern;
  }

  public constructor(
    pattern: Pattern<T, S>,
    state: (stream: Stream<string>) => S
  ) {
    this._pattern = pattern;
    this._state = state;
  }

  public state(stream: Stream<string>): S {
    return this._state(stream);
  }
}
