import { Cache } from "@siteimprove/alfa-cache";
import { type Element, Node } from "@siteimprove/alfa-dom";
import { Sequence } from "@siteimprove/alfa-sequence";

import { Context } from "../../../context";

import { PseudoClassSelector } from "./pseudo-class";

const { State } = Context;

/**
 * {@link https://drafts.csswg.org/selectors/#hover-pseudo}
 */
export class Hover extends PseudoClassSelector<"hover"> {
  public static of(): Hover {
    return new Hover();
  }

  private constructor() {
    super("hover");
  }

  private static _cache = Cache.empty<Element, Cache<Context, boolean>>();

  public *[Symbol.iterator](): Iterator<Hover> {
    yield this;
  }

  public matches(
    element: Element,
    context: Context = Context.empty(),
  ): boolean {
    return Hover._cache.get(element, Cache.empty).get(context, () => {
      // We assume that most of the time the context is near empty and thus it
      // is inexpensive to check if something is in it.
      const hovered = Sequence.from<Node>(context.withState(State.Hover));

      return (
        hovered.size !== 0 &&
        element
          .inclusiveDescendants(Node.fullTree)
          .some((descendant) => hovered.includes(descendant))
      );
    });
  }
}
