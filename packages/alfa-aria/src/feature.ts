import { Cache } from "@siteimprove/alfa-cache";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Scope, Table } from "@siteimprove/alfa-table";

import { Attribute } from "./attribute";
import { Role } from "./role";

const { hasName, isElement } = Element;
const { and } = Predicate;

export class Feature<N extends string = string> {
  public static of<N extends string>(
    name: N,
    role: Feature.Aspect<Iterable<Role>> = () => [],
    attributes: Feature.Aspect<Iterable<Attribute>> = () => [],
    status: Feature.Status = { obsolete: false }
  ): Feature<N> {
    return new Feature(name, role, attributes, status);
  }

  private readonly _name: N;
  private readonly _role: Feature.Aspect<Iterable<Role>>;
  private readonly _attributes: Feature.Aspect<Iterable<Attribute>>;
  private readonly _status: Feature.Status;

  private constructor(
    name: N,
    role: Feature.Aspect<Iterable<Role>>,
    attributes: Feature.Aspect<Iterable<Attribute>>,
    status: Feature.Status
  ) {
    this._name = name;
    this._role = role;
    this._attributes = attributes;
    this._status = status;
  }

  public get name(): N {
    return this._name;
  }

  public get role(): Feature.Aspect<Iterable<Role>> {
    return this._role;
  }

  public get attributes(): Feature.Aspect<Iterable<Attribute>> {
    return this._attributes;
  }

  public get status(): Feature.Status {
    return this._status;
  }
}

export namespace Feature {
  export type Aspect<T> = Mapper<Element, T>;

  export interface Status {
    readonly obsolete: boolean;
  }

  const features = Cache.empty<Namespace, Cache<string, Feature>>();

  export function register<N extends string>(
    namespace: Namespace,
    feature: Feature<N>
  ): Feature<N> {
    features.get(namespace, Cache.empty).set(feature.name, feature);
    return feature;
  }

  export function lookup<N extends string>(
    namespace: Namespace,
    name: N
  ): Option<Feature<N>> {
    return features
      .get(namespace)
      .flatMap((features) => features.get(name) as Option<Feature<N>>);
  }
}

