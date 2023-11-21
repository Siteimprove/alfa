import { Cache } from "@siteimprove/alfa-cache";
import { type Element, Node } from "@siteimprove/alfa-dom";
import { Sequence } from "@siteimprove/alfa-sequence";

import { Context } from "../../../context";

import { PseudoClassSelector } from "./pseudo-class";

const { State } = Context;

/**
 * {@link https://drafts.csswg.org/selectors/#focus-within-pseudo}
 */
export class FocusWithin extends PseudoClassSelector<"focus-within"> {
  public static of(): FocusWithin {
    return new FocusWithin();
  }

  private constructor() {
    super("focus-within");
  }

  private static _cache = Cache.empty<Element, Cache<Context, boolean>>();

  public *[Symbol.iterator](): Iterator<FocusWithin> {
    yield this;
  }

  public matches(
    element: Element,
    context: Context = Context.empty(),
  ): boolean {
    return FocusWithin._cache.get(element, Cache.empty).get(context, () => {
      // We assume that most of the time the context is near empty and thus it
      // is inexpensive to check if something is in it.
      const focused = Sequence.from<Node>(context.withState(State.Focus));

      return (
        focused.size !== 0 &&
        element
          .inclusiveDescendants(Node.fullTree)
          .some((descendant) => focused.includes(descendant))
      );
    });
  }

  public toJSON(): FocusWithin.JSON {
    return super.toJSON();
  }
}

export namespace FocusWithin {
  export interface JSON extends PseudoClassSelector.JSON<"focus-within"> {}

  export const parse = PseudoClassSelector.parseNonFunctional(
    "focus-within",
    FocusWithin.of,
  );
}
