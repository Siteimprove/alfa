import * as dom from "@siteimprove/alfa-dom";
import { Tree } from "./tree";

export interface Descriptor<T = unknown, V = unknown, P = {}> {
  readonly type: T;
  readonly properties: P;
}

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

export namespace Descriptors {
  export type Node = Descriptor<"node()", Tree<dom.Node>>;
  export type Element = Descriptor<"element()", Tree<dom.Element>>;

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

export function node(): Descriptors.Node {
  return { type: "node()", properties: {} };
}

export function element(): Descriptors.Element {
  return { type: "element()", properties: {} };
}

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
