import { Branched } from "@siteimprove/alfa-branched";
import { Browser } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Set } from "@siteimprove/alfa-set";
import { Scope, Table } from "@siteimprove/alfa-table";

import { Attribute } from "./attribute";
import { Name } from "./name";
import { Role } from "./role";

import type * as aria from ".";

const { hasName, isElement } = Element;
const { and, or } = Predicate;

/**
 * @internal
 */
export class Feature {
  public static of(
    role: Feature.Aspect.Role = () => [],
    attributes: Feature.Aspect.Attributes = () => [],
    name: Feature.Aspect.Name = () => Branched.of(None)
  ): Feature {
    return new Feature(role, attributes, name);
  }

  private readonly _role: Feature.Aspect.Role;
  private readonly _attributes: Feature.Aspect.Attributes;
  private readonly _name: Feature.Aspect.Name;

  private constructor(
    role: Feature.Aspect.Role,
    attributes: Feature.Aspect.Attributes,
    name: Feature.Aspect.Name
  ) {
    this._role = role;
    this._attributes = attributes;
    this._name = name;
  }

  public get role(): Feature.Aspect.Role {
    return this._role;
  }

  public get attributes(): Feature.Aspect.Attributes {
    return this._attributes;
  }

  public get name(): Feature.Aspect.Name {
    return this._name;
  }
}

/**
 * @internal
 */
export namespace Feature {
  export type Aspect<T, A extends Array<unknown> = []> = Mapper<Element, T, A>;

  export namespace Aspect {
    export type Role = Aspect<Iterable<aria.Role>>;

    export type Attributes = Aspect<Iterable<aria.Attribute>>;

    export type Name = Aspect<
      Branched<Option<aria.Name>, Browser>,
      [Device, aria.Name.State]
    >;
  }

  export function lookup(namespace: Namespace, name: string): Option<Feature> {
    return Option.from(Features[namespace]?.[name]);
  }
}

const nameFromAlt = (element: Element) => {
  for (const attribute of element.attribute("alt")) {
    if (attribute.value !== "") {
      return Name.fromLabel(attribute);
    }
  }

  return Branched.of(None);
};

const nameFromTitle = (element: Element) => {
  for (const attribute of element.attribute("title")) {
    if (attribute.value !== "") {
      return Name.fromLabel(attribute);
    }
  }

  return Branched.of(None);
};

const nameFromPlaceholder = (element: Element) => {
  for (const attribute of element.attribute("placeholder")) {
    if (attribute.value !== "") {
      return Name.fromLabel(attribute);
    }
  }

  return Branched.of(None);
};

const nameFromChild = (predicate: Predicate<Element>) => (
  element: Element,
  device: Device,
  state: Name.State
) => {
  for (const child of element.children().find(and(isElement, predicate))) {
    return Name.fromDescendants(child, device, {
      ...state,
      visited: state.visited.add(child),
    });
  }

  return Branched.of(None);
};

const nameFromLabel = (element: Element, device: Device, state: Name.State) => {
  const root = element.root();

  for (const id of element.id) {
    const target = root
      .descendants()
      .find(and(isElement, (element) => element.id.includes(id)));

    if (target.includes(element)) {
      continue;
    } else {
      return Branched.of(None);
    }
  }

  const labels = root.descendants().filter(
    and(
      isElement,
      and(
        hasName("label"),
        or(
          (label) => label.descendants().includes(element),
          (label) =>
            label
              .attribute("for")
              .some((attribute) => element.id.includes(attribute.value))
        )
      )
    )
  );

  return Branched.traverse(labels, (element) =>
    Name.fromNode(element, device, {
      ...state,
      isRecursing: true,
      isReferencing: false,
      isDescending: false,
    }).map((name) => [name, element] as const)
  )
    .map((names) =>
      [...names]
        .filter(([name]) => name.isSome())
        .map(([name, element]) => [name.get(), element] as const)
    )
    .map((names) => {
      const data = names
        .map(([name]) => name.value)
        .join(" ")
        .trim();

      if (data === "") {
        return None;
      }

      return Option.of(
        Name.of(
          data,
          names.map(([name, element]) => {
            for (const attribute of element.attribute("for")) {
              return Name.Source.reference(attribute, name);
            }

            return Name.Source.ancestor(element, name);
          })
        )
      );
    });
};

type Features = {
  [N in Namespace]?: {
    [element: string]: Feature | undefined;
  };
};

