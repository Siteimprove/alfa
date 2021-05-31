import {Rule, Diagnostic} from "@siteimprove/alfa-act";
import {Node} from "@siteimprove/alfa-aria";
import { Element, Namespace } from "@siteimprove/alfa-dom";
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
        const name = Node.from(target, device).name.map(name => name.value).getOr("")

        return ImageName.of("", name)
      },
    };
  },
});

class ImageName extends Diagnostic {
  public static of(
    message: string,
    name: string = ""
  ): ImageName {
    return new ImageName(message, name);
  }

  private readonly _name: string;

  private constructor(message: string, name: string) {
    super(message);
    this._name = name;
  }

  public get name(): string {
    return this._name;
  }

  public equals(value: ImageName): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof ImageName &&
      value._message === this._message &&
      value._name === this._name
    );
  }

  public toJSON(): ImageName.JSON {
    return {
      ...super.toJSON(),
      name: this._name,
    };
  }
}

namespace ImageName {
  export interface JSON extends Diagnostic.JSON {
    name: string;
  }
}
