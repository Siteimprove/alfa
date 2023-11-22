import { PseudoElementSelector } from "./pseudo-element";

/**
 * {@link https://drafts.csswg.org/css-pseudo-4/#placeholder-pseudo}
 */
export class Placeholder extends PseudoElementSelector<"placeholder"> {
  public static of(): Placeholder {
    return new Placeholder();
  }

  private constructor() {
    super("placeholder");
  }

  /** @public (knip) */
  public *[Symbol.iterator](): Iterator<Placeholder> {
    yield this;
  }
}

export namespace Placeholder {
  export const parse = PseudoElementSelector.parseNonLegacy(
    "placeholder",
    Placeholder.of,
  );
}
