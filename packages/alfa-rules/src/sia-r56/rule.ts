/// <reference lib="dom" />

import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { Node, Role } from "@siteimprove/alfa-aria";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { List } from "@siteimprove/alfa-list";
import { Map } from "@siteimprove/alfa-map";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";
import { Group } from "../common/group";
import { normalize } from "../common/normalize";

import { hasRole, isIgnored } from "../common/predicate";

const { and, equals, not } = Predicate;
const { hasNamespace } = Element;

export default Rule.Atomic.of<Page, Group<Element>>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r56.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants({ flattened: true, nested: true })
          .filter(Element.isElement)
          .filter(
            and(
              hasNamespace(equals(Namespace.HTML)),
              not(isIgnored(device)),
              hasRole(device, (role) => role.is("landmark"))
            )
          )
          .reduce((groups, landmark) => {
            // since we already have filtered by hasLandmarkRole, we can
            // safely get the role.
            const role = Node.from(landmark, device).role.get()!;

            groups = groups.set(
              role,
              groups
                .get(role)
                .getOrElse(() => List.empty<Element>())
                .append(landmark)
            );

            return groups;
          }, Map.empty<Role, List<Element>>())
          .filter((elements) => elements.size > 1)
          .map(Group.of)
          .values();
      },

      expectations(target) {
        const byNames = [...target]
          .reduce((groups, landmark) => {
            const name = Node.from(landmark, device).name.map((name) =>
              normalize(name.value)
            );
            groups = groups.set(
              name,
              groups
                .get(name)
                .getOrElse(() => List.empty<Element>())
                .append(landmark)
            );

            return groups;
          }, Map.empty<Option<string>, List<Element>>())
          .filter((landmarks) => landmarks.size > 1);

        return {
          1: expectation(
            byNames.size === 0,
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
