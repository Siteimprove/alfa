import { Array } from "@siteimprove/alfa-array";
import { Cache } from "@siteimprove/alfa-cache";
import { Cascade } from "@siteimprove/alfa-cascade";
import { Keyword, Lexer, Token } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import {
  Declaration,
  Document,
  Element,
  Node,
  Shadow,
} from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import * as json from "@siteimprove/alfa-json";
import { Serializable } from "@siteimprove/alfa-json";
import { Map } from "@siteimprove/alfa-map";
import { None, Option } from "@siteimprove/alfa-option";
import { Result } from "@siteimprove/alfa-result";
import { Context } from "@siteimprove/alfa-selector";
import { Slice } from "@siteimprove/alfa-slice";

import * as element from "./element/element";
import * as node from "./node/node";

import { Longhand } from "./longhand";
import { Longhands } from "./longhands";
import { Shorthand } from "./shorthand";
import { Shorthands } from "./shorthands";

import { Value } from "./value";
import { Variable } from "./variable";

type Name = Longhands.Name;

/**
 * @public
 */
export class Style implements Serializable<Style.JSON> {
  public static of(
    styleDeclarations: Iterable<Declaration>,
    device: Device,
    parent: Option<Style> = None
  ): Style {
    // declarations are read twice, once for variables and once for properties,
    // so we cannot use a read-once iterable. Main use case from `Style.from`
    // is already sending an Array, so this is inexpensive
    const declarations = Array.from(styleDeclarations);

    /**
     * First pass, substitute all variable by their definition
     */
    const declaredVariables = Variable.gather(declarations, shouldOverride);

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
     */
    let properties = Map.empty<Name, Value>();

    for (const declaration of declarations) {
      const { name, value } = declaration;

      if (Longhands.isName(name)) {
        const previous = properties.get(name);

        if (shouldOverride(previous, declaration)) {
          for (const result of parseLonghand(
            Longhands.get(name),
            value,
            variables
          )) {
            properties = properties.set(
              name,
              Value.of(result, Option.of(declaration))
            );
          }
        }
      } else if (Shorthands.isName(name)) {
        for (const result of parseShorthand(
          Shorthands.get(name),
          value,
          variables
        )) {
          for (const [name, value] of result) {
            const previous = properties.get(name);

            if (shouldOverride(previous, declaration)) {
              properties = properties.set(
                name,
                Value.of(value, Option.of(declaration))
              );
            }
          }
        }
      }
    }

    return new Style(device, parent, variables, properties);
  }

  private static _empty = new Style(
    Device.standard(),
    None,
    Map.empty(),
    Map.empty()
  );

  public static empty(): Style {
    return this._empty;
  }

  private readonly _device: Device;
  private readonly _parent: Option<Style>;
  private readonly _variables: Map<string, Value<Slice<Token>>>;
  private readonly _properties: Map<Name, Value>;

  // We cache computed properties but not specified properties as these are
  // inexpensive to resolve from cascaded and computed properties.
  private _computed = Map.empty<Name, Value>();

  private constructor(
    device: Device,
    parent: Option<Style>,
    variables: Map<string, Value<Slice<Token>>>,
    properties: Map<Name, Value>
  ) {
    this._device = device;
    this._parent = parent;
    this._variables = variables;
    this._properties = properties;
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

  public cascaded<N extends Name>(name: N): Option<Value<Style.Cascaded<N>>> {
    return this._properties.get(name) as Option<Value<Style.Cascaded<N>>>;
  }

  public specified<N extends Name>(name: N): Value<Style.Specified<N>> {
    const {
      options: { inherits },
    } = Longhands.get(name);

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
          : this.initial(name)
      );
  }

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

  public initial<N extends Name>(
    name: N,
    source: Option<Declaration> = None
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

  export function from(
    element: Element,
    device: Device,
    context: Context = Context.empty()
  ): Style {
    return cache
      .get(device, Cache.empty)
      .get(element.freeze(), Cache.empty)
      .get(context, () => {
        const declarations: Array<Declaration> = element.style
          .map((block) => [...block.declarations].reverse())
          .getOr([]);

        const root = element.root();

        if (Document.isDocument(root) || Shadow.isShadow(root)) {
          const cascade = Cascade.of(root, device);

          let next = cascade.get(element, context);

          while (next.isSome()) {
            const node = next.get();

            declarations.push(...[...node.declarations].reverse());
            next = node.parent;
          }
        }

        return Style.of(
          declarations,
          device,
          element
            .parent(Node.flatTree)
            .filter(Element.isElement)
            .map((parent) => from(parent, device, context))
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
    hasCascadedValueDeclaredInInlineStyleOf,
    hasComputedStyle,
    hasInlineStyleProperty,
    hasPositioningParent,
    hasOutline,
    hasSpecifiedStyle,
    hasTextDecoration,
    hasTransparentBackground,
    isFocusable,
    isImportant,
    isInert,
    isPositioned,
    isTabbable,
    isVisibleShadow,
  } = element;

  export const { isRendered, isVisible } = node;
}

/**
 * The "next" declaration should override the previous if:
 * - either there is no previous; or
 * - next is important and previous isn't.
 * This suppose that the declarations have been pre--ordered in decreasing
 * specificity.
 *
 * @internal
 */
export function shouldOverride<T>(
  previous: Option<Value<T>>,
  next: Declaration
): boolean {
  return previous.every(
    (previous) =>
      next.important &&
      previous.source.every((declaration) => !declaration.important)
  );
}

function parseLonghand<N extends Longhands.Name>(
  property: Longhands.Property[N],
  value: string,
  variables: Map<string, Value<Slice<Token>>>
) {
  const substitution = Variable.substitute(Lexer.lex(value), variables);

  if (!substitution.isSome()) {
    return Result.of(Keyword.of("unset"));
  }

  const [tokens, substituted] = substitution.get();

  const parse = property.parse as unknown as Longhand.Parser<N>;

  const result = parse(trim(tokens)).map(([, value]) => value);

  if (result.isErr() && substituted) {
    return Result.of(Keyword.of("unset"));
  }

  return result;
}

function parseShorthand<N extends Shorthands.Name>(
  shorthand: Shorthands.Property[N],
  value: string,
  variables: Map<string, Value<Slice<Token>>>
) {
  const substitution = Variable.substitute(Lexer.lex(value), variables);

  if (!substitution.isSome()) {
    return Result.of(
      Iterable.map(
        shorthand.properties,
        (property) => [property, Keyword.of("unset")] as const
      )
    );
  }

  const [tokens, substituted] = substitution.get();

  const parse = shorthand.parse as Shorthand.Parser;

  const result = parse(trim(tokens)).map(([, value]) => {
    if (Keyword.isKeyword(value)) {
      return Iterable.map(
        shorthand.properties,
        (property) => [property, value] as const
      );
    }

    return value;
  });

  if (result.isErr() && substituted) {
    return Result.of(
      Iterable.map(
        shorthand.properties,
        (property) => [property, Keyword.of("unset")] as const
      )
    );
  }

  return result;
}

function trim(tokens: Slice<Token>): Slice<Token> {
  return tokens.trim(Token.isWhitespace);
}
