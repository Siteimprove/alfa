import { Production, Token, TokenIdentifier } from "./types";

const { isArray } = Array;

/**
 * @internal
 */
export type GrammarEntry<T extends Token, R, S = null> = Readonly<{
  production: Production<T, R, T, R, S>;
  precedence: number;
}>;

export class Grammar<T extends Token, R, S = null> {
  /**
   * @internal
   */
  private readonly entries: Map<
    TokenIdentifier<T>,
    GrammarEntry<T, R, S>
  > = new Map();

  /**
   * @internal
   */
  public readonly state: () => S;

  public constructor(
    productions: Array<
      Production<T, R, T, R, S> | Array<Production<T, R, T, R, S>>
    >,
    state: () => S
  ) {
    this.state = state;

    for (let i = 0; i < productions.length; i++) {
      const precedence = productions.length - i;
      const group = productions[i];

      for (const production of isArray(group) ? group : [group]) {
        this.entries.set(production.token, { production, precedence });
      }
    }
  }

  /**
   * @internal
   */
  public get(type: TokenIdentifier<T>): GrammarEntry<T, R, S> | null {
    const entry = this.entries.get(type);

    if (entry === undefined) {
      return null;
    }

    return entry;
  }
}
