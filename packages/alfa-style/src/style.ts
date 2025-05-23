import { Array } from "@siteimprove/alfa-array";
import { Cache } from "@siteimprove/alfa-cache";
import type { Callback } from "@siteimprove/alfa-callback";
import { Cascade, Origin } from "@siteimprove/alfa-cascade";
import { Keyword, Lexer, Token } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import {
  type Declaration,
  Document,
  Element,
  Node,
  Shadow,
} from "@siteimprove/alfa-dom";
import { Either, Left, Right } from "@siteimprove/alfa-either";
import { Iterable } from "@siteimprove/alfa-iterable";
import type * as json from "@siteimprove/alfa-json";
import type { Serializable } from "@siteimprove/alfa-json";
import { Map } from "@siteimprove/alfa-map";
import { None, Option } from "@siteimprove/alfa-option";
import { Result } from "@siteimprove/alfa-result";
import { Context } from "@siteimprove/alfa-selector";
import { Set } from "@siteimprove/alfa-set";
import type { Slice } from "@siteimprove/alfa-slice";

import * as element from "./element/element.js";
import * as node from "./node/node.js";
import * as predicates from "./predicate/index.js";
import * as text from "./text/text.js";

import { Longhand } from "./longhand.js";
import { Longhands } from "./longhands.js";
import type { Shorthand } from "./shorthand.js";
import { Shorthands } from "./shorthands.js";

import { Value } from "./value.js";
import { Variable } from "./variable.js";

type Name = Longhands.Name;

/**
 * @public
 */
export class Style implements Serializable<Style.JSON> {
  /**
   * Build a style from a list of declarations.
   *
   * @remarks
   * Declarations must be pre-sorted in decreasing Cascade order.
   * Prefer using Style.from(), which has fewer assumptions.
   */
  public static of(
    styleDeclarations: Iterable<[Declaration, Origin]>,
    device: Device,
    parent: Option<Style> = None,
    owner: Option<Element> = None,
  ): Style {
    // declarations are read twice, once for variables and once for properties,
    // so we cannot use a read-once iterable. Main use case from `Style.from`
    // is already sending an Array, so this is inexpensive
    const declarations = Array.from(styleDeclarations);

    /**
     * First pass, substitute all variables by their definition
     */
    // First step: gather all variable declarations.
    const declaredVariables = Variable.gather(
      declarations.map(([declaration]) => declaration),
    );

    // Second step: since CSS variables are always inherited, and inheritance
    // takes precedence over fallback, we can merge the current variables with
    // the parent ones, this will effectively resolve variable inheritance.
    const cascadedVariables = parent
      .map((parent) => parent.variables)
      .getOr(Map.empty<string, Value<Slice<Token>>>())
      .concat(declaredVariables);

    // Third step: pre-substitute the resolved cascading variables from above,
    // replacing any `var()` function references with their substituted tokens.
    // This effectively takes care of deleting variables with syntactically
    // invalid values, circular references, too many substitutions, …
    const variables = Variable.flatten(cascadedVariables);

    /**
     * Second pass: Resolve cascading properties using the cascading variables
     * from the first pass.
     *
     * Since declarations have been sorted in decreasing cascade order by the
     * cascade, the first value we encounter for each property is the correct
     * one for the cascaded value.
     */

    let properties = Map.empty<Name, Value>();
    // Since we effectively only handle User-Agent and Author origins, we can
    // go for a simple version of `revert`. We don't use it in the User Agent
    // style sheet, and will simply skip all author origin declarations.
    // So, we simply keep a set of reverted properties, and skip author
    // declarations for these.
    let reverted = Set.empty<Name>();

    function registerParsed<N extends Longhands.PropName>(
      name: N,
      declaration: Declaration,
    ): Callback<Style.Declared<N>> {
      return (value) => {
        if (value.equals(Keyword.of("revert"))) {
          reverted = reverted.add(name);
        } else {
          properties = properties.set(
            name,
            Value.of(value, Option.of(declaration)),
          );
        }
      };
    }

    function register<N extends Name>(
      name: N,
      value: Either<Style.Declared<Longhands.TrueName<N>>, string>,
      declaration: Declaration,
      origin: Origin,
    ): void {
      const property = Longhands.get(name);

      // If the property has been reverted to User Agent origin,
      // discard any Author declaration.
      if (reverted.has(name) && Origin.isAuthor(origin)) {
        return;
      }

      // If the property is already set by a more specific declaration, skip.
      if (properties.get(name).isNone()) {
        // If the declaration comes from a shorthand, it is pre-parsed in a
        // Value. Otherwise, we only have the string and need to parse it
        // (avoid parsing everything before we know we'll need it).

        value.either(
          registerParsed(Longhands.propName(name), declaration),
          (declared) =>
            parseLonghand(property, declared, variables).forEach(
              registerParsed(Longhands.propName(name), declaration),
            ),
        );
      }
    }

    for (const [declaration, origin] of declarations) {
      const { name, value } = declaration;

      if (Longhands.isName(name)) {
        register(name, Right.of(value), declaration, origin);
      } else if (Shorthands.isName(name)) {
        for (const result of parseShorthand(
          Shorthands.get(name),
          value,
          variables,
        )) {
          for (const [name, value] of result) {
            register(name, Left.of(value), declaration, origin);
          }
        }
      }
    }

    return new Style(owner, device, parent, variables, properties);
  }