Feature.register(
  Namespace.HTML,
  Feature.of("a", (element) =>
    element.attribute("href").isSome() ? Option.of(Role.of("link")) : None
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of("area", (element) =>
    element.attribute("href").isSome() ? Option.of(Role.of("link")) : None
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of("article", () => Option.of(Role.of("article")))
);

Feature.register(
  Namespace.HTML,
  Feature.of("aside", () => Option.of(Role.of("complementary")))
);

Feature.register(
  Namespace.HTML,
  Feature.of(
    "button",
    () => Option.of(Role.of("button")),
    function* (element) {
      // https://w3c.github.io/html-aam/#att-disabled
      for (const _ of element.attribute("disabled")) {
        yield Attribute.of("aria-disabled", "true");
      }
    }
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of("datalist", () => Option.of(Role.of("listbox")))
);

Feature.register(
  Namespace.HTML,
  Feature.of("dd", () => Option.of(Role.of("definition")))
);

Feature.register(
  Namespace.HTML,
  Feature.of("dfn", () => Option.of(Role.of("term")))
);

Feature.register(
  Namespace.HTML,
  Feature.of(
    "dialog",
    () => Option.of(Role.of("dialog")),
    function* (element) {
      // https://w3c.github.io/html-aam/#att-open-dialog
      yield Attribute.of(
        "aria-expanded",
        element.attribute("open").isSome() ? "true" : "false"
      );
    }
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of(
    "details",
    () => None,
    function* (element) {
      // https://w3c.github.io/html-aam/#att-open-details
      yield Attribute.of(
        "aria-expanded",
        element.attribute("open").isSome() ? "true" : "false"
      );
    }
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of("dt", () => Option.of(Role.of("term")))
);

Feature.register(
  Namespace.HTML,
  Feature.of(
    "fieldset",
    () => Option.of(Role.of("group")),
    function* (element) {
      // https://w3c.github.io/html-aam/#att-disabled
      for (const _ of element.attribute("disabled")) {
        yield Attribute.of("aria-disabled", "true");
      }
    }
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of("figure", () => Option.of(Role.of("figure")))
);

Feature.register(
  Namespace.HTML,
  Feature.of("footer", (element) =>
    element
      .closest(
        and(isElement, hasName("article", "aside", "main", "nav", "section"))
      )
      .isNone()
      ? Option.of(Role.of("contentinfo"))
      : None
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of("form", () => Option.of(Role.of("form")))
);

Feature.register(
  Namespace.HTML,
  Feature.of(
    "h1",
    () => Option.of(Role.of("heading")),
    () => [Attribute.of("aria-level", "1")]
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of(
    "h2",
    () => Option.of(Role.of("heading")),
    () => [Attribute.of("aria-level", "2")]
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of(
    "h3",
    () => Option.of(Role.of("heading")),
    () => [Attribute.of("aria-level", "3")]
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of(
    "h4",
    () => Option.of(Role.of("heading")),
    () => [Attribute.of("aria-level", "4")]
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of(
    "h5",
    () => Option.of(Role.of("heading")),
    () => [Attribute.of("aria-level", "5")]
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of(
    "h6",
    () => Option.of(Role.of("heading")),
    () => [Attribute.of("aria-level", "6")]
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of("header", (element) =>
    element
      .closest(
        and(isElement, hasName("article", "aside", "main", "nav", "section"))
      )
      .isNone()
      ? Option.of(Role.of("banner"))
      : None
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of("hr", () => Option.of(Role.of("separator")))
);

Feature.register(
  Namespace.HTML,
  Feature.of("img", function* (element) {
    if (element.attribute("alt").some((alt) => alt.value === "")) {
      yield Role.of("presentation");
    }

    yield Role.of("img");
  })
);

Feature.register(
  Namespace.HTML,
  Feature.of(
    "input",
    (element) =>
      element
        .attribute("type")
        .andThen<Role>((type) => {
          switch (type.value.toLowerCase()) {
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
            default:
              return Option.of(
                Role.of(
                  element.attribute("list").isSome() ? "combobox" : "textbox"
                )
              );
          }
        })
        .orElse(() => Option.of(Role.of("textbox"))),
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
    }
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of("li", (element) =>
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
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of("main", () => Option.of(Role.of("main")))
);

Feature.register(
  Namespace.HTML,
  Feature.of("math", () => Option.of(Role.of("math")))
);

Feature.register(
  Namespace.HTML,
  Feature.of("menu", () => Option.of(Role.of("list")))
);

Feature.register(
  Namespace.HTML,
  Feature.of("nav", () => Option.of(Role.of("navigation")))
);

Feature.register(
  Namespace.HTML,
  Feature.of("ol", () => Option.of(Role.of("list")))
);

Feature.register(
  Namespace.HTML,
  Feature.of(
    "optgroup",
    () => Option.of(Role.of("group")),
    function* (element) {
      // https://w3c.github.io/html-aam/#att-disabled
      for (const _ of element.attribute("disabled")) {
        yield Attribute.of("aria-disabled", "true");
      }
    }
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of(
    "option",
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
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of("output", () => Option.of(Role.of("status")))
);

Feature.register(
  Namespace.HTML,
  Feature.of("progress", () => Option.of(Role.of("progressbar")))
);

Feature.register(
  Namespace.HTML,
  Feature.of("section", () => Option.of(Role.of("region")))
);

Feature.register(
  Namespace.HTML,
  Feature.of(
    "select",
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
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of("table", () => Option.of(Role.of("table")))
);

Feature.register(
  Namespace.HTML,
  Feature.of("tbody", () => Option.of(Role.of("rowgroup")))
);

Feature.register(
  Namespace.HTML,
  Feature.of(
    "td",
    (element) =>
      element
        .closest(and(Element.isElement, hasName("table")))
        .flatMap<Role>((table) => {
          for (const [roles] of Role.from(table)) {
            const role = roles.first();

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
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of(
    "textarea",
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
    }
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of("tfoot", () => Option.of(Role.of("rowgroup")))
);

Feature.register(
  Namespace.HTML,
  Feature.of(
    "th",
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
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of("thead", () => Option.of(Role.of("rowgroup")))
);

Feature.register(
  Namespace.HTML,
  Feature.of("tr", () => Option.of(Role.of("row")))
);

Feature.register(
  Namespace.HTML,
  Feature.of("ul", () => Option.of(Role.of("list")))
);

Feature.register(
  Namespace.HTML,
  Feature.of(
    "meter",
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
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of(
    "progress",
    () => None,
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
  )
);

Feature.register(
  Namespace.SVG,
  Feature.of("a", (element) =>
    Option.of(Role.of(element.attribute("href").isSome() ? "link" : "group"))
  )
);

Feature.register(
  Namespace.SVG,
  Feature.of("circle", () => Option.of(Role.of("graphics-symbol")))
);

Feature.register(
  Namespace.SVG,
  Feature.of("ellipse", () => Option.of(Role.of("graphics-symbol")))
);

Feature.register(
  Namespace.SVG,
  Feature.of("foreignObject", () => Option.of(Role.of("group")))
);

Feature.register(
  Namespace.SVG,
  Feature.of("g", () => Option.of(Role.of("group")))
);

Feature.register(
  Namespace.SVG,
  Feature.of("image", () => Option.of(Role.of("img")))
);

Feature.register(
  Namespace.SVG,
  Feature.of("line", () => Option.of(Role.of("graphics-symbol")))
);

Feature.register(
  Namespace.SVG,
  Feature.of("mesh", () => Option.of(Role.of("img")))
);

Feature.register(
  Namespace.SVG,
  Feature.of("path", () => Option.of(Role.of("graphics-symbol")))
);

Feature.register(
  Namespace.SVG,
  Feature.of("polygon", () => Option.of(Role.of("graphics-symbol")))
);

Feature.register(
  Namespace.SVG,
  Feature.of("polyline", () => Option.of(Role.of("graphics-symbol")))
);

Feature.register(
  Namespace.SVG,
  Feature.of("rect", () => Option.of(Role.of("graphics-symbol")))
);

Feature.register(
  Namespace.SVG,
  Feature.of("svg", () => Option.of(Role.of("graphics-document")))
);

Feature.register(
  Namespace.SVG,
  Feature.of("symbol", () => Option.of(Role.of("graphics-object")))
);

Feature.register(
  Namespace.SVG,
  Feature.of("text", () => Option.of(Role.of("group")))
);

Feature.register(
  Namespace.SVG,
  Feature.of("textPath", () => Option.of(Role.of("group")))
);

Feature.register(
  Namespace.SVG,
  Feature.of("use", () => Option.of(Role.of("graphics-object")))
);
