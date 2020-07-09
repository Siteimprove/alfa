import { Cache } from "@siteimprove/alfa-cache";
import { Cascade } from "@siteimprove/alfa-cascade";
import { Lexer, Keyword, Token, Named } from "@siteimprove/alfa-css";
import { Foo } from "@siteimprove/alfa-css/src/value/color/foo";
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
  public initial<N extends Property.Custom.Name>(name: N): Value<"guaranteed invalid">
  public initial<N extends NameOrCustom>(name: N): Value {
    if (Property.isName(name)) {
      const property = Property.get(name);

      return Value.of(property.initial);
    }

    return Value.of("guaranteed invalid");
  }

  public cascaded<N extends Name>(name: N): Option<Value<Style.Cascaded<N>>>;
  public cascaded<N extends Property.Custom.Name>(name: N): Option<Value<string>>;
  public cascaded<N extends NameOrCustom>(name: N): Option<Value> {
    return Option.from(this._cascaded.get(name));
  }

  public specified<N extends Name>(name: N): Value<Style.Specified<N>>;
  public specified<N extends Property.Custom.Name>(name: N): Value<string>
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
  public substituted<N extends Name>(name: N): Value<Style.Specified<N>>
  public substituted<N extends Property.Custom.Name>(name: N): Value<string>
  public substituted<N extends NameOrCustom>(name: N): Value {
    if (this._debug) {
      console.log(`Substituting for ${name}`);
    }

    const value = this.specified(name);
    if (Foo.isFoo(value.value)) {
      console.log("Mais vous êtes Foo!");
      const fooDeclared: Value<string> = this.computed("--foo");
      console.log(fooDeclared.toJSON());

      if (Property.isName(name)) { // @TODO nested substitution of --foo: var(--bar)
        const fooParsed = parse(Property.get(name), fooDeclared.value, true)
        console.log(fooParsed);

        return Value.of(Named.of("blue"), value.source);
      }
    }

    return value;
  }

  public computed<N extends Name>(name: N): Value<Style.Computed<N>>;
  public computed<N extends Property.Custom.Name>(name: N): Value<string>
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
        value = Value.of(this.substituted(name))
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
  const tokens = Slice.of(Lexer.lex(value, debug));
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
