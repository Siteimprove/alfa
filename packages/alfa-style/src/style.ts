import { Cache } from "@siteimprove/alfa-cache";
import { Cascade } from "@siteimprove/alfa-cascade";
import { Lexer, Keyword, Component, Token } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element, Declaration, Document, Shadow } from "@siteimprove/alfa-dom";
import { Either } from "@siteimprove/alfa-either";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
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
    return new Style(Array.from(declarations), device, parent);
  }

  private static _empty = new Style([], Device.standard(), None);

  public static empty(): Style {
    return this._empty;
  }

  private readonly _device: Device;
  private readonly _parent: Option<Style>;
  private readonly _variables = new Map<string, Array<Token>>();

  // We cache cascaded and computed properties but not specified properties as
  // these are inexpensive to resolve from cascaded and computed properties.
  // Cascaded properties on the other hand require parsing, which is expensive,
  // and computed properties require absolutization, which is also expensive.
  private readonly _cascaded = new Map<Name, Value>();
  private readonly _computed = new Map<Name, Value>();

  private constructor(
    declarations: Array<Declaration>,
    device: Device,
    parent: Option<Style>
  ) {
    this._device = device;
    this._parent = parent;

    // First pass: Resolve cascading variables which will be used in the second
    // pass.
    for (const declaration of declarations) {
      const { name, value } = declaration;

      if (name.startsWith("--") && !this._variables.has(name)) {
        this._variables.set(name, Lexer.lex(value));
      }
    }

    // Second pass: Resolve cascading properties using the cascading variables
    // from the first pass.
    for (const declaration of declarations) {
      const { name, value } = declaration;

      if (Property.isName(name)) {
        const previous = this._cascaded.get(name);

        if (
          previous === undefined ||
          shouldOverride(previous.source, declaration)
        ) {
          const property = Property.get(name);

          for (const result of this._parseLonghand(property, value)) {
            this._cascaded.set(name, Value.of(result, Option.of(declaration)));
          }
        }
      }

      if (Property.Shorthand.isName(name)) {
        const shorthand = Property.Shorthand.get(name);

        for (const result of this._parseShorthand(shorthand, value)) {
          for (const [name, value] of result) {
            const previous = this._cascaded.get(name);

            if (
              previous === undefined ||
              shouldOverride(previous.source, declaration)
            ) {
              this._cascaded.set(name, Value.of(value, Option.of(declaration)));
            }
          }
        }
      }
    }
  }

  public get device(): Device {
    return this._device;
  }

  public get parent(): Style {
    return this._parent.getOrElse(() => Style._empty);
  }

  public root(): Style {
    return this._parent.map((parent) => parent.root()).getOr(this);
  }

  public cascaded<N extends Name>(name: N): Option<Value<Style.Cascaded<N>>> {
    return Option.from(
      this._cascaded.get(name) as Value<Style.Cascaded<N>> | undefined
    );
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

    let value = this._computed.get(name) as
      | Value<Style.Computed<N>>
      | undefined;

    if (value === undefined) {
      value = Property.get(name).compute(this) as Value<Style.Computed<N>>;

      this._computed.set(name, value);
    }

    return value;
  }

  public initial<N extends Name>(name: N): Value<Style.Initial<N>> {
    return Value.of(Property.get(name).initial as Style.Computed<N>);
  }

  public inherited<N extends Name>(name: N): Value<Style.Inherited<N>> {
    return this.parent.computed(name);
  }

  public toJSON(): Style.JSON {
    return {};
  }

  private _parseLonghand<N extends Property.Name>(
    property: Property.WithName<N>,
    value: string
  ) {
    const tokens = this._substitute(Lexer.lex(value));

    if (tokens.isNone()) {
      return Option.of(Keyword.of("unset"));
    }

    const result = left(
      either(
        Keyword.parse("initial", "inherit", "unset"),
        property.parse as Parser<Slice<Token>, Property.Value.Parsed<N>, string>
      ),
      eof(() => "Expected end of input")
    )(Slice.of(tokens.get().get()))
      .map(([, value]) => value)
      .ok();

    if (result.isNone() && tokens.get().isRight()) {
      return Option.of(Keyword.of("unset"));
    }

    return result;
  }

  private _parseShorthand<N extends Property.Shorthand.Name>(
    shorthand: Property.Shorthand.WithName<N>,
    value: string
  ) {
    const tokens = this._substitute(Lexer.lex(value));

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
    )(Slice.of(tokens.get().get()))
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
  private _variable(
    name: string,
    fallback: Option<Array<Token>> = None,
    visited = Set.empty<string>()
  ): Option<Array<Token>> {
    return Option.from(this._variables.get(name))
      .or(fallback)
      .map((tokens) =>
        this._substitute(tokens, visited.add(name)).map((substituted) =>
          substituted.get()
        )
      )
      .getOrElse(() =>
        this._parent.flatMap((parent) =>
          parent
            ._variable(name)
            .flatMap((tokens) =>
              parent._substitute(tokens).map((substituted) => substituted.get())
            )
        )
      );
  }

  /**
   * The maximum allowed number of tokens that declaration values with `var()`
   * functions may expand to.
   *
   * @see https://drafts.csswg.org/css-variables/#long-variables
   */
  private static _substitutionLimit = 1024;

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
  private _substitute(
    tokens: Array<Token>,
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

        const value = this._variable(name.value, fallback, visited);

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
    if (substituted && replaced.length > Style._substitutionLimit) {
      return None;
    }

    return Option.of(
      substituted ? Either.right(replaced) : Either.left(replaced)
    );
  }
}

export namespace Style {
  export interface JSON {
    [key: string]: json.JSON;
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
