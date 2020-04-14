import { Rule } from "@siteimprove/alfa-act";
import { Node, Role } from "@siteimprove/alfa-aria";
import { Branched } from "@siteimprove/alfa-branched";
import { Device } from "@siteimprove/alfa-device";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";
import { expectation } from "../common/expectation";

import { hasName } from "../common/predicate/has-name";
import { hasNamespace } from "../common/predicate/has-namespace";
import { hasRole } from "../common/predicate/has-role";
import { isPerceivable } from "../common/predicate/is-perceivable";

const { and, equals } = Predicate;

export default Rule.Atomic.of<Page, Iterable<Element>>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r56.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        const elements = document
          .descendants({ flattened: true, nested: true })
          .filter(
            and(
              and(Element.isElement, hasNamespace(equals(Namespace.HTML))),
              and(isPerceivable(device), hasLandmarkRole(device))
            )
          );

        console.dir(elements.map((elt) => elt.id.get()).toJSON());

        const groups = elements
          .groupBy((landmark) => Role.from(landmark))
          ;

        console.dir(groups.map(seq => seq.map(elt => elt.id.get())).toJSON(), {depth:4});

        console.dir([...groups.values()].map(seq => seq.map(elt => elt.id.get()).toJSON()));

        return groups.values();
      },

      expectations(target) {
        const names = arrayBranchedToBranchedArray(
          [...target].map((landmark) =>
            Node.from(landmark, device).map((accNode) =>
              accNode.name().map((str) => str.toLocaleLowerCase())
            )
          )
        );

        return {
          "1": expectation(
            names.every((namesArray) =>
              namesArray.every(
                (opt, idx) => namesArray.findIndex(equals(opt)) === idx
              )
            ),
            () => Outcomes.differentNames,
            () => Outcomes.sameNames
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const differentNames = Ok.of(
    "No two same landmarks have the same name."
  );

  export const sameNames = Err.of(
    "Some identical landmarks have the same name."
  );
}

function hasLandmarkRole(device: Device): Predicate<Element> {
  return hasRole((role) => role.inheritsFrom(hasName(equals("landmark"))));
}

function addToBranchedArray<T, B>(
  belt: Branched<T, B>,
  barr: Branched<Array<T>, B>
): Branched<Array<T>, B> {
  return barr.flatMap((arr) => belt.map((elt) => arr.concat(elt)));
}

function arrayBranchedToBranchedArray<T, B>(
  arr: Array<Branched<T, B>>
): Branched<Array<T>, B> {
  return arr.reduce<Branched<Array<T>, B>>(
    (acc, cur) => addToBranchedArray(cur, acc),
    Branched.of([])
  );
}
