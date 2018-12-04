import { Pattern, Token } from "./types";

export class Alphabet<T extends Token, S = null> {
  /**
   * The initial pattern used by the alphabet. This is the first pattern that is
   * invoked on a stream of tokens upon lexing.
   *
   * @internal
   */
  public readonly pattern: Pattern<T, S>;

  /**
   * The state getter of the alphabet. This function is invoked to construct the
   * initial state of the alphabet upon lexing.
   *
   * @internal
   */
  public readonly state: () => S;

  public constructor(pattern: Pattern<T, S>, state: () => S) {
    this.pattern = pattern;
    this.state = state;
  }
}
