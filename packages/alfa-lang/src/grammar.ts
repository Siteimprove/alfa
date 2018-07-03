import { Production, Token, TokenIdentifier } from "./types";

const { isArray } = Array;

export type GrammarEntry<T extends Token, R> = Readonly<{
  production: Production<T, R>;
  precedence: number;
}>;

export class Grammar<T extends Token, R> {
  private readonly entries: Map<
    TokenIdentifier<T>,
    GrammarEntry<T, R>
  > = new Map();

  public constructor(
    productions: Array<Production<T, R> | Array<Production<T, R>>>
  ) {
    for (let i = 0; i < productions.length; i++) {
      const precedence = productions.length - i;
      const group = productions[i];

      for (const production of isArray(group) ? group : [group]) {
        this.entries.set(production.token, { production, precedence });
      }
    }
  }

  public get(type: TokenIdentifier<T>): GrammarEntry<T, R> | null {
    const entry = this.entries.get(type);

    if (entry === undefined) {
      return null;
    }

    return entry;
  }
}
