import { Rule } from "@siteimprove/alfa-act";
import * as aria from "@siteimprove/alfa-aria";
import { Attribute, isElement } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { walk } from "../common/walk";

const { filter, flatMap } = Iterable;

export default Rule.Atomic.of<Page, Attribute>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r20.html",
  evaluate({ document }) {
    return {
      applicability() {
        return flatMap(
          filter(
            walk(document, document, { composed: true, nested: true }),
            isElement
          ),
          element =>
            filter(Iterable.from(element.attributes), attribute =>
              attribute.localName.startsWith("aria-")
            )
        );
      },

      expectations(target) {
        const exists = aria.Attribute.lookup(target.localName).isSome();

        return {
          1: exists
            ? Ok.of("The attribute is defined")
            : Err.of("The attribute is not defined")
        };
      }
    };
  }
});
