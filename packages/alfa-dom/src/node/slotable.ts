import type { Option } from "@siteimprove/alfa-option";

import type { Node } from "../node.js";
import { Element } from "./element.js";
import { Slot } from "./slot.js";
import { Text } from "./text.js";

/**
 * @public
 */
export interface Slotable extends Node {
  /**
   * Get the slot that this slotable is assigned to.
   *
   * {@link https://dom.spec.whatwg.org/#dom-slotable-assignedslot}
   */
  assignedSlot(): Option<Slot>;
}

/**
 * @public
 */
export namespace Slotable {
  export function isSlotable(value: unknown): value is Slotable {
    return Element.isElement(value) || Text.isText(value);
  }

  /**
   * {@link https://dom.spec.whatwg.org/#slotable-name}
   */
  export function name(slotable: Slotable): string {
    return Element.isElement(slotable)
      ? slotable
          .attribute("slot")
          .map((slot) => slot.value)
          .getOr("")
      : "";
  }

  /**
   * {@link https://dom.spec.whatwg.org/#find-a-slot}
   */
  export function findSlot(slotable: Slotable): Option<Slot> {
    const name = Slotable.name(slotable);

    return slotable
      .parent()
      .filter(Element.isElement)
      .flatMap((parent) =>
        parent.shadow.flatMap((shadow) =>
          shadow
            .descendants()
            .filter(Slot.isSlot)
            .find((slot) => Slot.name(slot) === name),
        ),
      );
  }
}
