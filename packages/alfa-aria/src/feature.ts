import { Branched } from "@siteimprove/alfa-branched";
import { Cache } from "@siteimprove/alfa-cache";
import { Browser } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import { Node, Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Map } from "@siteimprove/alfa-map";
import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Scope, Table } from "@siteimprove/alfa-table";

import { Attribute } from "./attribute";
import { Name } from "./name";
import { Role } from "./role";

import type * as aria from ".";

const { hasInputType, hasName, isElement } = Element;
const { and, or, test } = Predicate;

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
  role: Feature.Aspect.Role = () => [],
  attributes: Feature.Aspect.Attributes = () => [],
  name: Feature.Aspect.Name = () => Branched.of(None)
): Feature {
  return Feature.of(role, attributes, (element, device, state) =>
    Name.fromSteps(
      () => name(element, device, state),
      () => nameFromAttribute(element, "title")
    )
  );
}

function svg(
  role: Feature.Aspect.Role = () => [],
  attributes: Feature.Aspect.Attributes = () => [],
  name: Feature.Aspect.Name = () => Branched.of(None)
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

  return Branched.of(None);
};

const nameFromChild = (predicate: Predicate<Element>) => (
  element: Element,
  device: Device,
  state: Name.State
) => {
  for (const child of element.children().find(and(isElement, predicate))) {
    return Name.fromDescendants(child, device, state.visit(child)).map((name) =>
      name.map((name) =>
        Name.of(name.value, [Name.Source.descendant(element, name)])
      )
    );
  }

  return Branched.of(None);
};

const ids = Cache.empty<Node, Map<string, Element>>();

const labels = Cache.empty<Node, Sequence<Element>>();

const nameFromLabel = (element: Element, device: Device, state: Name.State) => {
  const root = element.root();

  const elements = root.inclusiveDescendants().filter(isElement);

  for (const id of element.id) {
    const target = ids
      .get(root, () =>
        Map.from(
          elements
            .collect((element) =>
              element.id.map((id) => [id, element] as const)
            )
            .reverse()
        )
      )
      .get(id);

    if (target.includes(element)) {
      continue;
    } else {
      return Branched.of(None);
    }
  }

  const targets = labels
    .get(root, () => elements.filter(hasName("label")))
    .filter(
      or(
        (label) => label.descendants().includes(element),
        (label) =>
          label
            .attribute("for")
            .some((attribute) => element.id.includes(attribute.value))
      )
    );

  return Branched.traverse(targets, (element) =>
    Name.fromNode(
      element,
      device,
      state.recurse(true).reference(false).descend(false)
    ).map((name) => [name, element] as const)
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
    a: html((element) =>
      element.attribute("href").isSome() ? Option.of(Role.of("link")) : None
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
        .closest(
          and(isElement, hasName("article", "aside", "main", "nav", "section"))
        )
        .isNone()
        ? Option.of(Role.of("contentinfo"))
        : None
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
        .closest(
          and(isElement, hasName("article", "aside", "main", "nav", "section"))
        )
        .isNone()
        ? Option.of(Role.of("banner"))
        : None
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
        if (
          test<Element>(
            hasInputType("button", "image", "reset", "submit"),
            element
          )
        ) {
          return Option.of(Role.of("button"));
        }

        if (test<Element>(hasInputType("checkbox"), element)) {
          return Option.of(Role.of("checkbox"));
        }

        if (test<Element>(hasInputType("number"), element)) {
          return Option.of(Role.of("spinbutton"));
        }

        if (test<Element>(hasInputType("radio"), element)) {
          return Option.of(Role.of("radio"));
        }

        if (test<Element>(hasInputType("range"), element)) {
          return Option.of(Role.of("slider"));
        }

        if (test<Element>(hasInputType("search"), element)) {
          return Option.of(
            Role.of(
              element.attribute("list").isSome() ? "combobox" : "searchbox"
            )
          );
        }

        if (
          test<Element>(hasInputType("email", "tel", "text", "url"), element)
        ) {
          return Option.of(
            Role.of(element.attribute("list").isSome() ? "combobox" : "textbox")
          );
        }

        return None;
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
      (element, device, state) => {
        if (
          test<Element>(
            hasInputType("text", "password", "search", "tel", "url"),
            element
          )
        ) {
          return Name.fromSteps(
            () => nameFromLabel(element, device, state),
            () => nameFromAttribute(element, "title", "placeholder")
          );
        }

        if (test<Element>(hasInputType("button"), element)) {
          return nameFromAttribute(element, "value");
        }

        if (test<Element>(hasInputType("submit"), element)) {
          return Name.fromSteps(
            () => nameFromAttribute(element, "value"),
            () => Branched.of(Option.of(Name.of("Submit")))
          );
        }

        if (test<Element>(hasInputType("reset"), element)) {
          return Name.fromSteps(
            () => nameFromAttribute(element, "value"),
            () => Branched.of(Option.of(Name.of("Reset")))
          );
        }

        if (test<Element>(hasInputType("image"), element)) {
          return Name.fromSteps(
            () => nameFromAttribute(element, "alt"),
            () => Branched.of(Option.of(Name.of("Submit")))
          );
        }

        return nameFromLabel(element, device, state);
      }
    ),

    li: html((element) =>
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

    output: html(() => Option.of(Role.of("status"))),

    section: html(() => Option.of(Role.of("region"))),

    select: html(
      () =>
        // Despite what the HTML AAM specifies, we always map <select> elements
        // to a listbox widget as they currently have no way of mapping to a
        // valid combobo widget. As a combobox requires an owned textarea and a
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

    textarea: html(
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
      (element, device, state) => {
        return Name.fromSteps(
          () => nameFromLabel(element, device, state),
          () => nameFromAttribute(element, "title", "placeholder")
        );
      }
    ),

    tfoot: html(() => Option.of(Role.of("rowgroup"))),

    th: html(
      (element) => {
        const table = element.closest(and(isElement, hasName("table")));

        // If the <th> is not in a <table>, it doesn't really have a role…
        if (table.isNone()) {
          return None;
        }

        const tableModel = Table.from(table.get());

        // If the <th> is within a <table> with errors, it doesn't really have a
        // role.
        if (tableModel.isErr()) {
          return None;
        }

        const cell = Iterable.find(tableModel.get().cells, (cell) =>
          cell.element.equals(element)
        );

        // If the current element is not a cell in the table, something weird
        // happened and it doesn't have a role.
        if (cell.isNone()) {
          return None;
        }

        // This is not fully correct. If the header has no variant, its role
        // should be computed as a <td>
        // https://www.w3.org/TR/html-aam-1.0/#html-element-role-mappings
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
