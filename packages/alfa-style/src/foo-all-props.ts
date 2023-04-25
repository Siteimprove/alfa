import Height from "./property/height";
import { Property } from "./property";

export namespace Foo {
  export type LongHands = typeof longHands;

  export type Name = keyof LongHands;

  export type Specified<N extends Name> = LongHands[N] extends Property<
    infer S,
    unknown
  >
    ? S
    : never;

  export const longHands = {
    height: Height,
  } as const;
}
