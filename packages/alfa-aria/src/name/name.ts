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
  public static of(
    value: string,
    sources: Iterable<Source> = [],
    spaces?: { before?: boolean; after?: boolean },
  ): Name {
    return new Name(
      value,
      Array.from(sources),
      spaces?.before ?? false,
      spaces?.after ?? false,
    );
  }

  private readonly _value: string;
  private readonly _sources: Array<Source>;

  // Accessible names are computed piece-wise (e.g., aria-labelledby, or from
  // content), and then joined. The handling of spaces when joining is tricky
  // and while it is often clear what the "good" result should be, defining it
  // is much more tricky.
  // see https://github.com/w3c/accname/issues/225 for the latest iteration.
  //
  // Consider notably:
  // 1 <button><span>foo</span> <span>bar</span></button> => "foo bar" (inter-element space)
  // 2 <button><span>foo</span><span>bar</span></button> => "foobar" (no inter-element space)
  // 3 <button><span>foo</span><span> bar</span></button> => "foo bar" (leading space)
  // 4 <button><span> foo</span><span> bar</span></button> => "foo bar" (trimming final leading space)
  // 5 <button><span>foo</span><span> </span><span>bar</span></button> => "foo bar" (keeping isolated space)
  // 6 <button><span> </span></button> => "" (aka no name) (killing final isolated space)
  // 7 <button><span>foo</span><div>bar</div></button> => "foo bar" (block element)
  //
  // Anyway, the older version was aggressively trimming, resulting in too many
  // dropped spaces. Upon recursing into content, names were joined looking at
  // `display` and spaces added if needed. But cases 3 or 5 were trimmed before
  // join and the space was incorrectly dropped.
  //
  // Another possibility is to keep the spaces and trim them at the final end.
  // This is a bit annoying given the multiple layers of back and forth (also with
  // Feature). Moreover, it would be a bit inconsistent for compositionality (and
  // sources). For example, in case 5, the name "foo bar" would come from elements
  // <span>foo</span>, <span> </span> and <span>bar</span>, with respective "names"
  // ["foo", " ", "bar"]. But the actual name of the second <span> is actually empty…
  // This solution is also a bit trickier when concatenating names from different
  // elements since it requires looking at the elements to figure out whether extra
  // spaces are needed.
  //
  // The solution we attempt now it to trim the spaces asap, but record within the
  // name that it needs spaces before or after upon concatenation. This way,
  // each name is fully self-contained and concatenating names doesn't require to
  // look at their sources.
  private readonly _spaceBefore: boolean;
  private readonly _spaceAfter: boolean;

  private constructor(
    value: string,
    sources: Array<Source>,
    spaceBefore: boolean,
    spaceAfter: boolean,
  ) {
    this._value = value;
    this._sources = sources;
    this._spaceBefore = spaceBefore;
    this._spaceAfter = spaceAfter;
  }

  public get value(): string {
    return this._value;
  }

  public get spaces(): { before: boolean; after: boolean } {
    return { before: this._spaceBefore, after: this._spaceAfter };
  }

  public get hasSpaces(): boolean {
    return this._spaceBefore || this._spaceAfter;
  }

  public get source(): ReadonlyArray<Source> {
    return this._sources;
  }

  public *sourceNodes(): Iterable<Node> {
    for (const source of this._sources) {
      yield* source;
    }
  }

  /**
   * Normalize the name by trimming and collapsing spaces.
   *
   * @remarks
   * If the name starts or end with spaces that are removed upon trimming,
   * also records that they are needing upon concatenation.
   */
  public normalize(): Name {
    // We need to flatten the string first, so that we can easily detects
    // leading and trailing spaces.
    const flatName = this._value.replace(/\s+/g, " ");

    return new Name(
      flatName.trim(),
      this._sources,
      this._spaceBefore || flatName.startsWith(" "),
      this._spaceAfter || flatName.endsWith(" "),
    );
  }

  /**
   * Add spaces before or after. Do not remove spaces if they are already there.
   */
  public spaced(spaceBefore: boolean, spaceAfter: boolean = spaceBefore): Name {
    return new Name(
      this._value,
      this._sources,
      spaceBefore || this._spaceBefore,
      spaceAfter || this._spaceAfter,
    );
  }
  private add(that: Name): Name {
    return new Name(
      this._value +
        (this._spaceAfter || that._spaceBefore ? " " : "") +
        that._value,
      this._sources.concat(that._sources),
      this._spaceBefore,
      that._spaceAfter,
    );
  }

  public static join(...names: Array<Name>): Name {
    return names.reduce((acc, name) => acc.add(name), Name.of("")).normalize();
  }
  public isEmpty(): boolean {
    return this._value.length === 0 && !this.hasSpaces;
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
      spaces: { before: this._spaceBefore, after: this._spaceAfter },
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
    spaces: { before: boolean; after: boolean };
    sources: Array<Source.JSON>;
  }

  export function from(node: Element | Text, device: Device): Option<Name> {
    return fromNode(node, device, State.empty()).andThen((name) =>
      // Once the computation is finished, we can safely discard empty names that
      // would need spacing if combined. These won't be combined further.
      name.value === "" ? None : Option.of(name),
    );
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
    if (element.name === "br") {
      return Option.of(Name.of("", [], { before: true, after: true }));
    }

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

    // If the element is a block element or a table cell, record that it needs
    // spaces when combined.
    const spaced = test(
      hasComputedStyle(
        "display",
        ({ values: [outside] }) =>
          outside.value === "block" || outside.value === "table-cell",
        device,
      ),
      element,
    );

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
          )
          .map((name) => name.spaced(spaced));
      },

      // Step 2C: control embedded in a label, not currently handled
      // https://github.com/Siteimprove/alfa/issues/305

      // Step 2D: Use the `aria-label` attribute, if present.
      // https://w3c.github.io/accname/#step2D
      () => {
        return (
          element
            .attribute("aria-label")
            .flatMap((attribute) => fromLabel(attribute))
            // As of Feb. 2024, both Chrome and Firefox add spaces when concatenating
            // `aria-label` nodes. Accname spec hasn't resolved this point yet.
            .map((name) => name.spaced(true))
        );
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

        return Feature.from(element.namespace.get(), element.name)
          .flatMap((feature) => feature.name(element, device, state))
          .map((name) => name.spaced(spaced));
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

        return fromDescendants(element, device, state).map((name) =>
          name.spaced(spaced),
        );
      },

      // Step 2H: Use the subtree content, if descending.
      // https://w3c.github.io/accname/#step2H
      () => {
        // Unless we're already descending then this step produces an empty
        // name.
        if (!state.isDescending) {
          return None;
        }

        return fromDescendants(element, device, state).map((name) =>
          name.spaced(spaced),
        );
      },
    );
  }

  /**
   * @internal
   */
  export function fromText(text: Text): Option<Name> {
    // Step 2G: Use the data of the text node.
    // https://w3c.github.io/accname/#step2G
    const data = text.data;
    if (data === "") {
      return None;
    }

    return Option.of(
      Name.of(data, [Source.data(text)], {
        before: false,
        after: false,
      }).normalize(),
    );
  }

  const fromDescendantsCache = Cache.empty<
    Device,
    Cache<State, Cache<Element, Option<Name>>>
  >();

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
    return fromDescendantsCache
      .get(device, Cache.empty)
      .get(state, Cache.empty)
      .get(element, () => {
        const names: Sequence<Name> = element
          .children(Node.flatTree)
          .filter(or(isText, isElement))
          .collect((element) =>
            fromNode(element, device, state.recurse(true).descend(true)),
          );

        const name = Name.join(...names);

        if (name.isEmpty()) {
          return None;
        }

        return Option.of(
          Name.of(
            name.value,
            names.map((name) => Source.descendant(element, name)),
            name.spaces,
          ),
        );
      });
  }

  /**
   * @internal
   */
  export function fromLabel(attribute: Attribute): Option<Name> {
    if (attribute.value === "") {
      return None;
    }

    return Option.of(
      Name.of(attribute.value, [Source.label(attribute)], {
        before: false,
        after: false,
      }).normalize(),
    );
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
      )
      // Step 2.B.ii.c
      .map((name) => name.spaced(true, false));

    const name = Name.join(...names);

    if (name.isEmpty()) {
      return None;
    }

    return Option.of(
      Name.of(
        name.value,
        [
          Source.reference(
            attribute,
            Name.of(
              name.value,
              names.flatMap((name) => Sequence.from(name.source)),
              name.spaces,
            ),
          ),
        ],
        name.spaces,
      ),
    );
  }

  /**
   * @remarks
   * For isolated spaces (e.g., <span> </span>), we need to keep memory of the
   * space and thus must carry over an empty name with spacing. This is
   * however more complex for steps. Here, we want to go to the next step in case
   * of whitespace name, but if we find no name, then we are possibly facing a
   * whitespace element's text and must keep it when concatenating sibling names.
   *
   * @internal
   */
  export function fromSteps(
    ...steps: Array<Thunk<Option<Name>>>
  ): Option<Name> {
    // We need to store the results, because they might be needed in the .orElse
    // and recomputing leads to a combinatorial explosion in some cases
    const results: Array<Option<Name>> = [];

    return Array.collectFirst(steps, (step, index) => {
      const result = step();
      results[index] = result;
      return result.reject((name) => name.value === "");
    }).orElse(() =>
      Array.collectFirst(steps, (step, index) => {
        const result = results[index] === undefined ? step() : results[index];
        return result.reject((name) => name.isEmpty());
      }),
    );
  }

  export const { hasValue } = predicate;
}
