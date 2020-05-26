import { Cache } from "@siteimprove/alfa-cache";
import { Cascade } from "@siteimprove/alfa-cascade";
import { Lexer, Keyword, Token } from "@siteimprove/alfa-css";
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

    for (const declaration of declarations) {
      const { name, value } = declaration;

      if (Property.isName(name)) {
        if (this._cascaded.has(name)) {
          continue;
        }

        const property = Property.get(name);

        for (const result of parse(property, value)) {
          this._cascaded.set(name, Value.of(result, Option.of(declaration)));
        }
      }

      if (Property.Shorthand.isName(name)) {
        const shorthand = Property.Shorthand.get(name);

        for (const result of parseShorthand(shorthand, value)) {
          for (const [name, value] of result) {
            if (this._cascaded.has(name)) {
              continue;
            }

            this._cascaded.set(name, Value.of(value, Option.of(declaration)));
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

  public initial<N extends Name>(name: N): Value<Style.Initial<N>>;
  public initial<N extends Name>(name: N): Value {
    const property = Property.get(name);

    return Value.of(property.initial);
  }

  public cascaded<N extends Name>(name: N): Option<Value<Style.Cascaded<N>>>;
  public cascaded<N extends Name>(name: N): Option<Value> {
    return Option.from(this._cascaded.get(name));
  }

  public specified<N extends Name>(name: N): Value<Style.Specified<N>>;
  public specified<N extends Name>(name: N): Value {
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
        const property = Property.get(name);

        if (property.options.inherits === false) {
          return this.initial(name);
        }

        return this._parent
          .map((parent) => parent.computed(name))
          .getOrElse(() => this.initial(name));
      });
  }

  public computed<N extends Name>(name: N): Value<Style.Computed<N>>;
  public computed<N extends Name>(name: N): Value {
    if (this === Style._empty) {
      return this.initial(name);
    }

    let value = this._computed.get(name);

    if (value === undefined) {
      value = Property.get(name).compute(this);

      this._computed.set(name, value);
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
    return cache.get(device, Cache.empty).get(element, () => {
      const declarations: Array<Declaration> = [];

      const root = element.root();

      if (Document.isDocument(root) || Shadow.isShadow(root)) {
        const cascade = Cascade.from(root, device);

        let next = cascade.get(element);

        while (next.isSome()) {
          const node = next.get();

          declarations.push(...node.declarations);
          next = node.parent;
        }
      }

      declarations.push(...element.style.getOr([]));

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

  export type Initial<N extends Name> = Property.Value.Initial<N>;

  export type Cascaded<N extends Name> = Property.Value.Cascaded<N>;

  export type Specified<N extends Name> = Property.Value.Specified<N>;

  export type Computed<N extends Name> = Property.Value.Computed<N>;
}

function parse<N extends Property.Name>(
  property: Property.WithName<N>,
  value: string
) {
  return left(
    either(
      Keyword.parse("initial", "inherit"),
      property.parse as Parser<Slice<Token>, Property.Value.Parsed<N>, string>
    ),
    eof(() => "Expected end of input")
  )(Slice.of(Lexer.lex(value)))
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
