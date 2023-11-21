import { PseudoElementSelector } from "./pseudo-element";

/**
 * {@link https://drafts.csswg.org/css-pseudo-4/#marker-pseudo}
 */
export class Marker extends PseudoElementSelector<"marker"> {
  public static of(): Marker {
    return new Marker();
  }

  private constructor() {
    super("marker");
  }

  public *[Symbol.iterator](): Iterator<Marker> {
    yield this;
  }
}
