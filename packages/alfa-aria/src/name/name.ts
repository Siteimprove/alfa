import { Array } from "@siteimprove/alfa-array";
import { Cache } from "@siteimprove/alfa-cache";
import { Device } from "@siteimprove/alfa-device";
import { Attribute, Element, Node, Query, Text } from "@siteimprove/alfa-dom";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Style } from "@siteimprove/alfa-style";
import { Thunk } from "@siteimprove/alfa-thunk";

import * as json from "@siteimprove/alfa-json";

import { Feature } from "../feature";
import { Role } from "../role";

import * as predicate from "./predicate";
import { Source } from "./source";
import { State } from "./state";

import { isProgrammaticallyHidden } from "../dom/predicate/is-programmatically-hidden";

const { isElement } = Element;
const { isText } = Text;
const { test } = Predicate;
const { or } = Refinement;
const { hasComputedStyle } = Style;
const { getElementIdMap } = Query;

/**
 * @public
 */
export class Name implements Equatable, Serializable<Name.JSON> {
  public static of(value: string, sources: Iterable<Source> = []): Name {
    return new Name(value, Array.from(sources));
  }

  private readonly _value: string;
  private readonly _sources: Array<Source>;

  private constructor(value: string, sources: Array<Source>) {
    this._value = value;
    this._sources = sources;
  }

  public get value(): string {
    return this._value;
  }

  public get source(): ReadonlyArray<Source> {
    return this._sources;
  }

  public *sourceNodes(): Iterable<Node> {
    for (const source of this._sources) {
      yield* source;
    }
  }

  public isEmpty(): boolean {
    return this._value.length === 0;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Name &&
      value._value === this._value &&
      value._sources.length === this._sources.length &&
      value._sources.every((source, i) => source.equals(this._sources[i]))
    );
  }

  public toJSON(): Name.JSON {
    return {
      value: this._value,
      sources: this._sources.map((source) => source.toJSON()),
    };
  }

  public toString(): string {
    return this._value;
  }
}

/**
 * @public
 */
export namespace Name {
  export interface JSON {
    [key: string]: json.JSON;
    value: string;
    sources: Array<Source.JSON>;
  }

  export function from(node: Element | Text, device: Device): Option<Name> {
    return fromNode(node, device, State.empty());
  }

  const names = Cache.empty<Device, Cache<Node, Option<Name>>>();

  /**
   * @internal
   */
  export function fromNode(
    node: Element | Text,
    device: Device,
    state: State,
  ): Option<Name> {
    // Construct a thunk with the computed name of the node. We first need to
    // decide whether or not we can pull the name of the node from the cache and
    // so the actual computation of the name must be delayed.
    const name = () =>
      isElement(node) ? fromElement(node, device, state) : fromText(node);

    if (isElement(node)) {
      // As chained references are not allowed, we cannot make use of the cache
      // when computing a referenced name. If, for example, <foo> references
      // <bar> and <bar> references <baz>...
      //
      //   <foo> -> <bar> -> <baz> "Hello world"
      //
      // ...the reference from <bar> to <baz> is only allowed to be followed
      // when computing a name for <bar>:
      //
      //   <bar> "Hello world" -> <baz> "Hello world"
      //
      // When computing the name for <foo>, however, the second reference must
      // be ignored and the name for <bar> computed as if though the reference
      // does not exist:
      //
      //   <foo> null -> <bar> null
      //
      // We therefore cannot make use of whatever is in the cache for <bar>.
      if (state.isReferencing) {
        return name();
      }

      // If we're descending then the name already in the cache may not be
      // relevant due to the last step of the name computation. If, for example,
      // <baz> is a child of <bar> which is a child of <foo>...
      //
      //   <foo>
      //     <bar>
      //       <baz> "Hello world"
      //
      // ...and the name of <baz> has already been computed as "Hello world" and
      // we then compute the name of <bar> and <bar> is not allowed to be named
      // by its contents, it will not have a name:
      //
      //   <bar> null
      //     <baz> "Hello world"
      //
      // However, when we compute the name of <foo> and <foo> is allowed to be
      // named by its contents, the last step of the same computation kicks in
      // and includes all descendant names:
      //
      //   <foo> "Hello world"
      //     <bar> "Hello world"
      //       <baz> "Hello world"
      //
      // We therefore cannot make use of whatever is in the cache for <bar>.
      if (state.isDescending) {
        return name();
      }
    }

    return names.get(device, Cache.empty).get(node, name);
  }

