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

const { hasInputType, hasName, isElement } = Element;
const { or, test } = Predicate;
const { and } = Refinement;

/**
 * @internal
 */
export class Feature {
  public static of(
    role: Feature.RoleAspect = () => [],
    attributes: Feature.AttributesAspect = () => [],
    name: Feature.NameAspect = () => None
  ): Feature {
    return new Feature(role, attributes, name);
  }

  private readonly _role: Feature.RoleAspect;
  private readonly _attributes: Feature.AttributesAspect;
  private readonly _name: Feature.NameAspect;

  private constructor(
    role: Feature.RoleAspect,
    attributes: Feature.AttributesAspect,
    name: Feature.NameAspect
  ) {
    this._role = role;
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
}

function html(
  role: Feature.RoleAspect = () => [],
  attributes: Feature.AttributesAspect = () => [],
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
  role: Feature.RoleAspect = () => [],
  attributes: Feature.AttributesAspect = () => [],
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
      state.reference(Option.of(element)).recurse(true).descend(false)
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

type Features = {
  [N in Namespace]?: {
    [element: string]: Feature | undefined;
  };
};

const Features: Features = {
  [Namespace.HTML]: {
    a: html(
      (element) =>
        element.attribute("href").isSome() ? Option.of(Role.of("link")) : None,
      () => [],
      (element, device, state) =>
        Name.fromDescendants(element, device, state.visit(element))
    ),

    area: html(
      (element) =>
        element.attribute("href").isSome() ? Option.of(Role.of("link")) : None,
      () => [],
      (element) => nameFromAttribute(element, "alt")
    ),

    article: html(() => Option.of(Role.of("article"))),

    aside: html(() => Option.of(Role.of("complementary"))),

    button: html(
      () => Option.of(Role.of("button")),
      function* (element) {
        // https://w3c.github.io/html-aam/#att-disabled
        for (const _ of element.attribute("disabled")) {
          yield Attribute.of("aria-disabled", "true");
        }
      }
    ),

    // https://w3c.github.io/html-aam/#el-datalist
    // <datalist> only has a role if it is correctly mapped to an <input>
    // via the list attribute. We should probably check that.
    // Additionally, it seems to never be rendered, hence always ignored.
    datalist: html(() => Option.of(Role.of("listbox"))),

    dd: html(() => Option.of(Role.of("definition"))),

    dfn: html(() => Option.of(Role.of("term"))),

    dialog: html(
      () => Option.of(Role.of("dialog")),
      function* (element) {
        // https://w3c.github.io/html-aam/#att-open-dialog
        yield Attribute.of(
          "aria-expanded",
          element.attribute("open").isSome() ? "true" : "false"
        );
      }
    ),

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

    dt: html(() => Option.of(Role.of("term"))),

    fieldset: html(
      () => Option.of(Role.of("group")),
      function* (element) {
        // https://w3c.github.io/html-aam/#att-disabled
        for (const _ of element.attribute("disabled")) {
          yield Attribute.of("aria-disabled", "true");
        }
      },
      nameFromChild(hasName("legend"))
    ),

    figure: html(
      () => Option.of(Role.of("figure")),
      () => [],
      nameFromChild(hasName("figcaption"))
    ),

    footer: html((element) =>
      element
        .ancestors()
        .filter(isElement)
        .some(hasName("article", "aside", "main", "nav", "section"))
        ? None
        : Option.of(Role.of("contentinfo"))
    ),

    form: html(() => Option.of(Role.of("form"))),

    h1: html(
      () => Option.of(Role.of("heading")),
      () => [Attribute.of("aria-level", "1")]
    ),

    h2: html(
      () => Option.of(Role.of("heading")),
      () => [Attribute.of("aria-level", "2")]
    ),

    h3: html(
      () => Option.of(Role.of("heading")),
      () => [Attribute.of("aria-level", "3")]
    ),

    h4: html(
      () => Option.of(Role.of("heading")),
      () => [Attribute.of("aria-level", "4")]
    ),

    h5: html(
      () => Option.of(Role.of("heading")),
      () => [Attribute.of("aria-level", "5")]
    ),

    h6: html(
      () => Option.of(Role.of("heading")),
      () => [Attribute.of("aria-level", "6")]
    ),

    header: html((element) =>
      element
        .ancestors()
        .filter(isElement)
        .some(hasName("article", "aside", "main", "nav", "section"))
        ? None
        : Option.of(Role.of("banner"))
    ),

    hr: html(() => Option.of(Role.of("separator"))),

    img: html(
      function* (element) {
        for (const attribute of element.attribute("alt")) {
          if (attribute.value === "") {
            yield Role.of("presentation");
          }
        }

        yield Role.of("img");
      },
      () => [],
      (element) => nameFromAttribute(element, "alt")
    ),

    input: html(
      (element): Option<Role> => {
        if (test(hasInputType("button", "image", "reset", "submit"), element)) {
          return Option.of(Role.of("button"));
        }

        if (test(hasInputType("checkbox"), element)) {
          return Option.of(Role.of("checkbox"));
        }

        if (test(hasInputType("number"), element)) {
          return Option.of(Role.of("spinbutton"));
        }

        if (test(hasInputType("radio"), element)) {
          return Option.of(Role.of("radio"));
        }

        if (test(hasInputType("range"), element)) {
          return Option.of(Role.of("slider"));
        }

        if (test(hasInputType("search"), element)) {
          return Option.of(
            Role.of(
              element.attribute("list").isSome() ? "combobox" : "searchbox"
            )
          );
        }

        if (test(hasInputType("email", "tel", "text", "url"), element)) {
          return Option.of(
            Role.of(element.attribute("list").isSome() ? "combobox" : "textbox")
          );
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

        // https://w3c.github.io/html-aam/#att-max-input
        for (const { value } of element.attribute("max")) {
          yield Attribute.of("aria-valuemax", value);
        }

        // https://w3c.github.io/html-aam/#att-min-input
        for (const { value } of element.attribute("min")) {
          yield Attribute.of("aria-valuemin", value);
        }

        // https://w3c.github.io/html-aam/#att-readonly
        for (const _ of element.attribute("readonly")) {
          yield Attribute.of("aria-readonly", "true");
        }

        // https://w3c.github.io/html-aam/#att-required
        for (const _ of element.attribute("required")) {
          yield Attribute.of("aria-required", "true");
        }

        // https://w3c.github.io/html-aam/#att-disabled
        for (const _ of element.attribute("disabled")) {
          yield Attribute.of("aria-disabled", "true");
        }

        // https://w3c.github.io/html-aam/#att-placeholder
        for (const { value } of element.attribute("placeholder")) {
          yield Attribute.of("aria-placeholder", value);
        }
      },
      (element, device, state) => {
        if (
          test(
            hasInputType("text", "password", "search", "tel", "email", "url"),
            element
          )
        ) {
          return Name.fromSteps(
            () => nameFromLabel(element, device, state),
            () => nameFromAttribute(element, "title", "placeholder")
          );
        }

        if (test(hasInputType("button"), element)) {
          return nameFromAttribute(element, "value");
        }

        if (test(hasInputType("submit"), element)) {
          return Name.fromSteps(
            () => nameFromAttribute(element, "value"),
            () => Option.of(Name.of("Submit"))
          );
        }

        if (test(hasInputType("reset"), element)) {
          return Name.fromSteps(
            () => nameFromAttribute(element, "value"),
            () => Option.of(Name.of("Reset"))
          );
        }

        if (test(hasInputType("image"), element)) {
          return Name.fromSteps(
            () => nameFromAttribute(element, "alt"),
            () => Option.of(Name.of("Submit"))
          );
        }

        return nameFromLabel(element, device, state);
      }
    ),

    li: html(
      (element) =>
        element
          .parent()
          .filter(Element.isElement)
          .flatMap((parent) => {
            switch (parent.name) {
              case "ol":
              case "ul":
              case "menu":
                return Option.of(Role.of("listitem"));
            }

            return None;
          }),
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

    main: html(() => Option.of(Role.of("main"))),

    math: html(() => Option.of(Role.of("math"))),

    menu: html(() => Option.of(Role.of("list"))),

    nav: html(() => Option.of(Role.of("navigation"))),

    ol: html(() => Option.of(Role.of("list"))),

    optgroup: html(
      () => Option.of(Role.of("group")),
      function* (element) {
        // https://w3c.github.io/html-aam/#att-disabled
        for (const _ of element.attribute("disabled")) {
          yield Attribute.of("aria-disabled", "true");
        }
      }
    ),

    option: html(
      (element) =>
        element
          .ancestors()
          .filter(isElement)
          .some(hasName("select", "optgroup", "datalist"))
          ? Option.of(Role.of("option"))
          : None,
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

    output: html(() => Option.of(Role.of("status"))),

    p: html(() => Option.of(Role.of("paragraph"))),

    section: html(() => Option.of(Role.of("region"))),

    select: html(
      () =>
        // Despite what the HTML AAM specifies, we always map <select> elements
        // to a listbox widget as they currently have no way of mapping to a
        // valid combobox widget. As a combobox requires an owned textarea and a
        // list of options, we will always end up mapping <select> elements to
        // an invalid combobox widget.
        Option.of(Role.of("listbox")),
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

    table: html(
      () => Option.of(Role.of("table")),
      () => [],
      nameFromChild(hasName("caption"))
    ),

    tbody: html(() => Option.of(Role.of("rowgroup"))),

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
      () => Option.of(Role.of("textbox")),
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

    tfoot: html(() => Option.of(Role.of("rowgroup"))),

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

    thead: html(() => Option.of(Role.of("rowgroup"))),

    tr: html(() => Option.of(Role.of("row"))),

    ul: html(() => Option.of(Role.of("list"))),

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

    progress: html(
      () => Option.of(Role.of("progressbar")),
      function* (element) {
        // https://w3c.github.io/html-aam/#att-max
        for (const { value } of element.attribute("max")) {
          yield Attribute.of("aria-valuemax", value);
        }

        // https://w3c.github.io/html-aam/#att-value-meter
        for (const { value } of element.attribute("value")) {
          yield Attribute.of("aria-valuenow", value);
        }
      }
    ),
  },

  [Namespace.SVG]: {
    a: svg((element) =>
      Option.of(Role.of(element.attribute("href").isSome() ? "link" : "group"))
    ),

    circle: svg(() => Option.of(Role.of("graphics-symbol"))),

    ellipse: svg(() => Option.of(Role.of("graphics-symbol"))),

    foreignObject: svg(() => Option.of(Role.of("group"))),

    g: svg(() => Option.of(Role.of("group"))),

    image: svg(() => Option.of(Role.of("img"))),

    line: svg(() => Option.of(Role.of("graphics-symbol"))),

    mesh: svg(() => Option.of(Role.of("img"))),

    path: svg(() => Option.of(Role.of("graphics-symbol"))),

    polygon: svg(() => Option.of(Role.of("graphics-symbol"))),

    polyline: svg(() => Option.of(Role.of("graphics-symbol"))),

    rect: svg(() => Option.of(Role.of("graphics-symbol"))),

    svg: svg(() => Option.of(Role.of("graphics-document"))),

    symbol: svg(() => Option.of(Role.of("graphics-object"))),

    text: svg(() => Option.of(Role.of("group"))),

    textPath: svg(() => Option.of(Role.of("group"))),

    use: svg(() => Option.of(Role.of("graphics-object"))),
  },
};
