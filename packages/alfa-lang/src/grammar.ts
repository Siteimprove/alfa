import { Token, Production } from "./types";

const { isArray } = Array;

export class Grammar<T extends Token, R> {
  private _entries: Map<
    T["type"],
    { production: Production<T, R>; precedence: number }
  > = new Map();

  public constructor(
    productions: Array<Production<T, R> | Array<Production<T, R>>>
  ) {
    for (let i = 0; i < productions.length; i++) {
      const precedence = productions.length - i;
      const group = productions[i];

      for (const production of isArray(group) ? group : [group]) {
        const { token } = production;

        this._entries.set(token, { production, precedence });
      }
    }
  }

  public get(
    token: T
  ): { production: Production<T, R>; precedence: number } | null {
    const entry = this._entries.get(token.type);

    if (entry === undefined) {
      return null;
    }

    return entry;
  }
}
