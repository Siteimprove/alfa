import { Token, Production } from "./types";

const { isArray } = Array;

export type GrammarEntry<T extends Token, R> = Readonly<{
  production: Production<T, R>;
  precedence: number;
}>;

export class Grammar<T extends Token, R> {
  private entries: Map<string, GrammarEntry<T, R>> = new Map();

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

  public get(token: Token): GrammarEntry<T, R> | null {
    return (
      this.entries.get(typeof token === "string" ? token : token.type) || null
    );
  }
}