  /**
   * @internal
   */
  export function fromElement(
    element: Element,
    device: Device,
    state: State,
  ): Option<Name> {
    if (state.hasVisited(element)) {
      // While self-references are allowed, any other forms of circular
      // references are not. If the referrer therefore isn't the element itself,
      // the result will be an empty name.
      if (!state.referrer.includes(element)) {
        return None;
      }
    } else {
      state = state.visit(element);
    }

    // The following code handles the _generic_ steps of the accessible name
    // computation, that is any steps that are shared for all namespaces. All
    // remaining steps are handled by namespace-specific feature mappings.

    const role = Role.from(element);

    // Step 1: Does the role prohibit naming?
    // https://w3c.github.io/accname/#step1
    // Step 1 is skipped when referencing due to step 2B.ii.b
    // https://w3c.github.io/accname/#step2B.ii.b
    // Step 1 is skipped when descending due to step 2F.iii.b
    // https://w3c.github.io/accname/#step2B.iii.b
    if (
      !state.isReferencing &&
      !state.isDescending &&
      role.some((role) => role.isNameProhibited())
    ) {
      return None;
    }

    // Step 2A: Is the element hidden and not part of a reference traversal
    // whose root was hidden?
    // https://w3c.github.io/accname/#step2A
    if (
      // The element is hidden
      // https://www.w3.org/TR/wai-aria-1.2/#dfn-hidden
      // https://w3c.github.io/accname/#step2A (first comment)
      test(isProgrammaticallyHidden(device), element)
    ) {
      // The element is not part of a traversal
      if (!state.isReferencing) {
        return None;
      }

      // The element is part of a native host language traversal;
      // this is detected by having the referrer and the referred being the
      // same.
      // This is theoretically not needed, see
      // https://github.com/Siteimprove/alfa/issues/1266
      if (state.referrer.equals(state.referred)) {
        return None;
      }

      // The element is part of an `aria-labelledby` traversal whose root was
      // not hidden.
      if (state.referred.none(isProgrammaticallyHidden(device))) {
        return None;
      }

      // The element is part of an `aria-labelledby` traversal whose root
      // was hidden, keep going.
    }

    return fromSteps(
      // Step 2B: Use the `aria-labelledby` attribute, if present and allowed.
      // https://w3c.github.io/accname/#step2B
      () => {
        // Chained `aria-labelledby` references, such `foo` -> `bar` -> `baz`,
        // are not allowed. If the element is therefore being referenced
        // already then this step produces an empty name.
        if (state.isReferencing) {
          return None;
        }

        return element
          .attribute("aria-labelledby")
          .flatMap((attribute) =>
            fromReferences(attribute, element, device, state),
          );
      },

      // Step 2C: control embedded in a label, not currently handled
      // https://github.com/Siteimprove/alfa/issues/305

      // Step 2D: Use the `aria-label` attribute, if present.
      // https://w3c.github.io/accname/#step2D
      () => {
        return element
          .attribute("aria-label")
          .flatMap((attribute) => fromLabel(attribute));
      },

      // Step 2E: Use native features, if present and allowed.
      // https://w3c.github.io/accname/#step2E
      () => {
        // Using native features is only allowed if the role, if any, of the
        // element is not presentational and the element has a namespace with
        // which to look up its feature mapping, if it exists. If the role of
        // element therefore is presentational or the element has no namespace
        // then this step produces an empty name.
        if (
          role.some((role) => role.isPresentational()) ||
          !element.namespace.isSome()
        ) {
          return None;
        }

        return Feature.from(element.namespace.get(), element.name).flatMap(
          (feature) => feature.name(element, device, state),
        );
      },

      // Step 2F: Use the subtree content, if referencing or allowed.
      // https://w3c.github.io/accname/#step2F
      () => {
        // Using the subtree content is only allowed if the element is either
        // being referenced or the role, if any, of the element allows it to
        // be named by its content. If the element therefore isn't being
        // referenced and is not allowed to be named by its content then this
        // step produces an empty name.
        if (
          !state.isReferencing &&
          !role.some((role) => role.isNamedBy("contents"))
        ) {
          return None;
        }

        return fromDescendants(element, device, state);
        //   .flatMap((name) =>
        //   normalize(name.value) === ""
        //     ? None
        //     : Option.of(Name.of(normalize(name.value), name.source)),
        // );
      },

      // Step 2H: Use the subtree content, if descending.
      // https://w3c.github.io/accname/#step2H
      () => {
        // Unless we're already descending then this step produces an empty
        // name.
        if (!state.isDescending) {
          return None;
        }

        return fromDescendants(element, device, state);
      },
    );
  }

