import { Pattern, Token } from "./types";

export class Alphabet<T extends Token, S = null> {
  public readonly pattern: Pattern<T, S>;
  public readonly state: () => S;

  public constructor(pattern: Pattern<T, S>, state: () => S) {
    this.pattern = pattern;
    this.state = state;
  }
}
