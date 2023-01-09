import { Cache } from "@siteimprove/alfa-cache";
import { Device } from "@siteimprove/alfa-device";
import { Node, Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Map } from "@siteimprove/alfa-map";
import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Cell, Table } from "@siteimprove/alfa-table";

import { Attribute } from "./attribute";
import { Name } from "./name";
import { Role } from "./role";

const { hasInputType, hasName, inputType, isElement } = Element;
const { or, test } = Predicate;
const { and } = Refinement;

/**
 * @internal
 */
export class Feature {
  public static of(
    role: Role.Name | Feature.Aspect<Role.Name | Iterable<Role>> = () => None,
    attributes: Feature.AttributesAspect = () => None,
    name: Feature.NameAspect = () => None
  ): Feature {
    const roleAspect =
      typeof role === "function" ? role : () => Option.of(Role.of(role));

    return new Feature(roleAspect, attributes, name);
  }

  private readonly _role: Feature.RoleAspect;
  private readonly _attributes: Feature.AttributesAspect;
  private readonly _name: Feature.NameAspect;

  private constructor(
    roleAspect: Feature.Aspect<Role.Name | Iterable<Role>>,
    attributes: Feature.AttributesAspect,
    name: Feature.NameAspect
  ) {
    this._role = (element) => {
      const role = roleAspect(element);

      return typeof role === "string" ? Option.of(Role.of(role)) : role;
    };
    this._attributes = attributes;
    this._name = name;
  }

  public get role(): Feature.RoleAspect {
    return this._role;
  }

  public get attributes(): Feature.AttributesAspect {
    return this._attributes;
  }

  public get name(): Feature.NameAspect {
    return this._name;
  }
}

/**
 * @internal
 */
export namespace Feature {
  export type Aspect<T, A extends Array<unknown> = []> = Mapper<Element, T, A>;

  export type RoleAspect = Aspect<Iterable<Role>>;

  export type AttributesAspect = Aspect<Iterable<Attribute>>;

  export type NameAspect = Aspect<Option<Name>, [Device, Name.State]>;

  export function from(namespace: Namespace, name: string): Option<Feature> {
    return Option.from(Features[namespace]?.[name]).orElse(() => {
      switch (namespace) {
        case Namespace.HTML:
          return Option.of(html());

        case Namespace.SVG:
          return Option.of(svg());
      }

      return None;
    });
  }

  export const generic = html("generic");
}

function html(
  role: Role.Name | Feature.Aspect<Role.Name | Iterable<Role>> = () => None,
  attributes: Feature.AttributesAspect = () => None,
  name: Feature.NameAspect = () => None
): Feature {
  return Feature.of(role, attributes, (element, device, state) =>
    Name.fromSteps(
      () => name(element, device, state),
      () => nameFromAttribute(element, "title")
    )
  );
}

function svg(
  role: Role.Name | Feature.Aspect<Role.Name | Iterable<Role>> = () => None,
  attributes: Feature.AttributesAspect = () => None,
  name: Feature.NameAspect = () => None
): Feature {
  return Feature.of(role, attributes, (element, device, state) =>
    Name.fromSteps(
      () => name(element, device, state),
      () => nameFromChild(hasName("title"))(element, device, state),
      () => nameFromAttribute(element, "title")
    )
  );
}

const nameFromAttribute = (element: Element, ...attributes: Array<string>) => {
  for (const name of attributes) {
    for (const attribute of element.attribute(name)) {
      // The attribute value is used as long as it's not completely empty.
      if (attribute.value.length > 0) {
        return Name.fromLabel(attribute);
      }
    }
  }

  return None;
};

const nameFromChild =
  (predicate: Predicate<Element>) =>
  (element: Element, device: Device, state: Name.State) =>
    element
      .children()
      .filter(isElement)
      .find(predicate)
      .flatMap((child) =>
        Name.fromDescendants(child, device, state.visit(child)).map((name) =>
          Name.of(name.value, [Name.Source.descendant(element, name)])
        )
      );

const ids = Cache.empty<Node, Map<string, Element>>();

const labels = Cache.empty<Node, Sequence<Element>>();

