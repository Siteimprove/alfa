import { Cache } from "@siteimprove/alfa-cache";
import { Cascade } from "@siteimprove/alfa-cascade";
import { Lexer, Keyword, Component, Token } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element, Declaration, Document, Shadow } from "@siteimprove/alfa-dom";
import { Either } from "@siteimprove/alfa-either";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Map } from "@siteimprove/alfa-map";
import { None, Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Record } from "@siteimprove/alfa-record";
import { Set } from "@siteimprove/alfa-set";
import { Slice } from "@siteimprove/alfa-slice";

import * as json from "@siteimprove/alfa-json";

import { Property } from "./property";
import { Value } from "./value";

const { takeUntil, map, either, option, pair, right, left, eof } = Parser;

type Name = Property.Name;

export class Style implements Serializable {
  public static of(
    declarations: Iterable<Declaration>,
    device: Device,
    parent: Option<Style> = None
  ): Style {
    declarations = Array.from(declarations);

    // First pass: Resolve cascading variables which will be used in the second
    // pass.
    let variables = Map.empty<string, Value<Array<Token>>>();

    for (const declaration of declarations) {
      const { name, value } = declaration;

      if (name.startsWith("--")) {
        if (
          variables
            .get(name)
            .every((previous) => shouldOverride(previous.source, declaration))
        ) {
          const tokens = Lexer.lex(value);

          variables = variables.set(
            name,
            Value.of(tokens, Option.of(declaration))
          );
        }
      }
    }

    // Pre-substitute the resolved cascading variables from above, replacing
    // any `var()` function references with their substituted tokens.
    for (const [name, variable] of variables) {
      const value = substitute(variable.value, variables, parent);

      // If the replaced value is invalid, remove the variable entirely.
      if (value.isNone()) {
        variables = variables.delete(name);
      }

      // Otherwise, use the replaced value as the new value of the variable.
      else {
        variables = variables.set(
          name,
          Value.of(value.get().get(), variable.source)
        );
      }
    }

    // Second pass: Resolve cascading properties using the cascading variables
    // from the first pass.
    let properties = Map.empty<Name, Value>();

    for (const declaration of declarations) {
      const { name, value } = declaration;

      if (Property.isName(name)) {
        if (
          properties
            .get(name)
            .every((previous) => shouldOverride(previous.source, declaration))
        ) {
          const property = Property.get(name);

          for (const result of parseLonghand(
            property,
            value,
            variables,
            parent
          )) {
            properties = properties.set(
              name,
              Value.of(result, Option.of(declaration))
            );
          }
        }
      }

      if (Property.Shorthand.isName(name)) {
        const shorthand = Property.Shorthand.get(name);

        for (const result of parseShorthand(
          shorthand,
          value,
          variables,
          parent
        )) {
          for (const [name, value] of result) {
            if (
              properties
                .get(name)
                .every((previous) =>
                  shouldOverride(previous.source, declaration)
                )
            ) {
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
  private readonly _variables: Map<string, Value<Array<Token>>>;
  private readonly _properties: Map<Name, Value>;

  // We cache computed properties but not specified properties as these are
  // inexpensive to resolve from cascaded and computed properties.
  private readonly _computed = Cache.empty<Name, Value>();

  private constructor(
    device: Device,
    parent: Option<Style>,
    variables: Map<string, Value<Array<Token>>>,
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

  public get variables(): Iterable<[string, Value<Array<Token>>]> {
    return this._variables;
  }

  public get properties(): Iterable<[string, Value]> {
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
              return this.initial(name);

            // https://drafts.csswg.org/css-cascade/#inherit
            case "inherit":
              return this.inherited(name);

            // https://drafts.csswg.org/css-cascade/#inherit-initial
            case "unset":
              return inherits ? this.inherited(name) : this.initial(name);
          }
        }

        return Value.of(value, source);
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

    return this._computed.get(name, () =>
      Property.get(name).compute(this)
    ) as Value<Style.Computed<N>>;
  }

  public initial<N extends Name>(name: N): Value<Style.Initial<N>> {
    return Value.of(Property.get(name).initial as Style.Computed<N>);
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

  const cache = Cache.empty<Device, Cache<Element, Style>>();

  export function from(element: Element, device: Device): Style {
    return cache.get(device, Cache.empty).get(element.freeze(), () => {
      const declarations: Array<Declaration> = element.style
        .map((block) => [...block.declarations].reverse())
        .getOr([]);

      const root = element.root();

      if (Document.isDocument(root) || Shadow.isShadow(root)) {
        const cascade = Cascade.from(root, device);

        let next = cascade.get(element);

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
          .map((parent) => from(parent, device))
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
  variables: Map<string, Value<Array<Token>>>,
  parent: Option<Style>
) {
  const tokens = substitute(Lexer.lex(value), variables, parent);

  if (tokens.isNone()) {
    return Option.of(Keyword.of("unset"));
  }

  const result = left(
    either(
      Keyword.parse("initial", "inherit", "unset"),
      property.parse as Parser<Slice<Token>, Property.Value.Parsed<N>, string>
    ),
    eof(() => "Expected end of input")
  )(Slice.of(trim(tokens.get().get())))
    .map(([, value]) => value)
    .ok();

  if (result.isNone() && tokens.get().isRight()) {
    return Option.of(Keyword.of("unset"));
  }

  return result;
}

function parseShorthand<N extends Property.Shorthand.Name>(
  shorthand: Property.Shorthand.WithName<N>,
  value: string,
  variables: Map<string, Value<Array<Token>>>,
  parent: Option<Style>
) {
  const tokens = substitute(Lexer.lex(value), variables, parent);

  if (tokens.isNone()) {
    return Option.of(
      Record.from(
        Iterable.map(shorthand.properties, (property) => [
          property,
          Keyword.of("unset"),
        ])
      )
    );
  }

  const result = left(
    either(
      Keyword.parse("initial", "inherit", "unset"),
      shorthand.parse as Parser<
        Slice<Token>,
        Record<{ [N in Property.Name]?: Property.Value.Parsed<N> }>,
        string
      >
    ),
    eof(() => "Expected end of input")
  )(Slice.of(trim(tokens.get().get())))
    .map(([, value]) => {
      if (Keyword.isKeyword(value)) {
        return Record.from(
          Iterable.map(shorthand.properties, (property) => [property, value])
        );
      }

      return value;
    })
    .ok();

  if (result.isNone() && tokens.get().isRight()) {
    return Option.of(
      Record.from(
        Iterable.map(shorthand.properties, (property) => [
          property,
          Keyword.of("unset"),
        ])
      )
    );
  }

  return result;
}

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
  variables: Map<string, Value<Array<Token>>>,
  parent: Option<Style>,
  fallback: Option<Array<Token>> = None,
  visited = Set.empty<string>()
): Option<Array<Token>> {
  return (
    variables
      .get(name)
      .map((value) =>
        // The initial value of a custom property is the "guaranteed-invalid"
        // value. We therefore reject the value of the variable if it's the
        // keyword `initial`.
        // https://drafts.csswg.org/css-variables/#guaranteed-invalid
        Option.of(value.value).reject((tokens) =>
          Keyword.parse("initial")(Slice.of(tokens)).isOk()
        )
      )

      // If the value of the variable is invalid, as indicated by it being
      // `None`, we instead use the fallback value, if available.
      // https://drafts.csswg.org/css-variables/#invalid-variables
      .orElse(() =>
        fallback
          // Substitute any additional cascading variables within the fallback
          // value.
          .map((tokens) =>
            substitute(
              tokens,
              variables,
              parent,
              visited.add(name)
            ).map((substituted) => substituted.get())
          )
      )

      .getOrElse(() =>
        parent.flatMap((parent) => {
          const variables = Map.from(parent.variables);
          const grandparent =
            parent.parent === Style.empty() ? None : Option.of(parent.parent);

          return resolve(name, variables, grandparent).flatMap((tokens) =>
            substitute(tokens, variables, grandparent).map((substituted) =>
              substituted.get()
            )
          );
        })
      )
  );
}

/**
 * The maximum allowed number of tokens that declaration values with `var()`
 * functions may expand to.
 *
 * @see https://drafts.csswg.org/css-variables/#long-variables
 */
const substitutionLimit = 1024;

/**
 * Substitute `var()` functions in an array of tokens. If any tokens are
 * substituted, the result will be wrapped in `Right`, otherwise `Left`. If
 * any syntactically invalid `var()` functions are encountered, `None` is
 * returned.
 *
 * @see https://drafts.csswg.org/css-variables/#substitute-a-var
 *
 * @remarks
 * This method uses a set of visited names to detect cyclic dependencies
 * between cascading variables. The set is local to each `Style` instance as
 * cyclic references can only occur between cascading variables defined on the
 * same element.
 */
function substitute(
  tokens: Array<Token>,
  variables: Map<string, Value<Array<Token>>>,
  parent: Option<Style>,
  visited = Set.empty<string>()
): Option<Either<Array<Token>>> {
  const replaced: Array<Token> = [];

  let offset = 0;
  let substituted = false;

  while (offset < tokens.length) {
    const next = tokens[offset];

    if (next.type === "function" && next.value === "var") {
      const result = parseVar(Slice.of(tokens, offset));

      if (result.isErr()) {
        return None;
      }

      const [remainder, [name, fallback]] = result.get();

      if (visited.has(name.value)) {
        return None;
      }

      const value = resolve(name.value, variables, parent, fallback, visited);

      if (value.isNone()) {
        return None;
      }

      replaced.push(...value.get());
      offset = remainder.offset;
      substituted = true;
    } else {
      replaced.push(next);
      offset++;
    }
  }

  // If substitution occurred and the number of replaced tokens has exceeded
  // the substitution limit, bail out.
  if (substituted && replaced.length > substitutionLimit) {
    return None;
  }

  return Option.of(
    substituted ? Either.right(replaced) : Either.left(replaced)
  );
}

function trim(tokens: Array<Token>): Array<Token> {
  while (tokens.length > 0 && Token.isWhitespace(tokens[0])) {
    tokens.splice(0, 1);
  }

  while (tokens.length > 0 && Token.isWhitespace(tokens[tokens.length - 1])) {
    tokens.splice(tokens.length - 1, 1);
  }

  return tokens;
}

/**
 * @see https://drafts.csswg.org/css-variables/#funcdef-var
 */
const parseVar = right(
  Token.parseFunction("var"),
  pair(
    Token.parseIdent((ident) => ident.value.startsWith("--")),
    left(
      option(
        right(
          pair(Token.parseComma, option(Token.parseWhitespace)),
          map(
            takeUntil(Component.consume, Token.parseCloseParenthesis),
            (components) => [...Iterable.flatten(components)]
          )
        )
      ),
      Token.parseCloseParenthesis
    )
  )
);
