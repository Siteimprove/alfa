import { Cache } from "@siteimprove/alfa-cache";
import { Cascade } from "@siteimprove/alfa-cascade";
import { Lexer } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element, Declaration, Document, Shadow } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { None, Option } from "@siteimprove/alfa-option";
import { Slice } from "@siteimprove/alfa-slice";

import { Property } from "./property";
import { Value } from "./value";

const { find, isEmpty } = Iterable;

type Name = Property.Name;

export class Style {
  public static of(
    declarations: Iterable<Declaration>,
    parent: Option<Style> = None
  ): Style {
    return new Style(declarations, parent);
  }

  private readonly _declarations: Array<Declaration>;
  private readonly _parent: Option<Style>;

  private constructor(
    declarations: Iterable<Declaration>,
    parent: Option<Style>
  ) {
    this._declarations = Array.from(declarations);
    this._parent = parent;
  }

  public cascaded<N extends Name>(name: N): Option<Style.Cascaded<N>>;
  public cascaded<N extends Name>(name: N): Option<Value> {
    const property: Property = Property.get(name);

    return find(
      this._declarations,
      declaration => declaration.name === name
    ).flatMap(declaration =>
      property
        .parse(Slice.of([...Lexer.lex(declaration.value)]))
        .map(([remainder, value]) =>
          isEmpty(remainder)
            ? Option.of(Value.of(value, Option.of(declaration)))
            : None
        )
        .getOr(None)
    );
  }

  public specified<N extends Name>(name: N): Option<Style.Specified<N>>;
  public specified<N extends Name>(name: N): Option<Value> {
    const property: Property = Property.get(name);

    return this.cascaded(name).orElse(() => {
      const initial = Option.of(Value.of(property.initial, None));

      if (property.options.inherits === false) {
        return initial;
      }

      return this._parent.flatMap(parent => parent.computed(name)).or(initial);
    });
  }

  public computed<N extends Name>(name: N): Option<Style.Computed<N>>;
  public computed<N extends Name>(name: N): Option<Value> {
    const property: Property = Property.get(name);

    return property.compute(this);
  }

  public toJSON() {
    return {
      declarations: this._declarations.map(declaration => declaration.toJSON())
    };
  }
}

export namespace Style {
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
        element
          .parent({ flattened: true })
          .filter(Element.isElement)
          .map(parent => Style.from(parent, device))
      );
    });
  }

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
