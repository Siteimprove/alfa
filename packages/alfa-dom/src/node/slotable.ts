import { Option } from "@siteimprove/alfa-option";

import { Node } from "../node";
import { Element } from "./element";
import { Slot } from "./slot";
import { Text } from "./text";

export interface Slotable extends Node {
  /**
   * Get the slot that this slotable is assigned to.
   *
   * @see https://dom.spec.whatwg.org/#dom-slotable-assignedslot
   */
  assignedSlot(): Option<Slot>;
}

export namespace Slotable {
  export function isSlotable(value: unknown): value is Slotable {
    return Element.isElement(value) || Text.isText(value);
  }

  /**
   * @see https://dom.spec.whatwg.org/#slotable-name
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
   * @see https://dom.spec.whatwg.org/#find-a-slot
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
            .find((slot) => Slot.name(slot) === name)
        )
      );
  }
}