  private static _empty = new Style(
    None,
    Device.standard(),
    None,
    Map.empty(),
    Map.empty(),
  );

  public static empty(): Style {
    return this._empty;
  }

  private readonly _owner: Option<Element>;
  private readonly _device: Device;
  private readonly _parent: Option<Style>;
  private readonly _variables: Map<string, Value<Slice<Token>>>;
  private readonly _properties: Map<Name, Value>;

  // We cache computed values but not specified values, as these are
  // inexpensive to resolve from cascaded and computed values;
  // nor used values, as in our case they are inexpensive to resolve
  // from computed values.
  private _computed = Map.empty<Name, Value>();

  protected constructor(
    owner: Option<Element>,
    device: Device,
    parent: Option<Style>,
    variables: Map<string, Value<Slice<Token>>>,
    properties: Map<Name, Value>,
  ) {
    this._owner = owner;
    this._device = device;
    this._parent = parent;
    this._variables = variables;
    this._properties = properties;
  }

  public get owner(): Option<Element> {
    return this._owner;
  }

  public get device(): Device {
    return this._device;
  }

  public get parent(): Style {
    return this._parent.getOrElse(() => Style._empty);
  }

  public get variables(): Map<string, Value<Slice<Token>>> {
    return this._variables;
  }

  public get properties(): Map<string, Value> {
    return this._properties;
  }

  public root(): Style {
    return this._parent.map((parent) => parent.root()).getOr(this);
  }

  /**
   * {@link https://www.w3.org/TR/css-cascade/#cascaded}
   */
  public cascaded<N extends Name>(name: N): Option<Value<Style.Cascaded<N>>> {
    return this._properties.get(Longhands.propName(name)) as Option<
      Value<Style.Cascaded<N>>
    >;
  }

  /**
   * {@link https://www.w3.org/TR/css-cascade/#specified}
   */
  public specified<N extends Name>(name: N): Value<Style.Specified<N>> {
    const { inherits } = Longhands.get(name);

    return this.cascaded(name)
      .map((cascaded) => {
        const { value, source } = cascaded;

        if (Keyword.isKeyword(value)) {
          switch (value.value) {
            // https://drafts.csswg.org/css-cascade/#initial
            case "initial":
              return this.initial(name, source);

            // https://drafts.csswg.org/css-cascade/#inherit
            case "inherit":
              return this.inherited(name);

            // https://drafts.csswg.org/css-cascade/#inherit-initial
            case "unset":
              return inherits
                ? this.inherited(name)
                : this.initial(name, source);
          }
        }

        return cascaded as Value<Style.Specified<N>>;
      })
      .getOrElse(() =>
        inherits
          ? this._parent
              .map((parent) => parent.computed(name))
              .getOrElse(() => this.initial(name))
          : this.initial(name),
      );
  }

