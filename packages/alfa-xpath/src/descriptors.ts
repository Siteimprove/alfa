import * as dom from "@siteimprove/alfa-dom";
import { Tree } from "./tree";

/**
 * @internal
 */
export interface Descriptor<T = unknown, V = unknown, P = {}> {
  readonly type: T;
  readonly properties: P;
}

/**
 * @internal
 */
export namespace Descriptor {
  export type Type<D> = D extends Descriptor<infer T, infer V, infer P>
    ? T
    : never;

  export type Value<D> = D extends Descriptor<infer T, infer V, infer P>
    ? V
    : never;

  export type Properties<D extends Descriptor> = D extends Descriptor<
    infer T,
    infer V,
    infer P
  >
    ? P
    : never;

  export type For<V, D extends Descriptor> = D extends Descriptor<
    infer T,
    infer U,
    infer P
  >
    ? U extends V
      ? D
      : never
    : never;
}

/**
 * @internal
 */
export namespace Descriptors {
  export type String = Descriptor<"string", string>;
  export type Numeric = Descriptor<"numeric", number>;
  export type Integer = Descriptor<"integer", number>;
  export type Decimal = Descriptor<"decimal", number>;
  export type Double = Descriptor<"double", number>;
  export type Boolean = Descriptor<"boolean", boolean>;

  export type Node = Descriptor<"node", Tree<dom.Node>>;
  export type Element = Descriptor<"element", Tree<dom.Element>>;

  export type Sequence<D extends Descriptor> = Descriptor<
    "*" | "+",
    Iterable<Descriptor.Value<D>>,
    {
      readonly descriptor: D;
    }
  >;

  export type Optional<D extends Descriptor> = Descriptor<
    "?",
    Descriptor.Value<D> | undefined,
    {
      readonly descriptor: D;
    }
  >;
}

/**
 * @internal
 */
export function string(): Descriptors.String {
  return { type: "string", properties: {} };
}

/**
 * @internal
 */
export function numeric(): Descriptors.Numeric {
  return { type: "numeric", properties: {} };
}

/**
 * @internal
 */
export function integer(): Descriptors.Integer {
  return { type: "integer", properties: {} };
}

/**
 * @internal
 */
export function decimal(): Descriptors.Decimal {
  return { type: "decimal", properties: {} };
}

/**
 * @internal
 */
export function double(): Descriptors.Double {
  return { type: "double", properties: {} };
}

/**
 * @internal
 */
export function boolean(): Descriptors.Boolean {
  return { type: "boolean", properties: {} };
}

/**
 * @internal
 */
export function node(): Descriptors.Node {
  return { type: "node", properties: {} };
}

/**
 * @internal
 */
export function element(): Descriptors.Element {
  return { type: "element", properties: {} };
}

/**
 * @internal
 */
export function sequence<D extends Descriptor>(
  descriptor: D,
  options: { required?: boolean } = {}
): Descriptors.Sequence<D> {
  return {
    type: options.required === true ? "+" : "*",
    properties: {
      descriptor
    }
  };
}

/**
 * @internal
 */
export function optional<D extends Descriptor>(
  descriptor: D
): Descriptors.Optional<D> {
  return {
    type: "?",
    properties: {
      descriptor
    }
  };
}