  /**
   * @internal
   */
  export function fromText(text: Text): Option<Name> {
    // Step 2G: Use the data of the text node.
    // https://w3c.github.io/accname/#step2G
    return fromData(text);
  }

  /**
   * @remarks
   * Firefox incorrectly skips aria-labelledby when descending
   * {@link https://bugzilla.mozilla.org/show_bug.cgi?id=1652712}
   *
   * @internal
   */
  export function fromDescendants(
    element: Element,
    device: Device,
    state: State,
  ): Option<Name> {
    const names: Sequence<readonly [string, Name]> = element
      .children(Node.flatTree)
      .filter(or(isText, isElement))
      .collect((element) =>
        fromNode(element, device, state.recurse(true).descend(true)).map(
          (name) => {
            if (
              test(
                hasComputedStyle(
                  "display",
                  ({ values: [outside] }) => outside.value === "block",
                  device,
                ),
                element,
              )
            ) {
              return [` ${name.value} `, name];
            }
            return [name.value, name];
          },
        ),
      );

    // const name = flatten(names.map(([value]) => value).join(""));
    const name = flatten(names.map(([value]) => value).join("")).trim();

    if (name === "") {
      return None;
    }

    return Option.of(
      Name.of(
        name,
        names.map(([, name]) => Source.descendant(element, name)),
      ),
    );
  }

  /**
   * @internal
   */
  export function fromLabel(attribute: Attribute): Option<Name> {
    const name = flatten(attribute.value);

    if (name === "") {
      return None;
    }

    return Option.of(Name.of(name, [Source.label(attribute)]));
  }

  /**
   * @internal
   */
  export function fromReferences(
    attribute: Attribute,
    referrer: Element,
    device: Device,
    state: State,
  ): Option<Name> {
    if (!attribute.owner.isSome()) {
      return None;
    }
    const root = attribute.owner.get().root();
    const names = attribute
      .tokens()
      .collect((id) => getElementIdMap(root).get(id))
      .collect((element) =>
        fromNode(
          element,
          device,
          state.reference(referrer, element).recurse(true).descend(false),
        ),
      );

    const name = flatten(names.map((name) => name.value).join(" "));

    if (name === "") {
      return None;
    }

    return Option.of(
      Name.of(name, [
        Source.reference(
          attribute,
          Name.of(
            name,
            names.flatMap((name) => Sequence.from(name.source)),
          ),
        ),
      ]),
    );
  }

  /**
   * @internal
   */
  export function fromData(text: Text): Option<Name> {
    const name = flatten(text.data);

    if (name === "") {
      return None;
    }

    return Option.of(Name.of(name, [Source.data(text)]));
  }

  /**
   * @internal
   */
  export function fromSteps(
    ...steps: Array<Thunk<Option<Name>>>
  ): Option<Name> {
    return Array.collectFirst(steps, (step) => step());
  }

  export const { hasValue } = predicate;
}

function flatten(string: string): string {
  return string.replace(/\s+/g, " ");
}
