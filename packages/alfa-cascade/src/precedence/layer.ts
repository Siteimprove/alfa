import { Comparable, Comparison } from "@siteimprove/alfa-comparable";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";

import * as json from "@siteimprove/alfa-json";

/**
 * @remarks
 * Cascade layer form a tree. They are then ordered in depth-first
 * **suffix** traversal (parent is after children).
 *
 * This means that:
 * 1. The path to two layers is not enough to compare them, we need
 *    the full tree or at least the relative order of children.
 * 2. It is not possible to pre-compute a single number upon declaring
 *    a layer, its actual position depends on the number of descendants
 *    it has.
 * 3. The declaration order of layers is not enough; the order of `foo.bar`
 *    versus `lorem.ipsum` depends on the order of `foo` vs `lorem`, even
 *    if `lorem.ispum` is ultimately declared before `foo.bar`.
 *
 * To solve that, while providing a fast comparison of layers (hence of
 * precedences), we store layers as mutuable objects with a name (their path
 * in the layer tree), and a number (their position in the traversal). Upon
 * building blocks, we can compute the name (and only the name). Once all
 * declarations and rules have been processed, we can revisit the layers in
 * the correct order and give them a number.
 *
 * By using a mutable structure for layers, we can have the cascade Blocks
 * used here refer to them as object and thus updating the order will
 * automatically update it in all blocks, without needing to revisit them.
 *
 * Comparing layers is then just a matter of comparing their order.
 *
 * @privateRemarks
 * This is mutable!
 *
 * Since layers' name are CSS indent, they may not contain parenthesis.
 * Thus we may safely use parenthesis in name of "special" layers (anonymous)
 * and implicit), and not treat them differently than other layers.
 *
 * @public
 */
export class Layer
  implements Serializable<Layer.JSON>, Equatable, Comparable<Layer>
{
  public static of(name: string, importance: boolean): Layer {
    return new Layer(name, importance, NaN);
  }

  private static _empty = new Layer("", false, -Infinity);

  public static empty(): Layer {
    return this._empty;
  }

  // Fully qualified name, including dot-separated path.
  private readonly _name: string;
  // Storing importance of blocks in this layer helps computing order.
  private readonly _importance: boolean;
  private _order: number;

  private constructor(name: string, importance: boolean, order: number) {
    this._name = name;
    this._importance = importance;
    this._order = order;
  }

  public get name(): string {
    return this._name;
  }

  public get order(): number {
    return this._order;
  }

  /**
   * Mutate the layer by setting the order.
   *
   * @remarks
   * This actually mutates the layer, it does not create a new one.
   * This is on purpose to automatically update all blocks using this layer.
   */
  public withOrder(order: number): Layer {
    if (isNaN(this._order)) {
      // only allow to set the order once.
      this._order = order;
    }

    return this;
  }

  public compare(value: Layer): Comparison {
    return Comparable.compareNumber(this._order, value._order);
  }

  public equals(value: this): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Layer &&
      value._name === this._name &&
      value._order === this._order
    );
  }

  public toJSON(): Layer.JSON {
    return {
      name: this._name,
      order: this._order,
    };
  }
}

/**
 * @public
 */
export namespace Layer {
  export interface JSON {
    [key: string]: json.JSON;
    name: string;
    order: number;
  }

  export function compare(a: Layer, b: Layer): Comparison {
    return a.compare(b);
  }
}
