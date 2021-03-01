import { Cache } from "@siteimprove/alfa-cache";
import { Cascade } from "@siteimprove/alfa-cascade";
import { Lexer, Keyword, Component, Token } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element, Declaration, Document, Shadow } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Option, None } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Result } from "@siteimprove/alfa-result";
import { Context } from "@siteimprove/alfa-selector";
import { Set } from "@siteimprove/alfa-set";
import { Slice } from "@siteimprove/alfa-slice";

import * as json from "@siteimprove/alfa-json";

import { Property } from "./property";
import { Value } from "./value";

const { delimited, left, map, option, pair, right, takeUntil } = Parser;

type Name = Property.Name;

export class Style implements Serializable {
  public static of(
    declarations: Iterable<Declaration>,
    device: Device,
    parent: Option<Style> = None
  ): Style {
    // First pass: Resolve cascading variables which will be used in the second
    // pass.
    const variables = new Map<string, Value<Slice<Token>>>();

    for (const declaration of declarations) {
      const { name, value } = declaration;

      if (name.startsWith("--")) {
        const previous = variables.get(name);

        if (
          previous === undefined ||
          shouldOverride(previous.source, declaration)
        ) {
          variables.set(
            name,
            Value.of(Lexer.lex(value), Option.of(declaration))
          );
        }
      }
    }

    // Pre-substitute the resolved cascading variables from above, replacing
    // any `var()` function references with their substituted tokens.
    for (const [name, variable] of variables) {
      const substitution = substitute(variable.value, variables, parent);

      // If the replaced value is invalid, remove the variable entirely.
      if (substitution.isNone()) {
        variables.delete(name);
      }

      // Otherwise, use the replaced value as the new value of the variable.
      else {
        const [tokens] = substitution.get();

        variables.set(name, Value.of(tokens, variable.source));
      }
    }

    // Second pass: Resolve cascading properties using the cascading variables
    // from the first pass.
    const properties = new Map<Name, Value>();

    for (const declaration of declarations) {
      const { name, value } = declaration;

      if (Property.isName(name)) {
        const previous = properties.get(name);

        if (
          previous === undefined ||
          shouldOverride(previous.source, declaration)
        ) {
          for (const result of parseLonghand(
            Property.get(name),
            value,
            variables,
            parent
          )) {
            properties.set(name, Value.of(result, Option.of(declaration)));
          }
        }
      } else if (Property.Shorthand.isName(name)) {
        for (const result of parseShorthand(
          Property.Shorthand.get(name),
          value,
          variables,
          parent
        )) {
          for (const [name, value] of result) {
            const previous = properties.get(name);

            if (
              previous === undefined ||
              shouldOverride(previous.source, declaration)
            ) {
              properties.set(name, Value.of(value, Option.of(declaration)));
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
    new Map(),
    new Map()
  );

  public static empty(): Style {
    return this._empty;
  }

  private readonly _device: Device;
  private readonly _parent: Option<Style>;
  private readonly _variables: ReadonlyMap<string, Value<Slice<Token>>>;
  private readonly _properties: ReadonlyMap<Name, Value>;

  // We cache computed properties but not specified properties as these are
  // inexpensive to resolve from cascaded and computed properties.
  private readonly _computed = new Map<Name, Value>();

  private constructor(
    device: Device,
    parent: Option<Style>,
    variables: ReadonlyMap<string, Value<Slice<Token>>>,
    properties: ReadonlyMap<Name, Value>
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

  public get variables(): ReadonlyMap<string, Value<Slice<Token>>> {
    return this._variables;
  }

  public get properties(): ReadonlyMap<string, Value> {
    return this._properties;
  }

  public root(): Style {
    return this._parent.map((parent) => parent.root()).getOr(this);
  }

  public cascaded<N extends Name>(name: N): Option<Value<Style.Cascaded<N>>> {
    return Option.from(this._properties.get(name)) as Option<
      Value<Style.Cascaded<N>>
    >;
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
      .getOrElse(() => {
        if (inherits === false) {
          return this.initial(name);
        }

        return this._parent
          .map((parent) => parent.computed(name))
          .getOrElse(() => this.initial(name));
      });
  }

  public computed<N extends Name>(name: N): Value<Style.Computed<N>> {
    if (this === Style._empty) {
      return this.initial(name);
    }

    let value = this._computed.get(name);

    if (value === undefined) {
      value = Property.get(name).compute(
        this.specified(name) as Value<Style.Specified<Name>>,
        this
      );

      this._computed.set(name, value);
    }

    return value as Value<Style.Computed<N>>;
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
            .parent({ flattened: true })
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
}

function shouldOverride(
  previous: Option<Declaration>,
  next: Declaration
): boolean {
  return (
    next.important && previous.every((declaration) => !declaration.important)
  );
}

function parseLonghand<N extends Property.Name>(
  property: Property.WithName<N>,
  value: string,
  variables: ReadonlyMap<string, Value<Slice<Token>>>,
  parent: Option<Style>
) {
  const substitution = substitute(Lexer.lex(value), variables, parent);

  if (substitution.isNone()) {
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
  variables: ReadonlyMap<string, Value<Slice<Token>>>,
  parent: Option<Style>
) {
  const substitution = substitute(Lexer.lex(value), variables, parent);

  if (substitution.isNone()) {
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
  variables: ReadonlyMap<string, Value<Slice<Token>>>,
  parent: Option<Style>,
  fallback: Option<Slice<Token>> = None,
  visited = Set.empty<string>()
): Option<Slice<Token>> {
  return (
    Option.from(variables.get(name))
      .map((value) =>
        // The initial value of a custom property is the "guaranteed-invalid"
        // value. We therefore reject the value of the variable if it's the
        // keyword `initial`.
        // https://drafts.csswg.org/css-variables/#guaranteed-invalid
        Option.of(value.value).reject((tokens) => parseInitial(tokens).isOk())
      )

      // If the value of the variable is invalid, as indicated by it being
      // `None`, we instead use the fallback value, if available.
      // https://drafts.csswg.org/css-variables/#invalid-variables
      .orElse(() =>
        fallback
          // Substitute any additional cascading variables within the fallback
          // value.
          .map((tokens) =>
            substitute(tokens, variables, parent, visited.add(name)).map(
              ([tokens]) => tokens
            )
          )
      )

      .getOrElse(() =>
        parent.flatMap((parent) => {
          const variables = parent.variables;

          const grandparent =
            parent.parent === Style.empty() ? None : Option.of(parent.parent);

          return resolve(name, variables, grandparent).flatMap((tokens) =>
            substitute(tokens, variables, grandparent).map(([tokens]) => tokens)
          );
        })
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
 * invalid `var()` functions are encountered, `null` is returned.
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
  variables: ReadonlyMap<string, Value<Slice<Token>>>,
  parent: Option<Style>,
  visited = Set.empty<string>()
): Option<[tokens: Slice<Token>, substituted: boolean]> {
  const replaced: Array<Token> = [];

  let substituted = false;

  while (tokens.length > 0) {
    const next = tokens.array[tokens.offset];

    if (next.type === "function" && next.value === "var") {
      const result = parseVar(tokens);

      if (result.isErr()) {
        return None;
      }

      let name: string;
      let fallback: Option<Slice<Token>>;

      [tokens, [name, fallback]] = result.get();

      if (visited.has(name)) {
        return None;
      }

      const value = resolve(name, variables, parent, fallback, visited);

      if (value.isNone()) {
        return None;
      }

      replaced.push(...value.get());
      substituted = true;
    } else {
      replaced.push(next);
      tokens = tokens.slice(1);
    }
  }

  // If substitution occurred and the number of replaced tokens has exceeded
  // the substitution limit, bail out.
  if (substituted && replaced.length > substitutionLimit) {
    return None;
  }

  return Option.of([Slice.of(replaced), substituted]);
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