  /**
   * {@link https://www.w3.org/TR/css-cascade/#computed}
   */
  public computed<N extends Name>(name: N): Value<Style.Computed<N>> {
    if (this === Style._empty) {
      return this.initial(name);
    }

    if (!this._computed.has(name)) {
      // Keeping semi-useless variables to reduce the any-pollution to a single call
      const compute = Longhands.get(name).compute;
      const specified = this.specified(name);
      // Typescript is completely struggling on this one.
      // Essentially, N has to be assumed as Name at this point. TS lost the fact
      // that specified and compute refer to the same property.
      // So, it has specified of type S1 | S2 | …, and compute of type
      // S1 -> C1 | S2 -> C2 | …, but no link to the fact that the same should
      // be used in both.
      // The union of functions is exploded as (S1 & S2 & …) -> (C1 | C2 | …)
      // due to contravariance. But the Si tend to be unions, and the
      // intersection of union is expanded a bit too greedily by TS and reaches
      // its union size limit of 100,000 term (!)
      // So, we just skip type checking here…
      //
      // See https://github.com/microsoft/TypeScript/issues/53234
      const computed = compute(specified as any, this) as Value<
        Style.Computed<N>
      >;

      this._computed = this._computed.set(name, computed);
    }

    return (
      this._computed
        .get(name)
        // The previous block ensure we've set the value.
        .getUnsafe(`Computed style for ${name} does not exists`) as Value<
        Style.Computed<N>
      >
    );
  }

  /**
   * {@link https://www.w3.org/TR/css-cascade/#used}
   *
   * @remarks
   * In our case, we do not resolve further (e.g., `width: auto`).
   * However, we filter out properties that do not apply to certain elements.
   */
  public used<N extends Name>(name: N): Option<Value<Style.Computed<N>>> {
    const use = Longhands.get(name).use;

    // Here also, TS is struggling with links between properties of the same
    // Longhand, and need a bit of help.
    return use(this.computed(name) as any, this) as Option<
      Value<Style.Computed<N>>
    >;
  }

  public initial<N extends Name>(
    name: N,
    source: Option<Declaration> = None,
  ): Value<Style.Initial<N>> {
    return Value.of(Longhands.get(name).initial as Style.Computed<N>, source);
  }

  public inherited<N extends Name>(name: N): Value<Style.Inherited<N>> {
    return this.parent.computed(name);
  }

  public toJSON(): Style.JSON {
    return {
      device: this._device.toJSON(),
      variables: [...this._variables].map(([name, value]) => [
        name,
        value.toJSON(),
      ]),
      properties: [...this._properties].map(([name, value]) => [
        name,
        value.toJSON(),
      ]),
    };
  }
}

/**
 * @public
 */
export namespace Style {
  export interface JSON {
    [key: string]: json.JSON;
    device: Device.JSON;
    variables: Array<[string, Value.JSON]>;
    properties: Array<[string, Value.JSON]>;
  }

  const cache = Cache.empty<Device, Cache<Element, Cache<Context, Style>>>();

  /**
   * Build the style of an element.
   *
   * @remarks
   * This gather all style declarations that apply to the element, in decreasing
   * precedence (according to cascade sort order) and delegate the rest of the
   * work to `Style.of`.
   */
  export function from(
    element: Element,
    device: Device,
    context: Context = Context.empty(),
  ): Style {
    return cache
      .get(device, Cache.empty)
      .get(element.freeze(), Cache.empty)
      .get(context, () => {
        const declarations: Array<[Declaration, Origin]> = [];

        const root = element.root();

        if (Document.isDocument(root) || Shadow.isShadow(root)) {
          const cascade = Cascade.from(root, device);

          // Walk up the cascade, starting from the node associated to the
          // element, and gather all declarations met on the way.
          // The cascade has been build in decreasing precedence as we move up
          // (highest precedence rules are at the bottom), thus the declarations
          // are seen in decreasing precedence and pushed to the end of the
          // existing list which is thus also ordered in decreasing precedence.
          for (const node of cascade
            .get(element, context)
            .inclusiveAncestors()) {
            declarations.push(
              ...Iterable.reverse(
                Iterable.map<Declaration, [Declaration, Origin]>(
                  node.block.declarations,
                  (declaration) => [declaration, node.block.precedence.origin],
                ),
              ),
            );
          }
        } else {
          // If the element is not part of a Document, this is likely
          // a standalone code snippet. In that case, we still want
          // to gather the `style` attribute.
          declarations.push(
            ...element.style
              .map((block) =>
                Iterable.reverse(
                  Iterable.map<Declaration, [Declaration, Origin]>(
                    block.declarations,
                    (declaration) => [
                      declaration,
                      declaration.important
                        ? Origin.ImportantAuthor
                        : Origin.NormalAuthor,
                    ],
                  ),
                ),
              )
              .getOr([]),
          );
        }

        return Style.of(
          declarations,
          device,
          element
            .parent(Node.flatTree)
            .filter(Element.isElement)
            .map((parent) => from(parent, device, context)),
          Option.of(element),
        );
      });
  }

