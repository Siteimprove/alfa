import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Page } from "@siteimprove/alfa-web";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";

import { expectation } from "../common/expectation";
import { declaresProperty } from "../common/predicate/declares-property";
import { isVisible } from "../common/predicate/is-visible";

const { and } = Predicate;
const { isElement, hasNamespace } = Element;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r91.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants({ nested: true, flattened: true })
          .filter(
            Refinement.and(
              isElement,
              and(
                hasNamespace(Namespace.HTML),
                isVisible(device),
                declaresProperty("letter-spacing")
              )
            )
          );
      },

      expectations(target) {
        const style = Style.from(target, device);
        const computed = style.computed("letter-spacing");

        return {
          1: expectation(
            computed.source.none((declaration) => declaration.important),
            () => Outcomes.NotImportant,
            () =>
              expectation(
                computed.value.value >=
                  0.12 * style.computed("font-size").value.value,
                () => Outcomes.AboveMinimum,
                () =>
                  expectation(
                    style.cascaded("letter-spacing").none((spacing) =>
                      spacing.source.some((cascaded) =>
                        target.style.some((block) =>
                          block
                            // We need reference equality here, not .equals as we want to check if the cascaded
                            // value is exactly the declared one, not just a similar one.
                            .declaration((declared) => cascaded === declared)
                            .isSome()
                        )
                      )
                    ),
                    () => Outcomes.Cascaded,
                    () => Outcomes.Important
                  )
              )
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const NotImportant = Ok.of(
    Diagnostic.of("The `letter-spacing` property is not !important")
  );

  export const AboveMinimum = Ok.of(
    Diagnostic.of("The `letter-spacing` property is above the required minimum")
  );

  export const Cascaded = Ok.of(
    Diagnostic.of(
      "The `letter-spacing` property is cascaded from another element"
    )
  );

  export const Important = Err.of(
    Diagnostic.of("The `letter-spacing` property is !important and too small")
  );
}
