export namespace Baz {
  export type Shorthands = typeof SomethingElse.shortHands;

  export type Name = keyof Shorthands;
}

export namespace SomethingElse {
  export const shortHands = {} as const;

  export function isName(name: string): name is Baz.Name {
    return name in shortHands;
  }

  export function get<N extends Baz.Name>(name: N): Baz.Shorthands[N] {
    return shortHands[name];
  }
}
