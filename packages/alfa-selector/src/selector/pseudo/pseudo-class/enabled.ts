import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Context } from "../../../context.js";
import { PseudoClassSelector } from "./pseudo-class.js";

const { hasName } = Element;
const { and, not, test } = Predicate;

/**
 * {@link https://drafts.csswg.org/selectors/#enableddisabled}
 * {@link https://html.spec.whatwg.org/multipage#selector-enabled}
 */
export class Enabled extends PseudoClassSelector<"enabled"> {
  public static of(): Enabled {
    return new Enabled();
  }

  protected constructor() {
    super("enabled");
  }

  public *[Symbol.iterator](): Iterator<Enabled> {
    yield this;
  }

  public matches(
    element: Element,
    context: Context = Context.empty(),
  ): boolean {
    return test(
      and(
        hasName(
          "button",
          "input",
          "select",
          "textarea",
          "optgroup",
          "option",
          "fieldset",
        ),
        not(Element.isActuallyDisabled),
      ),
      element,
    );
  }

  public toJSON(): Enabled.JSON {
    return super.toJSON();
  }
}

export namespace Enabled {
  export interface JSON extends PseudoClassSelector.JSON<"enabled"> {}

  export const parse = PseudoClassSelector.parseNonFunctional(
    "enabled",
    Enabled.of,
  );
}
