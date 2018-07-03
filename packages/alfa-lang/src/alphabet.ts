import { Stream } from "./stream";
import { Pattern, Token } from "./types";

export class Alphabet<T extends Token, S = null> {
  public readonly pattern: Pattern<T, S>;
  public readonly state: (stream: Stream<number>) => S;

  public constructor(
    pattern: Pattern<T, S>,
    state: (stream: Stream<number>) => S
  ) {
    this.pattern = pattern;
    this.state = state;
  }
}
