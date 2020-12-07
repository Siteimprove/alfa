import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Page } from "@siteimprove/alfa-web";

import { Refinement } from "@siteimprove/alfa-refinement";
import { hasNamespace } from "@siteimprove/alfa-dom/src/node/element/predicate/has-namespace";
import { isVisible } from "../common/predicate/is-visible";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
import { expectation } from "../common/expectation";

const { and, not, fold } = Predicate;
const { hasName, isElement } = Element;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r91.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return document.descendants({ nested: true, flattened: true }).filter(
          Refinement.and(
            isElement,
            and(hasNamespace(Namespace.HTML), isVisible(device), (element) =>
              element.style.some((block) =>
                block.declaration("letter-spacing").isSome()
              )
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
                            .declaration("letter-spacing")
                            // We need reference equality here, not .equals as we want to check if the cascaded
                            // value is exactly the declared one, not just a similar one.
                            .some((declared) => cascaded === declared)
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
