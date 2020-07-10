import { Cache } from "@siteimprove/alfa-cache";
import { Cascade } from "@siteimprove/alfa-cascade";
import { Lexer, Keyword, Token, Named } from "@siteimprove/alfa-css";
import { Var } from "@siteimprove/alfa-css/src/value/color/var";
import { Device } from "@siteimprove/alfa-device";
import { Element, Declaration, Document, Shadow } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { None, Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Record } from "@siteimprove/alfa-record";
import { Slice } from "@siteimprove/alfa-slice";

import * as json from "@siteimprove/alfa-json";

import { Property } from "./property";
import { Value } from "./value";

const { either, left, eof } = Parser;

type Name = Property.Name;
type NameOrCustom = Name | Property.Custom.Name; // this is essentially string :-(

export class Style implements Serializable {
  public static of(
    declarations: Iterable<Declaration>,
    device: Device,
    parent: Option<Style> = None,
    debug: boolean = false
  ): Style {
    return new Style(Array.from(declarations), device, parent, debug);
  }

  private static _empty = new Style([], Device.standard(), None);

  public static empty(): Style {
    return this._empty;
  }

  private readonly _device: Device;
  private readonly _parent: Option<Style>;

  // We cache cascaded and computed properties but not specified properties as
  // these are inexpensive to resolve from cascaded and computed properties.
  // Cascaded properties on the other hand require parsing, which is expensive,
  // and computed properties require absolutization, which is also expensive.
  private readonly _cascaded = new Map<NameOrCustom, Value>();
  private readonly _computed = new Map<NameOrCustom, Value>();

  private readonly _debug: boolean;