const nameFromLabel = (element: Element, device: Device, state: Name.State) => {
  const root = element.root();

  const elements = root.inclusiveDescendants().filter(isElement);

  const isFirstReference = element.id.some((id) =>
    ids
      .get(root, () =>
        Map.from(
          elements
            .collect((element) =>
              element.id.map((id) => [id, element] as const)
            )
            .reverse()
        )
      )
      .get(id)
      .includes(element)
  );

  const references = labels
    .get(root, () => elements.filter(hasName("label")))
    .filter(
      or(
        (label) =>
          label.attribute("for").isNone() &&
          label.descendants().includes(element),
        (label) =>
          isFirstReference &&
          label
            .attribute("for")
            .some((attribute) => element.id.includes(attribute.value))
      )
    );

  const names = references.collect((element) =>
    Name.fromNode(
      element,
      device,
      state.reference(element, element).recurse(true).descend(false)
    ).map((name) => [name, element] as const)
  );

  const name = names
    .map(([name]) => name.value)
    .join(" ")
    .trim();

  if (name === "") {
    return None;
  }

  return Option.of(
    Name.of(
      name,
      names.map(([name, element]) => {
        for (const attribute of element.attribute("for")) {
          return Name.Source.reference(attribute, name);
        }

        return Name.Source.ancestor(element, name);
      })
    )
  );
};

function ifScopedTo(
  names: [string, ...Array<string>],
  ifScoped: Role.Name | Iterable<Role>,
  ifNotScoped: Role.Name | Iterable<Role>
): (element: Element) => Role.Name | Iterable<Role> {
  return (element) =>
    element
      .ancestors()
      .filter(isElement)
      .some(hasName(...names))
      ? ifScoped
      : ifNotScoped;
}

type Features = {
  [N in Namespace]?: {
    [element: string]: Feature | undefined;
  };
};

