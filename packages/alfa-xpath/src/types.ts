import { Descriptor, Descriptors } from "./descriptors";

export interface Item<V extends Item.Value = Item.Value> {
  readonly type: Descriptor.For<V, Item.Type>;
  value: V;
}

export namespace Item {
  export type Type =
    | Descriptors.String
    | Descriptors.Numeric
    | Descriptors.Integer
    | Descriptors.Decimal
    | Descriptors.Double
    | Descriptors.Boolean
    | Descriptors.Node
    | Descriptors.Element;

  export type Value<T extends Type = Type> = Descriptor.Value<T>;

  export type TypeFor<V extends Value> = Descriptor.For<V, Type>;

  export type Sequence<T extends Type = Type> = Descriptors.Sequence<T>;

  export type Optional<T extends Type = Type> = Descriptors.Optional<T>;
}

export type Type =
  | Item.Type
  | Item.Sequence<Item.Type>
  | Item.Optional<Item.Type>;

export type Value<T extends Type = Type> = Descriptor.Value<T>;

export type TypeFor<V extends Value> = Descriptor.For<V, Type>;