  private constructor(
    declarations: Array<Declaration>,
    device: Device,
    parent: Option<Style>,
    debug: boolean = false
  ) {
    this._debug = debug;
    if (debug) {
      console.log("Declarations:");
      console.log(declarations.map((dec) => dec.toJSON()));
    }

    this._device = device;
    this._parent = parent;

    for (const declaration of declarations) {
      const { name, value } = declaration;

      if (Property.isName(name)) {
        if (debug) console.log(`Got longhand ${name}`);
        const previous = this._cascaded.get(name);

        if (
          previous === undefined ||
          shouldOverride(previous.source, declaration)
        ) {
          const property = Property.get(name);

          for (const result of parse(property, value, debug)) {
            if (debug) console.log(`Processing parsed value: ${result}`);
            this._cascaded.set(name, Value.of(result, Option.of(declaration)));
          }
        }
      }

      if (Property.Shorthand.isName(name)) {
        const shorthand = Property.Shorthand.get(name);

        for (const result of parseShorthand(shorthand, value)) {
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

      if (Property.Custom.isName(name)) {
        if (debug) console.log(`Got custom ${name}`);
        const previous = this._cascaded.get(name);

        if (
          previous === undefined ||
          shouldOverride(previous.source, declaration)
        ) {
          this._cascaded.set(name, Value.of(value, Option.of(declaration)));
          // }
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

  public initial<N extends Name>(name: N): Value<Style.Initial<N>>;
  public initial<N extends Property.Custom.Name>(
    name: N
  ): Value<Property.Custom.GuaranteedInvalid>;
  public initial<N extends NameOrCustom>(name: N): Value {
    if (Property.isName(name)) {
      const property = Property.get(name);

      return Value.of(property.initial);
    }

    return Value.of(Property.Custom.guaranteedInvalid);
  }

  public cascaded<N extends Name>(name: N): Option<Value<Style.Cascaded<N>>>;
  public cascaded<N extends Property.Custom.Name>(
    name: N
  ): Option<Value<string>>;
  public cascaded<N extends NameOrCustom>(name: N): Option<Value> {
    return Option.from(this._cascaded.get(name));
  }

  /**
   * Get the fallback value is nothing is specified, or if specified value is invalid at computed-value time
   * Can be either initial or inherit, depending on property.
   * @see https://drafts.csswg.org/css-variables/#invalid-at-computed-value-time
   */
  private _fallback<N extends Name>(name: N): Value<Style.Specified<N>>;
  private _fallback<N extends Property.Custom.Name>(name: N): Value<string>;
  private _fallback<N extends NameOrCustom>(name: N): Value {
    let inherit = true; // custom props always inherit.
    if (Property.isName(name)) {
      inherit = Property.get(name).options.inherits === false;
    }

    if (inherit) {
      return this._parent
        .map((parent) => parent.computed(name))
        .getOrElse(() => this.initial(name));
    } else {
      return this.initial(name);
    }
  }

  public specified<N extends Name>(name: N): Value<Style.Specified<N>>;
  public specified<N extends Property.Custom.Name>(name: N): Value<string>;
  public specified<N extends NameOrCustom>(name: N): Value {
    return this.cascaded(name)
      .map((cascaded) => {
        if (Keyword.isKeyword(cascaded.value)) {
          switch (cascaded.value.value) {
            case "initial":
              return this.initial(name);

            case "inherit":
              return this.parent.computed(name);
          }
        }

        return cascaded;
      })
      .getOrElse(() => {
        if (Property.isName(name)) {
          const property = Property.get(name);

          if (property.options.inherits === false) {
            return this.initial(name);
          }
        }

        return this._parent
          .map((parent) => parent.computed(name))
          .getOrElse(() => this.initial(name));
      });
  }

  /**
   * @see https://drafts.csswg.org/css-variables/#substitute-a-var
   * "var() functions are substituted at computed-value time."
   * However, properties like overflow-y and overflow-y may mutually depend on each other for their computed value.
   * Thus, when computing a property, we may need to access the *specified* value of another property.
   * This is bad if that other property has a var() that needs to be substituted.
   *
   * In order to not move var() substitution at specified-value time, this new step is introduced.
   * Given that this is an artificial step, no caching is done.
   *
   * @TODO attr() substitution should likely happen here too
   * @see https://drafts.csswg.org/css-values-4/#attr-substitution
   */
  public substituted<N extends Name>(name: N): Value<Style.Specified<N>>;
  public substituted<N extends Property.Custom.Name>(name: N): Value<string>;
  public substituted<N extends NameOrCustom>(name: N): Value {
    // @TODO this only substitute properties whose full value is a var(), not properties including a var()
    // @TODO i.e., this substitute "foo: var(--foo)" but not "foo: foo var(--bar)" or "foo: var(--foo) bar
    // @TODO e.g. "color: var(--blue)" works, "color: rgb(var(--red-percent), 0, 0)" doesn't
    // @TODO Special care might be needed for nested custom properties ("--foo: var(--bar)").
    // 1.
    // @TODO Ignoring animation taint for now.
    const value = this.specified(name);

    if (this._debug) {
      console.log(`Substituting for ${name}`);
      console.log(value);
    }

    if (Var.isVar(value.value)) {
      console.log("Mais vous êtes Var!");
      // @TODO use fallback if property is not here.
      // It is not clear which value of the custom prop needs to be replaced. computed makes more sense.
      const customComputed = this.computed(value.value.customProperty);
      console.log(customComputed.toJSON());

      // @TODO only replacing in longhand properties. Need to work for shorthand and custom.
      if (Property.isName(name)) {
        if (customComputed.value !== Property.Custom.guaranteedInvalid) {
          // 2. sustituting for the custom prop value
          const customParsed = parse(
            Property.get(name),
            customComputed.value,
            true
          );
          console.log(customParsed);

          if (customParsed.isSome()) {
            // The custom prop is a correct value for this property
            return Value.of(customParsed.get(), value.source);
          } else {
            // The custom prop as a value but an incorrect one. The property is invalid at compute time
            // @see https://drafts.csswg.org/css-variables/#invalid-at-computed-value-time
            if (Property.get(name).options.inherits === false) {
              return this.initial(name);
            }

            return this._parent
              .map((parent) => parent.computed(name))
              .getOrElse(() => this.initial(name));
          }
        }
        if (value.value.fallbackValue.isSome()) {
          // 3. custom prop is guaranteed invalid, fetching fallback.
          const fallbackParsed = parse(
            Property.get(name),
            value.value.fallbackValue.get(),
            true
          );
          return Value.of(fallbackParsed, value.source);
        } else {
          // 4. there is no fallback, property is invalid at computed-value time
          // @see https://drafts.csswg.org/css-variables/#invalid-at-computed-value-time
          if (Property.get(name).options.inherits === false) {
            return this.initial(name);
          }

          return this._parent
            .map((parent) => parent.computed(name))
            .getOrElse(() => this.initial(name));
        }
      }
    }

    return value;
  }

  public computed<N extends Name>(name: N): Value<Style.Computed<N>>;
  public computed<N extends Property.Custom.Name>(name: N): Value<string>;
  public computed<N extends NameOrCustom>(name: N): Value {
    if (this === Style._empty) {
      return this.initial(name);
    }

    let value = this._computed.get(name);

    if (value === undefined) {
      if (Property.isName(name)) {
        value = Property.get(name).compute(this);

        this._computed.set(name, value);
      } else {
        value = this.substituted(name);
      }
    }

    return value;
  }

  public toJSON(): Style.JSON {
    return {};
  }
}

export namespace Style {
  export interface JSON {
    [key: string]: json.JSON;
  }

  const cache = Cache.empty<Device, Cache<Element, Style>>();

  export function from(element: Element, device: Device): Style {
    const debug = element.id.getOr("") === "target";

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
          .map((parent) => from(parent, device)),
        debug
      );
    });
  }

  export type Initial<N extends Name> = Property.Value.Initial<N>;

  export type Cascaded<N extends Name> = Property.Value.Cascaded<N>;

  export type Specified<N extends Name> = Property.Value.Specified<N>;

  export type Computed<N extends Name> = Property.Value.Computed<N>;
}

function parse<N extends Property.Name>(
  property: Property.WithName<N>,
  value: string,
  debug: boolean = false
) {
  if (debug) {
    console.log(`Parsing value: ${value}`);
  }
  const tokens = Slice.of(Lexer.lex(value));
  if (debug) {
    console.log(`Got tokens: ${tokens.toString()}`);
  }
  return left(
    either(
      Keyword.parse("initial", "inherit"),
      property.parse as Parser<Slice<Token>, Property.Value.Parsed<N>, string>
    ),
    eof(() => "Expected end of input")
  )(tokens)
    .map(([, value]) => value)
    .ok();
}

function parseShorthand<N extends Property.Shorthand.Name>(
  shorthand: Property.Shorthand.WithName<N>,
  value: string
) {
  return left(
    either(
      Keyword.parse("initial", "inherit"),
      shorthand.parse as Parser<
        Slice<Token>,
        Record<{ [N in Property.Name]?: Property.Value.Parsed<N> }>,
        string
      >
    ),
    eof(() => "Expected end of input")
  )(Slice.of(Lexer.lex(value)))
    .map(([, value]) => {
      if (Keyword.isKeyword(value)) {
        return Record.from(
          Iterable.map(shorthand.properties, (property) => [property, value])
        );
      }

      return value;
    })
    .ok();
}

function shouldOverride(
  previous: Option<Declaration>,
  next: Declaration
): boolean {
  return (
    next.important && previous.every((declaration) => !declaration.important)
  );
}
