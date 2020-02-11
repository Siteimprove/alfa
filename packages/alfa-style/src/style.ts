import { Cache } from "@siteimprove/alfa-cache";
import { Cascade } from "@siteimprove/alfa-cascade";
import { Lexer, Keyword } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element, Declaration, Document, Shadow } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { None, Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import * as json from "@siteimprove/alfa-json";

import { Property } from "./property";
import { Value } from "./value";

const { find, isEmpty } = Iterable;
const { either } = Parser;

type Name = Property.Name;

export class Style implements Serializable {
  public static of(
    declarations: Iterable<Declaration>,
    device: Device,
    parent: Option<Style> = None
  ): Style {
    return new Style(declarations, device, parent);
  }

  private static _empty = new Style([], Device.standard(), None);

  public static empty(): Style {
    return this._empty;
  }

  private readonly _declarations: Array<Declaration>;
  private readonly _device: Device;
  private readonly _parent: Option<Style>;

  private constructor(
    declarations: Iterable<Declaration>,
    device: Device,
    parent: Option<Style>
  ) {
    this._declarations = Array.from(declarations);
    this._device = device;
    this._parent = parent;
  }

  public get device(): Device {
    return this._device;
  }

  public get parent(): Style {
    return this._parent.getOrElse(() => Style._empty);
  }

  public root(): Style {
    return this._parent.map(parent => parent.root()).getOr(this);
  }

  public initial<N extends Name>(name: N): Style.Initial<N>;
  public initial<N extends Name>(name: N): Value {
    const property: Property = Property.get(name);

    return Value.of(property.initial);
  }

  public cascaded<N extends Name>(name: N): Option<Style.Cascaded<N>>;
  public cascaded<N extends Name>(name: N): Option<Value> {
    const property: Property = Property.get(name);

    return find(
      this._declarations,
      declaration => declaration.name === name
    ).flatMap(declaration =>
      either(
        Keyword.parse("initial", "inherit"),
        property.parse
      )(Slice.of([...Lexer.lex(declaration.value)]))
        .map(([remainder, value]) =>
          isEmpty(remainder)
            ? Option.of(Value.of(value, Option.of(declaration)))
            : None
        )
        .getOr(None)
    );
  }

  public specified<N extends Name>(name: N): Style.Specified<N>;
  public specified<N extends Name>(name: N): Value {
    return this.cascaded(name)
      .map(cascaded => {
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
        const property: Property = Property.get(name);

        if (property.options.inherits === false) {
          return this.initial(name);
        }

        return this._parent
          .map(parent => parent.computed(name))
          .getOrElse(() => this.initial(name));
      });
  }

  public computed<N extends Name>(name: N): Style.Computed<N>;
  public computed<N extends Name>(name: N): Value {
    if (this._parent.isNone() && this._declarations.length === 0) {
      return this.initial(name);
    }

    const property: Property = Property.get(name);

    return property.compute(this);
  }

  public toJSON(): Style.JSON {
    return {
      declarations: this._declarations.map(declaration => declaration.toJSON())
    };
  }
}

export namespace Style {
  export interface JSON {
    [key: string]: json.JSON;
    declarations: Array<Declaration.JSON>;
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
          .map(parent => from(parent, device))
      );
    });
  }

  export type Initial<N extends Name> = Property.Value.Initial<
    Property.Longhand[N]
  >;

  export type Cascaded<N extends Name> = Property.Value.Cascaded<
    Property.Longhand[N]
  >;

  export type Specified<N extends Name> = Property.Value.Specified<
    Property.Longhand[N]
  >;

  export type Computed<N extends Name> = Property.Value.Computed<
    Property.Longhand[N]
  >;
}