const Features: Features = {
  [Namespace.HTML]: {
    a: Feature.of((element) =>
      element.attribute("href").isSome() ? Option.of(Role.of("link")) : None
    ),

    area: Feature.of(
      (element) =>
        element.attribute("href").isSome() ? Option.of(Role.of("link")) : None,
      () => [],
      nameFromAlt
    ),

    article: Feature.of(() => Option.of(Role.of("article"))),

    aside: Feature.of(() => Option.of(Role.of("complementary"))),

    button: Feature.of(
      () => Option.of(Role.of("button")),
      function* (element) {
        // https://w3c.github.io/html-aam/#att-disabled
        for (const _ of element.attribute("disabled")) {
          yield Attribute.of("aria-disabled", "true");
        }
      }
    ),

    datalist: Feature.of(() => Option.of(Role.of("listbox"))),

    dd: Feature.of(() => Option.of(Role.of("definition"))),

    dfn: Feature.of(() => Option.of(Role.of("term"))),

    dialog: Feature.of(
      () => Option.of(Role.of("dialog")),
      function* (element) {
        // https://w3c.github.io/html-aam/#att-open-dialog
        yield Attribute.of(
          "aria-expanded",
          element.attribute("open").isSome() ? "true" : "false"
        );
      }
    ),

    details: Feature.of(
      () => None,
      function* (element) {
        // https://w3c.github.io/html-aam/#att-open-details
        yield Attribute.of(
          "aria-expanded",
          element.attribute("open").isSome() ? "true" : "false"
        );
      }
    ),

    dt: Feature.of(() => Option.of(Role.of("term"))),

    fieldset: Feature.of(
      () => Option.of(Role.of("group")),
      function* (element) {
        // https://w3c.github.io/html-aam/#att-disabled
        for (const _ of element.attribute("disabled")) {
          yield Attribute.of("aria-disabled", "true");
        }
      },
      nameFromChild(hasName("legend"))
    ),

    figure: Feature.of(
      () => Option.of(Role.of("figure")),
      () => [],
      nameFromChild(hasName("figcaption"))
    ),

    footer: Feature.of((element) =>
      element
        .closest(
          and(isElement, hasName("article", "aside", "main", "nav", "section"))
        )
        .isNone()
        ? Option.of(Role.of("contentinfo"))
        : None
    ),

    form: Feature.of(() => Option.of(Role.of("form"))),

    h1: Feature.of(
      () => Option.of(Role.of("heading")),
      () => [Attribute.of("aria-level", "1")]
    ),

    h2: Feature.of(
      () => Option.of(Role.of("heading")),
      () => [Attribute.of("aria-level", "2")]
    ),

    h3: Feature.of(
      () => Option.of(Role.of("heading")),
      () => [Attribute.of("aria-level", "3")]
    ),

    h4: Feature.of(
      () => Option.of(Role.of("heading")),
      () => [Attribute.of("aria-level", "4")]
    ),

    h5: Feature.of(
      () => Option.of(Role.of("heading")),
      () => [Attribute.of("aria-level", "5")]
    ),

    h6: Feature.of(
      () => Option.of(Role.of("heading")),
      () => [Attribute.of("aria-level", "6")]
    ),

    header: Feature.of((element) =>
      element
        .closest(
          and(isElement, hasName("article", "aside", "main", "nav", "section"))
        )
        .isNone()
        ? Option.of(Role.of("banner"))
        : None
    ),

    hr: Feature.of(() => Option.of(Role.of("separator"))),

    img: Feature.of(
      function* (element) {
        for (const attribute of element.attribute("alt")) {
          if (attribute.value === "") {
            yield Role.of("presentation");
          }
        }

        yield Role.of("img");
      },
      () => [],
      nameFromAlt
    ),

    input: Feature.of(
      (element): Option<Role> => {
        const type = element
          .attribute("type")
          .flatMap((attribute) =>
            attribute.enumerate(
              "button",
              "image",
              "reset",
              "submit",
              "checkbox",
              "number",
              "radio",
              "range",
              "search",
              "email",
              "tel",
              "text",
              "url"
            )
          )
          .getOr("text");

        switch (type) {
          case "button":
          case "image":
          case "reset":
          case "submit":
            return Option.of(Role.of("button"));

          case "checkbox":
            return Option.of(Role.of("checkbox"));

          case "number":
            return Option.of(Role.of("spinbutton"));

          case "radio":
            return Option.of(Role.of("radio"));

          case "range":
            return Option.of(Role.of("slider"));

          case "search":
            return Option.of(
              Role.of(
                element.attribute("list").isSome() ? "combobox" : "searchbox"
              )
            );

          case "email":
          case "tel":
          case "text":
          case "url":
            return Option.of(
              Role.of(
                element.attribute("list").isSome() ? "combobox" : "textbox"
              )
            );
        }
      },
      function* (element) {
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
      nameFromLabel
    ),

    li: Feature.of((element) =>
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
        })
    ),

    main: Feature.of(() => Option.of(Role.of("main"))),

    math: Feature.of(() => Option.of(Role.of("math"))),

    menu: Feature.of(() => Option.of(Role.of("list"))),

    nav: Feature.of(() => Option.of(Role.of("navigation"))),

    ol: Feature.of(() => Option.of(Role.of("list"))),

    optgroup: Feature.of(
      () => Option.of(Role.of("group")),
      function* (element) {
        // https://w3c.github.io/html-aam/#att-disabled
        for (const _ of element.attribute("disabled")) {
          yield Attribute.of("aria-disabled", "true");
        }
      }
    ),

    option: Feature.of(
      (element) =>
        element
          .closest(and(isElement, hasName("select", "optgroup", "datalist")))
          .isSome()
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

    output: Feature.of(() => Option.of(Role.of("status"))),

    section: Feature.of(() => Option.of(Role.of("region"))),

    select: Feature.of(
      () =>
        // Despite what the HTML AAM specifies, we always map <select> elements
        // to a listbox widget as they currently have no way of mapping to a valid
        // combobo widget. As a combobox requires an owned textarea and a list of
        // options, we will always end up mapping <select> elements to an invalid
        // combobox widget.
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
      }
    ),

    table: Feature.of(() => Option.of(Role.of("table"))),

    tbody: Feature.of(() => Option.of(Role.of("rowgroup"))),

    td: Feature.of(
      (element) =>
        element
          .closest(and(Element.isElement, hasName("table")))
          .flatMap<Role>((table) => {
            for (const [role] of Role.from(table)) {
              if (role.isSome()) {
                switch (role.get().name) {
                  case "table":
                    return Option.of(Role.of("cell"));
                  case "grid":
                    return Option.of(Role.of("gridcell"));
                }
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

    textarea: Feature.of(
      () => Option.of(Role.of("textbox")),
      function* (element) {
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
      nameFromLabel
    ),

    tfoot: Feature.of(() => Option.of(Role.of("rowgroup"))),

    th: Feature.of(
      (element) => {
        const table = element.closest(and(isElement, hasName("table")));

        // If the <th> is not in a <table>, it doesn't really have a role…
        if (table.isNone()) {
          return None;
        }

        const tableModel = Table.from(table.get());

        // If the <th> is within a <table> with errors, it doesn't really have a role.
        if (tableModel.isErr()) {
          return None;
        }

        const cell = Iterable.find(tableModel.get().cells, (cell) =>
          cell.element.equals(element)
        );

        // If the current element is not a cell in the table, something weird happened and it doesn't have a role.
        if (cell.isNone()) {
          return None;
        }

        // This is not fully correct. If the header has no variant, its role should be computed as a <td>
        // @see https://www.w3.org/TR/html-aam-1.0/#html-element-role-mappings
        //     "th (is neither column header nor row header, and ancestor table element has table role)"
        // and "th (is neither column header nor row header, and ancestor table element has grid role)"
        return cell.get().scope.map((scope) => {
          switch (scope) {
            case Scope.Column:
            case Scope.ColumnGroup:
              return Role.of("columnheader");
            case Scope.Row:
            case Scope.RowGroup:
              return Role.of("rowheader");
          }
        });
      },
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

    thead: Feature.of(() => Option.of(Role.of("rowgroup"))),

    tr: Feature.of(() => Option.of(Role.of("row"))),

    ul: Feature.of(() => Option.of(Role.of("list"))),

    meter: Feature.of(
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

    progress: Feature.of(
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
    a: Feature.of((element) =>
      Option.of(Role.of(element.attribute("href").isSome() ? "link" : "group"))
    ),

    circle: Feature.of(() => Option.of(Role.of("graphics-symbol"))),

    ellipse: Feature.of(() => Option.of(Role.of("graphics-symbol"))),

    foreignObject: Feature.of(() => Option.of(Role.of("group"))),

    g: Feature.of(() => Option.of(Role.of("group"))),

    image: Feature.of(() => Option.of(Role.of("img"))),

    line: Feature.of(() => Option.of(Role.of("graphics-symbol"))),

    mesh: Feature.of(() => Option.of(Role.of("img"))),

    path: Feature.of(() => Option.of(Role.of("graphics-symbol"))),

    polygon: Feature.of(() => Option.of(Role.of("graphics-symbol"))),

    polyline: Feature.of(() => Option.of(Role.of("graphics-symbol"))),

    rect: Feature.of(() => Option.of(Role.of("graphics-symbol"))),

    svg: Feature.of(() => Option.of(Role.of("graphics-document"))),

    symbol: Feature.of(() => Option.of(Role.of("graphics-object"))),

    text: Feature.of(() => Option.of(Role.of("group"))),

    textPath: Feature.of(() => Option.of(Role.of("group"))),

    use: Feature.of(() => Option.of(Role.of("graphics-object"))),
  },
};
