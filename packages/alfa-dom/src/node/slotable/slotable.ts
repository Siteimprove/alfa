import type { Option } from "@siteimprove/alfa-option";

import { BaseNode } from "../node.js";
import type { Slot } from "./slot.js";

/**
 * @public
 */
export abstract class Slotable<T extends string = string> extends BaseNode<T> {
  /**
   * Get the slot that this slotable is assigned to.
   *
   * {@link https://dom.spec.whatwg.org/#dom-slotable-assignedslot}
   * {@link https://dom.spec.whatwg.org/#find-a-slot}
   *
   * @privateRemarks
   * While the implementation is the same for Element and Text nodes, it uses
   * type guards from Element and therefore cannot really live here without
   * creating circular dependencies.
   */
  public abstract assignedSlot(): Option<Slot>;

  /**
   * {@link https://dom.spec.whatwg.org/#slotable-name}
   */
  public abstract slotableName(): string;
}

/**
 * @public
 */
export namespace Slotable {
  export function isSlotable(value: unknown): value is Slotable {
    return value instanceof Slotable;
  }
}
