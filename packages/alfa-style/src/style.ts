import { Array } from "@siteimprove/alfa-array";
import { Cache } from "@siteimprove/alfa-cache";
import { Cascade } from "@siteimprove/alfa-cascade";
import { Lexer, Keyword, Component, Token } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import {
  Element,
  Declaration,
  Document,
  Shadow,
  Node,
} from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Map } from "@siteimprove/alfa-map";
import { Option, None } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Result } from "@siteimprove/alfa-result";
import { Context } from "@siteimprove/alfa-selector";
import { Set } from "@siteimprove/alfa-set";
import { Slice } from "@siteimprove/alfa-slice";

import * as json from "@siteimprove/alfa-json";

import * as element from "./element/element";
import * as node from "./node/node";

import { Property } from "./property";
import { Value } from "./value";

// Properties are registered by means of a side effect that is executed when the
// properties are imported. To ensure that all properties are registered when
// this module is imported, we import the index module which in turn imports the
// individual properties.
import ".";

const { delimited, left, map, option, pair, right, takeUntil } = Parser;

type Name = Property.Name;

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
     * First pass, substitute variable by their definition
     */
    // First step: Gather variables that are declared on the current style
    // The same variable may be declared several times, so we rely on
    // declarations being pre-ordered by decreasing specificity and only take
    // the first declaration
    // This builds a map from variable names to their lexed value
    // i.e. "--foo: lorem ipsum" becomes "foo => [lorem, ipsum]"
    let currentVariables = Map.empty<string, Value<Slice<Token>>>();

    for (const declaration of declarations.filter((declaration) =>
      declaration.name.startsWith("--")
    )) {
      const { name, value } = declaration;
      const previous = currentVariables.get(name);

      if (shouldOverride(previous, declaration)) {
        currentVariables = currentVariables.set(
          name,
          Value.of(Lexer.lex(value), Option.of(declaration))
        );
      }
    }

    // Second step: since CSS variables are always inherited, and inheritance
    // takes precedence over fallback, we can merge the current variables will
    // the parent ones, this will effectively resolve variable inheritance.
    let variables = currentVariables.reduce(
      (vars, value, name) => vars.set(name, value),
      parent
        .map((parent) => parent.variables)
        .getOr(Map.empty<string, Value<Slice<Token>>>())
    );

    // Third step: pre-substitute the resolved cascading variables from above,
    // replacing any `var()` function references with their substituted tokens.
    // This effectively takes care of deleting variables with syntactically
    // invalid values, circular references, too many substitutions, …
    for (const [name, variable] of variables) {
      const substitution = substitute(variable.value, variables);

      // If the replaced value is valid, use the replaced value as the new value of the variable.
      if (substitution.isSome()) {
        const [tokens] = substitution.get();

        variables = variables.set(name, Value.of(tokens, variable.source));
      } else {
        // Otherwise, remove the variable entirely.
        variables = variables.delete(name);
      }
    }

    /**
     * Second pass: Resolve cascading properties using the cascading variables
     * from the first pass.
     */
    let properties = Map.empty<Name, Value>();

    for (const declaration of declarations) {
      const { name, value } = declaration;

      if (Property.isName(name)) {
        const previous = properties.get(name);

        if (shouldOverride(previous, declaration)) {
          for (const result of parseLonghand(
            Property.get(name),
            value,
            variables
          )) {
            properties = properties.set(
              name,
              Value.of(result, Option.of(declaration))
            );
          }
        }
      } else if (Property.Shorthand.isName(name)) {
        for (const result of parseShorthand(
          Property.Shorthand.get(name),
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
    } = Property.get(name);

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
      this._computed = this._computed.set(
        name,
        Property.get(name).compute(
          this.specified(name) as Value<Style.Specified<Name>>,
          this
        )
      );
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
    return Value.of(Property.get(name).initial as Style.Computed<N>, source);
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

  export type Declared<N extends Name> = Property.Value.Declared<N>;

  export type Cascaded<N extends Name> = Property.Value.Cascaded<N>;

  export type Specified<N extends Name> = Property.Value.Specified<N>;

  export type Computed<N extends Name> = Property.Value.Computed<N>;

  export type Initial<N extends Name> = Property.Value.Initial<N>;

  export type Inherited<N extends Name> = Property.Value.Inherited<N>;

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

function shouldOverride<T>(
  previous: Option<Value<T>>,
  next: Declaration
): boolean {
  return previous.every(
    (previous) =>
      next.important &&
      previous.source.every((declaration) => !declaration.important)
  );
}

function parseLonghand<N extends Property.Name>(
  property: Property.WithName<N>,
  value: string,
  variables: Map<string, Value<Slice<Token>>>
) {
  const substitution = substitute(Lexer.lex(value), variables);

  if (!substitution.isSome()) {
    return Result.of(Keyword.of("unset"));
  }

  const [tokens, substituted] = substitution.get();

  const parse = property.parse as Property.Parser;

  const result = parse(trim(tokens)).map(([, value]) => value);

  if (result.isErr() && substituted) {
    return Result.of(Keyword.of("unset"));
  }

  return result;
}

function parseShorthand<N extends Property.Shorthand.Name>(
  shorthand: Property.Shorthand.WithName<N>,
  value: string,
  variables: Map<string, Value<Slice<Token>>>
) {
  const substitution = substitute(Lexer.lex(value), variables);

  if (!substitution.isSome()) {
    return Result.of(
      Iterable.map(
        shorthand.properties,
        (property) => [property, Keyword.of("unset")] as const
      )
    );
  }

  const [tokens, substituted] = substitution.get();

  const parse = shorthand.parse as Property.Shorthand.Parser;

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

const parseInitial = Keyword.parse("initial");

/**
 * Resolve a cascading variable with an optional fallback. The value of the
 * variable, if defined, will have `var()` functions fully substituted.
 *
 * @remarks
 * This method uses a set of visited names to detect cyclic dependencies
 * between cascading variables. The set is local to each `Style` instance as
 * cyclic references can only occur between cascading variables defined on the
 * same element.
 */
function resolve(
  name: string,
  variables: Map<string, Value<Slice<Token>>>,
  fallback: Option<Slice<Token>> = None,
  visited = Set.empty<string>()
): Option<Slice<Token>> {
  return (
    // If the variable is defined on the current style, get its value
    // If it is defined on an ancestor, this will also gets its value since
    // variables maps have been pre-merged.
    variables
      .get(name)
      .map((value) => value.value)

      // The initial value of a custom property is the "guaranteed-invalid"
      // value. We therefore reject the value of the variable if it's the
      // keyword `initial`.
      // https://drafts.csswg.org/css-variables/#guaranteed-invalid
      .reject((tokens) => parseInitial(tokens).isOk())

      // If the value of the variable is invalid, as indicated by it being
      // `None`, we instead use the fallback value, if available.
      // https://drafts.csswg.org/css-variables/#invalid-variables
      .orElse(() =>
        fallback
          // Substitute any additional cascading variables within the fallback
          // value. This substitution happens in the current style's context.
          .flatMap((tokens) =>
            substitute(tokens, variables, visited.add(name)).map(
              ([tokens]) => tokens
            )
          )
      )
  );
}

/**
 * The maximum allowed number of tokens that declaration values with `var()`
 * functions may expand to.
 *
 * {@link https://drafts.csswg.org/css-variables/#long-variables}
 */
const substitutionLimit = 1024;

/**
 * Substitute `var()` functions in an array of tokens. If any syntactically
 * invalid `var()` functions are encountered, `None` is returned.
 *
 * {@link https://drafts.csswg.org/css-variables/#substitute-a-var}
 *
 * @remarks
 * This method uses a set of visited names to detect cyclic dependencies
 * between cascading variables. The set is local to each `Style` instance as
 * cyclic references can only occur between cascading variables defined on the
 * same element.
 */
function substitute(
  tokens: Slice<Token>,
  variables: Map<string, Value<Slice<Token>>>,
  visited = Set.empty<string>()
): Option<[tokens: Slice<Token>, substituted: boolean]> {
  const replaced: Array<Token> = [];

  let substituted = false;

  while (tokens.length > 0) {
    const next = tokens
      .first()
      .getUnsafe("No more tokens. This should not be possible."); // Safe, we just checked that `tokens` is not empty

    if (next.type === "function" && next.value === "var") {
      // If the token is a "var(", process it.
      const result = parseVar(tokens);

      if (result.isErr()) {
        return None;
      }

      let name: string;
      let fallback: Option<Slice<Token>>;

      [tokens, [name, fallback]] = result.get();

      // If we've already seen this variable, bail out (circular reference).
      if (visited.has(name)) {
        return None;
      }

      // Resolve the variable's name within the current context.
      const value = resolve(name, variables, fallback, visited);

      if (!value.isSome()) {
        return None;
      }

      // Push the resulting value, replacing the initial token
      replaced.push(...value.get());
      substituted = true;
    } else {
      // If the token is not a "var(", push it to the result, and move on.
      replaced.push(next);
      tokens = tokens.rest();
    }
  }

  // If substitution occurred and the number of replaced tokens has exceeded
  // the substitution limit, bail out.
  if (substituted && replaced.length > substitutionLimit) {
    return None;
  }

  return Option.of<[tokens: Slice<Token>, substituted: boolean]>([
    Slice.of(replaced),
    substituted,
  ]);
}

function trim(tokens: Slice<Token>): Slice<Token> {
  return tokens.trim(Token.isWhitespace);
}

/**
 * {@link https://drafts.csswg.org/css-variables/#funcdef-var}
 */
const parseVar = right(
  Token.parseFunction("var"),
  pair(
    map(
      delimited(
        option(Token.parseWhitespace),
        Token.parseIdent((ident) => ident.value.startsWith("--"))
      ),
      (ident) => ident.value
    ),
    left(
      option(
        right(
          pair(Token.parseComma, option(Token.parseWhitespace)),
          map(
            takeUntil(Component.consume, Token.parseCloseParenthesis),
            (components) => Slice.of([...Iterable.flatten(components)])
          )
        )
      ),
      Token.parseCloseParenthesis
    )
  )
);
