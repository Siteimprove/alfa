import { Role } from "@siteimprove/alfa-aria";
import * as aria from "@siteimprove/alfa-aria";
import { BrowserSpecific } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import { Element, InputType, Namespace, Node } from "@siteimprove/alfa-dom";
import * as dom from "@siteimprove/alfa-dom";

const { map } = BrowserSpecific;

export type Predicate<T, P extends Predicate.Value = boolean> = (
  item: T
) => boolean | P;

export namespace Predicate {
  export type Value = BrowserSpecific.Maybe<boolean>;

  export class Builder<
    T,
    U extends T = T,
    P extends Predicate.Value = boolean
  > {
    public static of<T, U extends T, P extends Predicate.Value = boolean>(
      predicate: Predicate<T, P>
    ): Builder<T, U, P> {
      return new Builder(predicate);
    }

    private readonly predicate: Predicate<T, P>;

    private constructor(predicate: Predicate<T, P>) {
      this.predicate = predicate;
    }

    public test(item: T): boolean | P;

    public test<Q extends Predicate.Value>(
      item: T,
      ifTrue: Predicate<U, Q>,
      ifFalse: Predicate<T, Q>
    ): boolean | P | Q;

    public test<Q extends Predicate.Value>(
      item: T,
      ifTrue: Predicate<U, Q> = () => true,
      ifFalse: Predicate<T, Q> = () => false
    ): boolean | P | Q {
      const result = map(this.predicate(item), ok => {
        return is<T, U>(item, ok) ? ifTrue(item) : ifFalse(item);
      });

      return result as boolean | P | Q;
    }

    public and<V extends U>(predicate: Chainable<U, V>): Chain<T, V, P, "and">;

    public and<V extends U, Q extends Predicate.Value>(
      predicate: Chainable<U, V, Q>
    ): Chain<T, V, P | Q, "and">;

    public and<V extends U, Q extends Predicate.Value>(
      predicate: Chainable<U, V, Q>
    ): Chain<T, V, P | Q, "and"> {
      return new Builder<T, V, P | Q>(item => {
        return this.test(item, item => test(item, predicate), () => false);
      });
    }

    public or<V extends T>(
      predicate: Chainable<T, V>
    ): Chain<T, U | V, P, "or">;

    public or<V extends T, Q extends Predicate.Value>(
      predicate: Chainable<T, V, Q>
    ): Chain<T, U | V, P | Q, "or">;

    public or<V extends T, Q extends Predicate.Value>(
      predicate: Chainable<T, V, Q>
    ): Chain<T, U | V, P | Q, "or"> {
      return new Builder<T, U, P | Q>(item => {
        return this.test(item, () => true, item => test(item, predicate));
      });
    }
  }

  export type Chain<
    T,
    U extends T = T,
    P extends Predicate.Value = boolean,
    O extends "and" | "or" = never
  > = Omit<Builder<T, U, P>, Exclude<"and" | "or", O>>;

  export type Chainable<
    T,
    U extends T = T,
    P extends Predicate.Value = boolean,
    O extends "and" | "or" = never
  > = Predicate<T, P> | Chain<T, U, P, O>;
}

function is<T, U extends T>(item: T, ok: boolean): item is U {
  return ok;
}

export function not<T, U extends T>(
  predicate: Predicate.Chainable<T, U>
): Predicate.Builder<T, U>;

export function not<T, U extends T, P extends Predicate.Value>(
  predicate: Predicate.Chainable<T, U, P>
): Predicate.Builder<T, U, P>;

export function not<T, U extends T, P extends Predicate.Value>(
  predicate: Predicate.Chainable<T, U, P>
): Predicate.Builder<T, U, P> {
  return Predicate.Builder.of(item => {
    if (typeof predicate === "function") {
      predicate = Predicate.Builder.of(predicate);
    }

    return predicate.test<P>(item, () => false, () => true);
  });
}

export function test<T, U extends T>(
  item: T,
  predicate: Predicate.Chainable<T, U>
): item is U;

export function test<T, U extends T, P extends Predicate.Value>(
  item: T,
  predicate: Predicate.Chainable<T, U, P>
): boolean | P;

export function test<T, U extends T, P extends Predicate.Value>(
  item: T,
  predicate: Predicate.Chainable<T, U, P>
): boolean | P {
  return typeof predicate === "function"
    ? predicate(item)
    : predicate.test(item);
}

export const isElement = Predicate.Builder.of<Node, Element>(dom.isElement);

export const isText = Predicate.Builder.of<Node, Text>(dom.isText);

export const isDocument = Predicate.Builder.of<Node, Document>(dom.isDocument);

export function nameIs(...names: Array<string>): Predicate.Builder<Element> {
  return Predicate.Builder.of(element =>
    names.some(name => name === element.localName)
  );
}

export function inputTypeIs(
  ...inputTypes: Array<InputType>
): Predicate.Builder<Element> {
  return Predicate.Builder.of(element =>
    inputTypes.some(inputType => inputType === dom.getInputType(element))
  );
}

export function namespaceIs(
  context: Node,
  ...namespaces: Array<Namespace>
): Predicate.Builder<Element> {
  return Predicate.Builder.of(element =>
    namespaces.some(
      namespace => namespace === dom.getElementNamespace(element, context)
    )
  );
}

export function roleIs(
  context: Node,
  device: Device,
  ...roles: Array<Role>
): Predicate.Builder<Element, Element, BrowserSpecific.Maybe<boolean>> {
  return Predicate.Builder.of(element =>
    map(aria.getRole(element, context, device), elementRole =>
      roles.some(role => role === elementRole)
    )
  );
}
