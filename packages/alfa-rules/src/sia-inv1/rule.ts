import { Rule } from "@siteimprove/alfa-act";
import { Node } from "@siteimprove/alfa-aria";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Diagnostic } from "@siteimprove/alfa-inventory";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Page } from "@siteimprove/alfa-web";

import { hasRole } from "../common/predicate/has-role";
import { isIgnored } from "../common/predicate/is-ignored";

const { isElement, hasNamespace } = Element;
const { and, not } = Predicate;

export default Rule.Inventory.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-inv1",
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants({ flattened: true, nested: true })
          .filter(isElement)
          .filter(
            and(
              hasNamespace(Namespace.HTML),
              hasRole(device, "img"),
              not(isIgnored(device))
            )
          );
      },

      expectations(target) {
        const name = Node.from(target, device).name.map((name) => name.value);

        return ImageName.of(name);
      },
    };
  },
});

export class ImageName extends Diagnostic {
  public static of(name: Option<string> = None): ImageName {
    return new ImageName(name);
  }

  private readonly _name: Option<string>;

  private constructor(name: Option<string>) {
    super();
    this._name = name;
  }

  public get name(): Option<string> {
    return this._name;
  }

  public equals(value: ImageName): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof ImageName && value._name.equals(this._name);
  }

  public toJSON(): ImageName.JSON {
    return {
      name: this._name.toJSON(),
    };
  }
}

namespace ImageName {
  export interface JSON extends Diagnostic.JSON {
    name: Option.JSON<string>;
  }
}
