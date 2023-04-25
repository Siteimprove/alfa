export namespace Shorthands {
  type Property = typeof shortHands;

  export type Name = keyof Property;
  export const shortHands = {} as const;

  export function isName(name: string): name is Name {
    return name in shortHands;
  }

  export function get<N extends Name>(name: N): Property[N] {
    return shortHands[name];
  }
}
