import { Outcome, Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import R26 from "../sia-r26/rule";
import R32 from "../sia-r32/rule";
import R33 from "../sia-r33/rule";
import R34 from "../sia-r34/rule";

const { some } = Iterable;

export default Rule.Composite.of<Page, Element>({
  uri: "ttps://siteimprove.github.io/sanshikan/rules/sia-r35.html",
  composes: [R26, R32, R33, R34],
  evaluate() {
    return {
      expectations(outcomes) {
        return {
          1: some(outcomes, Outcome.isPassed)
            ? Ok.of("The <video> element has an alternative")
            : Err.of("The <video> element does not have an alternative")
        };
      }
    };
  }
});