const Features: Features = {
  [Namespace.HTML]: {
    a: html(
      (element) => (element.attribute("href").isSome() ? "link" : "generic"),
      () => [],
      (element, device, state) =>
        Name.fromDescendants(element, device, state.visit(element))
    ),

    area: html(
      (element) => (element.attribute("href").isSome() ? "link" : "generic"),
      () => [],
      (element) => nameFromAttribute(element, "alt")
    ),

    article: html("article"),

    // We currently cannot detect at this point if the element has an accessible
    // name, and always map to complementary.
    // see https://github.com/Siteimprove/alfa/issues/298
    aside: html("complementary"),

    button: html("button", function* (element) {
      // https://w3c.github.io/html-aam/#att-disabled
      for (const _ of element.attribute("disabled")) {
        yield Attribute.of("aria-disabled", "true");
      }
    }),

    // https://w3c.github.io/html-aam/#el-datalist
    // <datalist> only has a role if it is correctly mapped to an <input>
    // via the list attribute. We should probably check that.
    // Additionally, it seems to never be rendered, hence always ignored.
    datalist: html("listbox"),

    dd: html("definition"),

    dfn: html("term"),

    dialog: html("dialog", function* (element) {
      // https://w3c.github.io/html-aam/#att-open-dialog
      yield Attribute.of(
        "aria-expanded",
        element.attribute("open").isSome() ? "true" : "false"
      );
    }),

    details: html(
      () => None,
      function* (element) {
        // https://w3c.github.io/html-aam/#att-open-details
        yield Attribute.of(
          "aria-expanded",
          element.attribute("open").isSome() ? "true" : "false"
        );
      }
    ),

    dt: html("term"),

    fieldset: html(
      "group",
      function* (element) {
        // https://w3c.github.io/html-aam/#att-disabled
        for (const _ of element.attribute("disabled")) {
          yield Attribute.of("aria-disabled", "true");
        }
      },
      nameFromChild(hasName("legend"))
    ),

    figure: html("figure", () => [], nameFromChild(hasName("figcaption"))),

    footer: html(
      ifScopedTo(
        ["article", "aside", "main", "nav", "section"],
        "generic",
        "contentinfo"
      )
    ),

    // We currently cannot detect at this point if the element has an accessible
    // name, and always map to complementary.
    // see https://github.com/Siteimprove/alfa/issues/298
    form: html("form"),

    h1: html("heading", () => [Attribute.of("aria-level", "1")]),

    h2: html("heading", () => [Attribute.of("aria-level", "2")]),

    h3: html("heading", () => [Attribute.of("aria-level", "3")]),

    h4: html("heading", () => [Attribute.of("aria-level", "4")]),

    h5: html("heading", () => [Attribute.of("aria-level", "5")]),

    h6: html("heading", () => [Attribute.of("aria-level", "6")]),

    header: html(
      ifScopedTo(
        ["article", "aside", "main", "nav", "section"],
        "generic",
        "banner"
      )
    ),

    hr: html("separator"),

    img: html(
      // We need to yield all roles, not just return one, in order for the
      // presentational role conflict resolution to discard `presentation`
      // and correctly default to `img`.
      function* (element) {
        // If there is an alt attribute and it is totally empty
        if (element.attribute("alt").some((alt) => alt.value === "")) {
          yield Role.of("presentation");
        }

        // if there is no src attribute, or it is empty
        if (element.attribute("src").every((src) => src.value.trim() === "")) {
          yield Role.of("presentation");
        }

        yield Role.of("img");
      },
      () => [],
      (element) => nameFromAttribute(element, "alt")
    ),

    input: html(
      (element): Role.Name | None => {
        switch (inputType(element as Element<"input">)) {
          case "button":
          case "image":
          case "reset":
          case "submit":
            return "button";
          case "checkbox":
            return "checkbox";
          case "number":
            return "spinbutton";
          case "radio":
            return "radio";
          case "range":
            return "slider";
          case "search":
            return element.attribute("list").isSome()
              ? "combobox"
              : "searchbox";
          case "email":
          case "tel":
          case "text":
          case "url":
            return element.attribute("list").isSome() ? "combobox" : "textbox";
        }

        return None;
      },
      function* (element) {
        // https://w3c.github.io/html-aam/#el-input-checkbox
        // aria-checked should be "mixed" if the indeterminate IDL attribute is
        // true
        // aria-checked should otherwise mimic the checkedness, i.e. the
        // checked *IDL* attribute, not the DOM one.
        // https://w3c.github.io/html-aam/#att-checked
        yield Attribute.of(
          "aria-checked",
          element.attribute("checked").isSome() ? "true" : "false"
        );

        // https://w3c.github.io/html-aam/#att-list
        for (const { value } of element.attribute("list")) {
          yield Attribute.of("aria-controls", value);
        }

        // https://w3c.github.io/html-aam/#att-disabled
        for (const _ of element.attribute("disabled")) {
          yield Attribute.of("aria-disabled", "true");
        }

        // https://w3c.github.io/html-aam/#att-placeholder
        for (const { value } of element.attribute("placeholder")) {
          yield Attribute.of("aria-placeholder", value);
        }

        // https://w3c.github.io/html-aam/#att-readonly
        for (const _ of element.attribute("readonly")) {
          yield Attribute.of("aria-readonly", "true");
        }

        // https://w3c.github.io/html-aam/#att-required
        for (const _ of element.attribute("required")) {
          yield Attribute.of("aria-required", "true");
        }

        // https://w3c.github.io/html-aam/#att-max-input
        for (const { value } of element.attribute("max")) {
          yield Attribute.of("aria-valuemax", value);
        }

        // https://w3c.github.io/html-aam/#att-min-input
        for (const { value } of element.attribute("min")) {
          yield Attribute.of("aria-valuemin", value);
        }

        // https://w3c.github.io/html-aam/#att-value-input
        // but https://github.com/w3c/html-aam/issues/314
        for (const { value } of element.attribute("value")) {
          yield Attribute.of("aria-valuenow", value);
        }
      },
      (element, device, state) => {
        if (
          test(
            hasInputType("text", "password", "search", "tel", "email", "url"),
            element
          )
        ) {
          /**
           * {@link https://www.w3.org/TR/html-aam-1.0/#input-type-text-input-type-password-input-type-search-input-type-tel-input-type-url-and-textarea-element}
           */
          return Name.fromSteps(
            () => nameFromLabel(element, device, state),
            // The title attribute has poor and varying support, but
            // the specs give it precedence over placeholder.
            // This could be a browser-branched value.
            () => nameFromAttribute(element, "title", "placeholder")
          );
        }

        if (test(hasInputType("button"), element)) {
          /**
           * {@link https://www.w3.org/TR/html-aam-1.0/#input-type-button-input-type-submit-and-input-type-reset}
           */
          return Name.fromSteps(
            // {@link https://github.com/w3c/html-aam/pull/423}
            () => nameFromLabel(element, device, state),
            () => nameFromAttribute(element, "value")
          );
        }

        if (test(hasInputType("submit"), element)) {
          /**
           * {@link https://www.w3.org/TR/html-aam-1.0/#input-type-button-input-type-submit-and-input-type-reset}
           */
          return Name.fromSteps(
            // {@link https://github.com/w3c/html-aam/pull/423}
            () => nameFromLabel(element, device, state),
            () => nameFromAttribute(element, "value"),
            () => Option.of(Name.of("Submit"))
          );
        }

        if (test(hasInputType("reset"), element)) {
          /**
           * {@link https://www.w3.org/TR/html-aam-1.0/#input-type-button-input-type-submit-and-input-type-reset}
           */
          return Name.fromSteps(
            // {@link https://github.com/w3c/html-aam/pull/423}
            () => nameFromLabel(element, device, state),
            () => nameFromAttribute(element, "value"),
            () => Option.of(Name.of("Reset"))
          );
        }

        if (test(hasInputType("image"), element)) {
          /**
           * {@link https://www.w3.org/TR/html-aam-1.0/#input-type-image}
           */
          return Name.fromSteps(
            // {@link https://github.com/w3c/html-aam/pull/423}
            () => nameFromLabel(element, device, state),
            // The title attribute has poor and varying support, but the specs
            // use it.
            // This could be a browser-branched value.
            () => nameFromAttribute(element, "alt", "title"),
            () => Option.of(Name.of("Submit Query"))
          );
        }

        return nameFromLabel(element, device, state);
      }
    ),

    li: html(
      (element) =>
        element
          .parent()
          .some(and(Element.isElement, hasName("ol", "ul", "menu")))
          ? "listitem"
          : "generic",
      (element) => {
        // https://w3c.github.io/html-aam/#el-li
        const siblings = element
          .inclusiveSiblings()
          .filter(and(Element.isElement, Element.hasName("li")));

        return [
          Attribute.of("aria-setsize", `${siblings.size}`),
          Attribute.of(
            "aria-posinset",
            `${
              siblings.takeUntil((sibling) => sibling.equals(element)).size + 1
            }`
          ),
        ];
      }
    ),

    main: html("main"),

    math: html("math"),

    menu: html("list"),

    meter: html(
      () => None,
      function* (element) {
        // https://w3c.github.io/html-aam/#att-max
        for (const { value } of element.attribute("max")) {
          yield Attribute.of("aria-valuemax", value);
        }

        // https://w3c.github.io/html-aam/#att-min
        for (const { value } of element.attribute("min")) {
          yield Attribute.of("aria-valuemin", value);
        }

        // https://w3c.github.io/html-aam/#att-value-meter
        for (const { value } of element.attribute("value")) {
          yield Attribute.of("aria-valuenow", value);
        }
      }
    ),

    nav: html("navigation"),

    ol: html("list"),

    optgroup: html("group", function* (element) {
      // https://w3c.github.io/html-aam/#att-disabled
      for (const _ of element.attribute("disabled")) {
        yield Attribute.of("aria-disabled", "true");
      }
    }),

    option: html(
      ifScopedTo(["select", "optgroup", "datalist"], "option", None),
      function* (element) {
        // https://w3c.github.io/html-aam/#att-disabled
        for (const _ of element.attribute("disabled")) {
          yield Attribute.of("aria-disabled", "true");
        }

        // https://w3c.github.io/html-aam/#att-selected
        yield Attribute.of(
          "aria-selected",
          element.attribute("selected").isSome() ? "true" : "false"
        );
      }
    ),

    output: html("status"),

    p: html("paragraph"),

    progress: html("progressbar", function* (element) {
      // https://w3c.github.io/html-aam/#att-max
      for (const { value } of element.attribute("max")) {
        yield Attribute.of("aria-valuemax", value);
      }

      // https://w3c.github.io/html-aam/#att-value-meter
      for (const { value } of element.attribute("value")) {
        yield Attribute.of("aria-valuenow", value);
      }
    }),

    // We currently cannot detect at this point if the element has an accessible
    // name, and always map to complementary.
    // see https://github.com/Siteimprove/alfa/issues/298
    section: html("region"),

    select: html(
      (element) =>
        // mono-line <select> are mapped to combobox by HTML AAM, but their child
        // <option> are still mapped to option, which are out of their context role.
        // We cheat and always map <select> to listbox
        test(
          Element.hasDisplaySize((size) => size > 1),
          element
        )
          ? "listbox"
          : // combobox following HTML AAM, but listbox to be correct.
            "listbox",
      function* (element) {
        // https://w3c.github.io/html-aam/#att-disabled
        for (const _ of element.attribute("disabled")) {
          yield Attribute.of("aria-disabled", "true");
        }

        // https://w3c.github.io/html-aam/#att-required
        for (const _ of element.attribute("required")) {
          yield Attribute.of("aria-required", "true");
        }

        // https://w3c.github.io/html-aam/#att-multiple-select
        for (const _ of element.attribute("multiple")) {
          yield Attribute.of("aria-multiselectable", "true");
        }
      },
      nameFromLabel
    ),

    table: html("table", () => [], nameFromChild(hasName("caption"))),

    tbody: html("rowgroup"),

    td: html(
      (element) =>
        element
          .ancestors()
          .filter(isElement)
          .find(hasName("table"))
          .flatMap<Role>((table) => {
            for (const role of Role.from(table)) {
              if (role.is("table")) {
                return Option.of(Role.of("cell"));
              }

              if (role.is("grid")) {
                return Option.of(Role.of("gridcell"));
              }
            }

            return None;
          }),
      function* (element) {
        // https://w3c.github.io/html-aam/#att-colspan
        for (const { value } of element.attribute("colspan")) {
          yield Attribute.of("aria-colspan", value);
        }

        // https://w3c.github.io/html-aam/#att-rowspan
        for (const { value } of element.attribute("rowspan")) {
          yield Attribute.of("aria-rowspan", value);
        }
      }
    ),

    textarea: html(
      "textbox",
      function* (element) {
        // https://w3c.github.io/html-aam/#el-textarea
        yield Attribute.of("aria-multiline", "true");

        // https://w3c.github.io/html-aam/#att-disabled
        for (const _ of element.attribute("disabled")) {
          yield Attribute.of("aria-disabled", "true");
        }

        // https://w3c.github.io/html-aam/#att-readonly
        for (const _ of element.attribute("readonly")) {
          yield Attribute.of("aria-readonly", "true");
        }

        // https://w3c.github.io/html-aam/#att-required
        for (const _ of element.attribute("required")) {
          yield Attribute.of("aria-required", "true");
        }

        // https://w3c.github.io/html-aam/#att-placeholder
        for (const { value } of element.attribute("placeholder")) {
          yield Attribute.of("aria-placeholder", value);
        }
      },
      (element, device, state) => {
        return Name.fromSteps(
          () => nameFromLabel(element, device, state),
          () => nameFromAttribute(element, "title", "placeholder")
        );
      }
    ),

    tfoot: html("rowgroup"),

    th: html(
      (element) =>
        element
          .ancestors()
          .filter(isElement)
          .find(hasName("table"))
          .map(Table.from)
          .flatMap((table) =>
            table.cells
              .filter(Cell.isHeader)
              .find(Cell.hasElement(element))
              .map((cell) => {
                return { table, cell };
              })
          )
          .flatMap<Role>(({ table, cell }) => {
            switch (cell.scope) {
              case "column":
              case "column-group":
                return Option.of(Role.of("columnheader"));

              case "row":
              case "row-group":
                return Option.of(Role.of("rowheader"));

              default:
                for (const role of Role.from(table.element)) {
                  if (role.is("table")) {
                    return Option.of(Role.of("cell"));
                  }

                  if (role.is("grid")) {
                    return Option.of(Role.of("gridcell"));
                  }
                }

                return None;
            }
          }),
      function* (element) {
        // https://w3c.github.io/html-aam/#att-colspan
        for (const { value } of element.attribute("colspan")) {
          yield Attribute.of("aria-colspan", value);
        }

        // https://w3c.github.io/html-aam/#att-rowspan
        for (const { value } of element.attribute("rowspan")) {
          yield Attribute.of("aria-rowspan", value);
        }
      }
    ),

    thead: html("rowgroup"),

    tr: html("row"),

    ul: html("list"),

    // Generic containers with no real semantics
    b: Feature.generic,
    bdi: Feature.generic,
    bdo: Feature.generic,
    body: Feature.generic,
    data: Feature.generic,
    div: Feature.generic,
    hgroup: Feature.generic,
    i: Feature.generic,
    pre: Feature.generic,
    q: Feature.generic,
    samp: Feature.generic,
    small: Feature.generic,
    span: Feature.generic,
    u: Feature.generic,
  },

  [Namespace.SVG]: {
    a: svg((element) =>
      element.attribute("href").isSome() ? "link" : "group"
    ),

    circle: svg("graphics-symbol"),

    ellipse: svg("graphics-symbol"),

    foreignObject: svg("group"),

    g: svg("group"),

    image: svg("img"),

    line: svg("graphics-symbol"),

    mesh: svg("img"),

    path: svg("graphics-symbol"),

    polygon: svg("graphics-symbol"),

    polyline: svg("graphics-symbol"),

    rect: svg("graphics-symbol"),

    svg: svg("graphics-document"),

    symbol: svg("graphics-object"),

    text: svg("group"),

    textPath: svg("group"),

    use: svg("graphics-object"),
  },
};
