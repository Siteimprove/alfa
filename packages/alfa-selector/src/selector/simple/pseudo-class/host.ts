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

  public toJSON(): Host.JSON {
    return super.toJSON();
  }
}

export namespace Host {
  export interface JSON extends PseudoClassSelector.JSON<"host"> {}

  export const parse = PseudoClassSelector.parseNonFunctional("host", Host.of);
}