  export type Declared<N extends Name> = Longhands.Declared<N>;

  export type Cascaded<N extends Name> = Longhands.Cascaded<N>;

  export type Specified<N extends Name> = Longhands.Specified<N>;

  export type Computed<N extends Name> = Longhands.Computed<N>;

  export type Initial<N extends Name> = Longhands.Initial<N>;

  export type Inherited<N extends Name> = Longhands.Inherited<N>;

  export const {
    getOffsetParent,
    getPositioningParent,
    hasBorder,
    hasBoxShadow,
    hasCascadedStyle,
    hasComputedStyle,
    hasInitialComputedStyle,
    hasPositioningParent,
    hasOutline,
    hasSpecifiedStyle,
    hasTextDecoration,
    hasTransparentBackground,
    hasUsedStyle,
    isFlexOrGridChild,
    isFocusable,
    isImportant,
    isInert,
    isPositioned,
    isTabbable,
    isVisibleShadow,
  } = element;

  export const { innerText, isRendered, isVisible, isScrolledBehind } = node;

  export const { isBlockContainer, isFlexContainer, isGridContainer } =
    predicates;

  export const { hasHyphenationOpportunity, hasSoftWrapOpportunity } = text;
}

function parseLonghand<N extends Longhands.PropName>(
  property: Longhands.Property[N],
  value: string,
  variables: Map<string, Value<Slice<Token>>>,
): Result<Style.Declared<N>, string> {
  const substitution = Variable.substitute(Lexer.lex(value), variables);

  if (!substitution.isSome()) {
    return Result.of(Keyword.of("unset"));
  }

  const [tokens, substituted] = substitution.get();

  const parse = property.parse as Longhand.Parser<Style.Declared<N>>;

  const result = parse(trim(tokens)).map(([, value]) => value);

  if (result.isErr() && substituted) {
    return Result.of(Keyword.of("unset"));
  }

  return result;
}

function parseShorthand<N extends Shorthands.Name>(
  shorthand: Shorthands.Property[N],
  value: string,
  variables: Map<string, Value<Slice<Token>>>,
): Result<
  Iterable<
    {
      [M in Shorthands.Longhands<N>]: readonly [M, Longhands.Declared<M>];
    }[Shorthands.Longhands<N>]
  >,
  string
> {
  const substitution = Variable.substitute(Lexer.lex(value), variables);
  // The typing are ensured by the construction of Shorthands.Longhands<N>. We should
  // nonetheless try and find a way to enforce it automatically. Probably by
  // adding the shorthand name in the typing of Shorthand.
  const longhands = shorthand.properties as Iterable<Shorthands.Longhands<N>>;
  const parse = shorthand.parse as Shorthand.Parser<Shorthands.Longhands<N>>;

  if (!substitution.isSome()) {
    // If the substitution failed, the declaration is syntactically invalid,
    // and acts as unset.
    // See https://drafts.csswg.org/css-variables/#invalid-variables
    return Result.of(
      Iterable.map(
        longhands,
        (property) => [property, Keyword.of("unset")] as const,
      ),
    );
  }

  // Perform variable substitution and parse the result.
  const [tokens, substituted] = substitution.get();
  const result = parse(trim(tokens)).map(([, value]) => {
    // If we get a single keyword (instead of an iterable of [longhand, value]),
    // it must be a global keyword, apply to all longhands.
    if (Keyword.isKeyword(value)) {
      return Iterable.map(longhands, (property) => [property, value] as const);
    }

    return value;
  });

  // If there is an error following a substitution, the declaration is discarded
  // and acts as unset.
  // See https://drafts.csswg.org/css-variables/#invalid-variables
  if (result.isErr() && substituted) {
    return Result.of(
      Iterable.map(
        longhands,
        (property) => [property, Keyword.of("unset")] as const,
      ),
    );
  }

  // Otherwise (no error or no substitution), return the result (value or error).
  return result;
}

function trim(tokens: Slice<Token>): Slice<Token> {
  return tokens.trim(Token.isWhitespace);
}
