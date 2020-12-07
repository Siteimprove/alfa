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

const { and } = Predicate;
const { isElement } = Element;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r92.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return document.descendants({ nested: true, flattened: true }).filter(
          Refinement.and(
            isElement,
            and(hasNamespace(Namespace.HTML), isVisible(device), (element) =>
              element.style.some((block) =>
                block.declaration("word-spacing").isSome()
              )
            )
          )
        );
      },
      expectations(target) {
        const style = Style.from(target, device);
        const computed = style.computed("word-spacing");

        return {
          1: expectation(
            computed.source.none((declaration) => declaration.important),
            () => Outcomes.NotImportant,
            () =>
              expectation(
                computed.value.value >=
                  0.16 * style.computed("font-size").value.value,
                () => Outcomes.AboveMinimum,
                () =>
                  expectation(
                    style.cascaded("word-spacing").none((spacing) =>
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
    Diagnostic.of("The `word-spacing` property is not !important")
  );

  export const AboveMinimum = Ok.of(
    Diagnostic.of("The `word-spacing` property is above the required minimum")
  );

  export const Cascaded = Ok.of(
    Diagnostic.of(
      "The `word-spacing` property is cascaded from another element"
    )
  );

  export const Important = Err.of(
    Diagnostic.of("The `word-spacing` property is !important and too small")
  );
}
