import { Cache } from "@siteimprove/alfa-cache";
import { Device } from "@siteimprove/alfa-device";
import { Element, Declaration, Document, Shadow } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { None, Option } from "@siteimprove/alfa-option";
import { Slice } from "@siteimprove/alfa-slice";

import { Cascade } from "./cascade";
import { Property } from "./property";
import { lex } from "./syntax/lex";
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

  private readonly declarations: Iterable<Declaration>;
  private readonly parent: Option<Style>;

  private constructor(
    declarations: Iterable<Declaration>,
    parent: Option<Style>
  ) {
    this.declarations = declarations;
    this.parent = parent;
  }

  public cascaded<N extends Name>(name: N): Option<Style.Cascaded<N>>;
  public cascaded<N extends Name>(name: N): Option<Value> {
    const property: Property = Property.get(name);

    return find(
      this.declarations,
      declaration => declaration.name === name
    ).flatMap(declaration =>
      property
        .parse(Slice.of([...lex(declaration.value)]))
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

      return this.parent.flatMap(parent => parent.computed(name)).or(initial);
    });
  }

  public computed<N extends Name>(name: N): Option<Style.Computed<N>>;
  public computed<N extends Name>(name: N): Option<Value> {
    const property: Property = Property.get(name);

    return property.compute(this);
  }

  public toJSON(): unknown {
    return {
      declarations: this.declarations
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
