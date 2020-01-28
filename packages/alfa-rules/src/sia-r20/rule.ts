import { Rule } from "@siteimprove/alfa-act";
import * as aria from "@siteimprove/alfa-aria";
import { Attribute, Element } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Some } from "@siteimprove/alfa-option";
import { Ok, Err, Result } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

const { filter, flatMap } = Iterable;

export default Rule.Atomic.of<Page, Attribute>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r20.html",
  evaluate({ document }) {
    return {
      applicability() {
        return flatMap(
          filter(
            document.descendants({ composed: true, nested: true }),
            Element.isElement
          ),
          element =>
            filter(element.attributes, attribute =>
              attribute.name.startsWith("aria-")
            )
        );
      },

      expectations(target) {
        const exists = aria.Attribute.lookup(target.name).isSome();

        return {
          1: exists ? Outcomes.IsDefined : Outcomes.IsNotDefined
        };
      }
    };
  }
});

export namespace Outcomes {
  export const IsDefined = Some.of(
    Ok.of("The attribute is defined") as Result<string, string>
  );

  export const IsNotDefined = Some.of(
    Err.of("The attribute is not defined") as Result<string, string>
  );
}
