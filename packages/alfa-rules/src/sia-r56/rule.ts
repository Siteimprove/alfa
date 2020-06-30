import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { Node, Role } from "@siteimprove/alfa-aria";
import { Branched } from "@siteimprove/alfa-branched";
import { Device } from "@siteimprove/alfa-device";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";
import { expectation } from "../common/expectation";

import { hasRole } from "../common/predicate/has-role";
import { isIgnored } from "../common/predicate/is-ignored";

const { and, equals, not } = Predicate;
const { hasNamespace } = Element;

export default Rule.Atomic.of<Page, Iterable<Element>>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r56.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        const elements = document
          .descendants({ flattened: true, nested: true })
          .filter(
            and(
              Element.isElement,
              and(
                hasNamespace(equals(Namespace.HTML)),
                not(isIgnored(device)),
                hasLandmarkRole(device)
              )
            )
          );

        console.dir(elements.map((elt) => elt.id.get()).toJSON());

        const foo = [...elements].map((elt) => elt.id.get());
        console.log(foo);

        const groups = elements.groupBy((landmark) => {
          const role = Role.from(landmark);

          console.log(
            `landmark ${landmark.id.get()} has role ${role
              .toArray()
              .map(([r, _]) => r.map((r) => r.name).getOr("no role"))}`
          );

          return role;
        });

        console.log(
          groups
            .toArray()
            .map(
              ([branchedRole, group]) =>
                `role: ${branchedRole
                  .toArray()
                  .map(([r, _]) =>
                    r.map((role) => role.name).getOr("no role")
                  )}, groups: ${group
                  .map((element) => element.id.get())
                  .toJSON()}.`
            )
        );

        const result = groups.values();
        console.dir(
          [...result].map((seq) => seq.map((elt) => elt.id.get()).toJSON())
        );

        return result;
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
    Diagnostic.of("No two same landmarks have the same name.")
  );

  export const sameNames = Err.of(
    Diagnostic.of("Some identical landmarks have the same name.")
  );
}

function hasLandmarkRole(device: Device): Predicate<Element> {
  return hasRole((role) => role.inheritsFrom(Role.hasName(equals("landmark"))));
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
