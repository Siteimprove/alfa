import { PseudoClassSelector } from "./pseudo-class";

/**
 * {@link https://drafts.csswg.org/css-scoping-1/#selectordef-host}
 */
export class Host extends PseudoClassSelector<"host"> {
  public static of(): Host {
    return new Host();
  }

  private constructor() {
    super("host");
  }

  public *[Symbol.iterator](): Iterator<Host> {
    yield this;
  }
}
