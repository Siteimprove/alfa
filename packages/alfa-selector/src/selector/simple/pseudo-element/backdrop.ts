import { PseudoElementSelector } from "./pseudo-element";

/**
 * {@link https://fullscreen.spec.whatwg.org/#::backdrop-pseudo-element}
 */
export class Backdrop extends PseudoElementSelector<"backdrop"> {
  public static of(): Backdrop {
    return new Backdrop();
  }

  private constructor() {
    super("backdrop");
  }

  public *[Symbol.iterator](): Iterator<Backdrop> {
    yield this;
  }
}
