import { Array } from "@siteimprove/alfa-array";
import {
  Comparable,
  type Comparer,
  Comparison,
} from "@siteimprove/alfa-comparable";
import type { Equatable } from "@siteimprove/alfa-equatable";
import type { Serializable } from "@siteimprove/alfa-json";

import type * as json from "@siteimprove/alfa-json";

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
 * Comparing layers is then just a matter of comparing their order. Layers with
 * normal declarations have negative order, layers with important declaration
 * have positive order (with the same absolute value for the same layer). This
 * account for important declaration winning (this is actually handled by Origin
 * comparison), and reversing the layer order.
 *
 * @privateRemarks
 * This is mutable!
 *
 * Since layers' name are CSS identifiers, they may not contain parenthesis.
 * Thus we may safely use parenthesis in name of "special" layers (anonymous)
 * and implicit), and not treat them differently than other layers.
 *
 * @public
 */
export class Layer<ORDERED extends boolean = boolean>
  implements Serializable<Layer.JSON>, Equatable, Comparable<Layer<true>>
{
  public static of(name: string, importance: boolean): Layer<false> {
    return new Layer(false, name, importance, NaN);
  }

  private static _empty = new Layer(true, "", false, -Infinity);

  public static empty(): Layer<true> {
    return this._empty;
  }

  // Fully qualified name, including dot-separated path.
  private readonly _name: string;
  // Storing importance of blocks in this layer helps computing order.
  private readonly _importance: boolean;
  private _ordered: ORDERED;
  private _order: number;

  protected constructor(
    ordered: ORDERED,
    name: string,
    importance: boolean,
    order: number,
  ) {
    this._name = name;
    this._importance = importance;
    this._ordered = ordered;
    this._order = order;
  }

  public get name(): string {
    return this._name;
  }

  public get order(): number {
    return this._order;
  }

  public get importance(): boolean {
    return this._importance;
  }

  public get isOrdered(): ORDERED {
    return this._ordered;
  }

  /**
   * Mutate the layer by setting the order.
   *
   * @remarks
   * This actually mutates the layer, it does not create a new one.
   * This is on purpose to automatically update all blocks using this layer.
   */
  public withOrder(this: Layer<false>, order: number): Layer<true> {
    // Since we mutate the boolean that fixes the type, TS is out of its
    // league and we need some weird type assertion.
    const that = this as unknown as Layer<true>;
    that._ordered = true;
    that._order = order;
    return that;
  }

  public compare(this: Layer<true>, value: Layer<true>): Comparison {
    return Comparable.compareNumber(this._order, value._order);
  }

  public equals(value: Layer): boolean;

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

  export const compare: Comparer<Layer<true>> = (a, b) => a.compare(b);

  /**
   * @internal
   */
  export type Pair<ORDERED extends boolean = boolean> = {
    name: string;
    normal: Layer<ORDERED>;
    important: Layer<ORDERED>;
  };

  /**
   * Order layers, according to their names (and importance), and relative order of declaration.
   * The arary must contain path-prefix layers (up to the empty path) for each layer!
   *
   * @remarks
   * Layers are named in a tree structure, with dot separated paths (including
   * the empty path for the implicit top layer, and "(anonymous X)" for anonymous
   * layers). They are sorted in depth-first postfix traversal order. The relative
   * order of siblings is **reverse** the declaration order. Thus, layer with important
   * declarations win if they come earlier (larger order), while layer with normal
   * declarations win if the come later (smaller absolute order, but normal layers have
   * negative order).
   *
   * Thus, in order to compare foo.bar.lorem.ipsum and foo.bar.dolor.sit, we need to
   * 1. find the common ancestor (common path), here foo.bar.
   * 2. find where the next bits (lorem / dolor) have been defined, i.e. locate
   *    foo.bar.lorem and foo.bar.dolor
   * 3. compare them according to order in the initial array, which is the declaration order.
   */
  export function sortUnordered(
    layers: ReadonlyArray<Pair<false>>,
  ): Array<Pair<true>> {
    return Array.copy(layers)
      .sort(compareUnordered(layers))
      .map(({ name, normal, important }, idx) => ({
        name,
        // We skip 0 for the sake of having different order on each layer
        normal: normal.withOrder(-idx - 1),
        important: important.withOrder(idx + 1),
      }));
  }

  /**
   * Compare layers (pairs) according to an array of declaration order.
   * The arary must contain path-prefix layers (up to the empty path) for both layer!
   *
   * @remarks
   * Because importance reverses the order of layers, we split layers
   * according to the importance of their blocks.
   * Layers (part) with important declarations get a positive order,
   * layers with normal declarations get a negative one. This ensure
   * important declarations take precedence.
   *
   * Therefore, the last layer must have an order of -1/1 (greatest
   * normal order, lowest important order). Which mean it must be
   * considered as the **smallest** by this comparison for the sort
   * to work properly.
   *
   * That is, layers that come **after** in layer order must be
   * **smaller** by this comparison!
   *
   * @internal
   */
  export function compareUnordered(
    layers: ReadonlyArray<Pair<false>>,
  ): Comparer<Pair<false>> {
    return (a, b) => {
      if (a.name === b.name) {
        return Comparison.Equal;
      }

      // Find the common part
      const pathA = a.name.split(".");
      const pathB = b.name.split(".");
      const short = Math.min(pathA.length, pathB.length);

      let i = 0;
      while (i < short && pathA[i] === pathB[i]) {
        i++;
      }

      const common = pathA.slice(0, i).join(".");

      // if the common segment is one of the name, then this is the
      // corresponding implicit layer.
      // E.g., "foo" and "foo.bar" have common segment "foo" which comes
      // after in layer order, hence is **smaller** by this comparison!
      if (common === a.name) {
        return Comparison.Less;
      }

      if (common === b.name) {
        return Comparison.Greater;
      }

      // Otherwise, we need to find the relative order of the first diverging
      // childrens.
      // E.g., "foo.bar.baz" and "foo.lorem.ipsum" are relatively ordered
      // in the declaration order of "foo.bar" and "foo.lorem".
      // Build diverging names, up to the common part +1 item
      const divergeA = pathA.slice(0, i + 1).join(".");
      const divergeB = pathB.slice(0, i + 1).join(".");

      // The layer declared last comes after in layer order, hence
      // is **smaller** by this comparison!
      return Comparable.compareNumber(
        -layers.findIndex((layer) => layer.name === divergeA),
        -layers.findIndex((layer) => layer.name === divergeB),
      );
    };
  }
}
