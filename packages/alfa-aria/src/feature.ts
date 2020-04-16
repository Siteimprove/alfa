import { Cache } from "@siteimprove/alfa-cache";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Map } from "@siteimprove/alfa-map";
import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Header, Table } from "@siteimprove/alfa-table";

import { Role } from "./role";

const { and, equals, test } = Predicate;

export class Feature<N extends string = string> {
  public static of<N extends string>(
    name: N,
    role: Feature.Aspect<Option<string>> = () => None,
    attributes: Feature.Aspect<Map<string, string>> = () => Map.empty(),
    status: Feature.Status = { obsolete: false }
  ): Feature<N> {
    return new Feature(name, role, attributes, status);
  }

  private readonly _name: N;
  private readonly _role: Feature.Aspect<Option<string>>;
  private readonly _attributes: Feature.Aspect<Map<string, string>>;
  private readonly _status: Feature.Status;

  private constructor(
    name: N,
    role: Feature.Aspect<Option<string>>,
    attributes: Feature.Aspect<Map<string, string>>,
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

  public get role(): Feature.Aspect<Option<string>> {
    return this._role;
  }

  public get attributes(): Feature.Aspect<Map<string, string>> {
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
    element.attribute("href").isSome() ? Option.of("link") : None
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of("area", (element) =>
    element.attribute("href").isSome() ? Option.of("link") : None
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of("article", () => Option.of("article"))
);

Feature.register(
  Namespace.HTML,
  Feature.of("aside", () => Option.of("complementary"))
);

Feature.register(
  Namespace.HTML,
  Feature.of(
    "button",
    () => Option.of("button"),
    (element) => {
      let attributes = Map.empty<string, string>();

      // https://w3c.github.io/html-aam/#att-disabled
      for (const _ of element.attribute("disabled")) {
        attributes = attributes.set("aria-disabled", "true");
      }

      return attributes;
    }
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of("datalist", () => Option.of("listbox"))
);

Feature.register(
  Namespace.HTML,
  Feature.of("dd", () => Option.of("definition"))
);

Feature.register(
  Namespace.HTML,
  Feature.of("dfn", () => Option.of("term"))
);

Feature.register(
  Namespace.HTML,
  Feature.of(
    "dialog",
    () => Option.of("dialog"),
    (element) => {
      let attributes = Map.empty<string, string>();

      // https://w3c.github.io/html-aam/#att-open-dialog
      attributes = attributes.set(
        "aria-expanded",
        element.attribute("open").isSome() ? "true" : "false"
      );

      return attributes;
    }
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of(
    "details",
    () => None,
    (element) => {
      let attributes = Map.empty<string, string>();

      // https://w3c.github.io/html-aam/#att-open-details
      attributes = attributes.set(
        "aria-expanded",
        element.attribute("open").isSome() ? "true" : "false"
      );

      return attributes;
    }
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of("dt", () => Option.of("term"))
);

Feature.register(
  Namespace.HTML,
  Feature.of(
    "fieldset",
    () => Option.of("group"),
    (element) => {
      let attributes = Map.empty<string, string>();

      // https://w3c.github.io/html-aam/#att-disabled
      for (const _ of element.attribute("disabled")) {
        attributes = attributes.set("aria-disabled", "true");
      }

      return attributes;
    }
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of("figure", () => Option.of("figure"))
);

Feature.register(
  Namespace.HTML,
  Feature.of("footer", (element) =>
    element
      .closest(
        and(Element.isElement, (element) =>
          test(
            equals("article", "aside", "main", "nav", "section"),
            element.name
          )
        )
      )
      .isNone()
      ? Option.of("contentinfo")
      : None
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of("form", () => Option.of("form"))
);

Feature.register(
  Namespace.HTML,
  Feature.of(
    "h1",
    () => Option.of("heading"),
    () => Map.of(["aria-level", "1"])
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of(
    "h2",
    () => Option.of("heading"),
    () => Map.of(["aria-level", "2"])
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of(
    "h3",
    () => Option.of("heading"),
    () => Map.of(["aria-level", "3"])
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of(
    "h4",
    () => Option.of("heading"),
    () => Map.of(["aria-level", "4"])
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of(
    "h5",
    () => Option.of("heading"),
    () => Map.of(["aria-level", "5"])
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of(
    "h6",
    () => Option.of("heading"),
    () => Map.of(["aria-level", "6"])
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of("header", (element) =>
    element
      .closest(
        and(Element.isElement, (element) =>
          test(
            equals("article", "aside", "main", "nav", "section"),
            element.name
          )
        )
      )
      .isNone()
      ? Option.of("banner")
      : None
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of("hr", () => Option.of("separator"))
);

Feature.register(
  Namespace.HTML,
  Feature.of("img", (element) =>
    Option.of(
      element.attribute("alt").some((alt) => alt.value === "")
        ? "presentation"
        : "img"
    )
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of(
    "input",
    (element) =>
      element
        .attribute("type")
        .andThen((type) => {
          switch (type.value.toLowerCase()) {
            case "button":
            case "image":
            case "reset":
            case "submit":
              return Option.of("button");

            case "checkbox":
              return Option.of("checkbox");

            case "number":
              return Option.of("spinbutton");

            case "radio":
              return Option.of("radio");

            case "range":
              return Option.of("slider");

            case "search":
              return Option.of(
                element.attribute("list").isSome() ? "combobox" : "searchbox"
              );

            case "email":
            case "tel":
            case "text":
            case "url":
            default:
              return Option.of(
                element.attribute("list").isSome() ? "combobox" : "textbox"
              );
          }
        })
        .orElse(() => Option.of("textbox")),
    (element) => {
      let attributes = Map.empty<string, string>();

      // https://w3c.github.io/html-aam/#att-checked
      attributes = attributes.set(
        "aria-checked",
        element.attribute("checked").isSome() ? "true" : "false"
      );

      // https://w3c.github.io/html-aam/#att-list
      for (const { value } of element.attribute("list")) {
        attributes = attributes.set("aria-controls", value);
      }

      // https://w3c.github.io/html-aam/#att-max-input
      for (const { value } of element.attribute("max")) {
        attributes = attributes.set("aria-valuemax", value);
      }

      // https://w3c.github.io/html-aam/#att-min-input
      for (const { value } of element.attribute("min")) {
        attributes = attributes.set("aria-valuemin", value);
      }

      // https://w3c.github.io/html-aam/#att-readonly
      for (const _ of element.attribute("readonly")) {
        attributes = attributes.set("aria-readonly", "true");
      }

      // https://w3c.github.io/html-aam/#att-required
      for (const _ of element.attribute("required")) {
        attributes = attributes.set("aria-required", "true");
      }

      // https://w3c.github.io/html-aam/#att-disabled
      for (const _ of element.attribute("disabled")) {
        attributes = attributes.set("aria-disabled", "true");
      }

      // https://w3c.github.io/html-aam/#att-placeholder
      for (const { value } of element.attribute("placeholder")) {
        attributes = attributes.set("aria-placeholder", value);
      }

      return attributes;
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
            return Option.of("listitem");
        }

        return None;
      })
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of("main", () => Option.of("main"))
);

Feature.register(
  Namespace.HTML,
  Feature.of("math", () => Option.of("math"))
);

Feature.register(
  Namespace.HTML,
  Feature.of("menu", () => Option.of("list"))
);

Feature.register(
  Namespace.HTML,
  Feature.of("nav", () => Option.of("navigation"))
);

Feature.register(
  Namespace.HTML,
  Feature.of("ol", () => Option.of("list"))
);

Feature.register(
  Namespace.HTML,
  Feature.of(
    "optgroup",
    () => Option.of("group"),
    (element) => {
      let attributes = Map.empty<string, string>();

      // https://w3c.github.io/html-aam/#att-disabled
      for (const _ of element.attribute("disabled")) {
        attributes = attributes.set("aria-disabled", "true");
      }

      return attributes;
    }
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of(
    "option",
    (element) =>
      element
        .closest(
          and(Element.isElement, (element) =>
            test(equals("select", "optgroup", "datalist"), element.name)
          )
        )
        .isSome()
        ? Option.of("option")
        : None,
    (element) => {
      let attributes = Map.empty<string, string>();

      // https://w3c.github.io/html-aam/#att-disabled
      for (const _ of element.attribute("disabled")) {
        attributes = attributes.set("aria-disabled", "true");
      }

      // https://w3c.github.io/html-aam/#att-selected
      attributes = attributes.set(
        "aria-selected",
        element.attribute("selected").isSome() ? "true" : "false"
      );

      return attributes;
    }
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of("output", () => Option.of("status"))
);

Feature.register(
  Namespace.HTML,
  Feature.of("progress", () => Option.of("progressbar"))
);

Feature.register(
  Namespace.HTML,
  Feature.of("section", () => Option.of("region"))
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
      Option.of("listbox"),
    (element) => {
      let attributes = Map.empty<string, string>();

      // https://w3c.github.io/html-aam/#att-disabled
      for (const _ of element.attribute("disabled")) {
        attributes = attributes.set("aria-disabled", "true");
      }

      // https://w3c.github.io/html-aam/#att-required
      for (const _ of element.attribute("required")) {
        attributes = attributes.set("aria-required", "true");
      }

      // https://w3c.github.io/html-aam/#att-multiple-select
      for (const _ of element.attribute("multiple")) {
        attributes = attributes.set("aria-multiselectable", "true");
      }

      return attributes;
    }
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of("table", () => Option.of("table"))
);

Feature.register(
  Namespace.HTML,
  Feature.of("tbody", () => Option.of("rowgroup"))
);

Feature.register(
  Namespace.HTML,
  Feature.of(
    "td",
    (element) =>
      element
        .closest(and(Element.isElement, (element) => element.name === "table"))
        .flatMap((table) => {
          for (const [role] of Role.from(table)) {
            if (role.isSome()) {
              switch (role.get().name) {
                case "table":
                  return Option.of("cell");
                case "grid":
                  return Option.of("gridcell");
              }
            }
          }

          return None;
        }),
    (element) => {
      let attributes = Map.empty<string, string>();

      // https://w3c.github.io/html-aam/#att-colspan
      for (const { value } of element.attribute("colspan")) {
        attributes = attributes.set("aria-colspan", value);
      }

      // https://w3c.github.io/html-aam/#att-rowspan
      for (const { value } of element.attribute("rowspan")) {
        attributes = attributes.set("aria-rowspan", value);
      }

      return attributes;
    }
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of(
    "textarea",
    () => Option.of("textbox"),
    (element) => {
      let attributes = Map.empty<string, string>();

      // https://w3c.github.io/html-aam/#att-disabled
      for (const _ of element.attribute("disabled")) {
        attributes = attributes.set("aria-disabled", "true");
      }

      // https://w3c.github.io/html-aam/#att-readonly
      for (const _ of element.attribute("readonly")) {
        attributes = attributes.set("aria-readonly", "true");
      }

      // https://w3c.github.io/html-aam/#att-required
      for (const _ of element.attribute("required")) {
        attributes = attributes.set("aria-required", "true");
      }

      // https://w3c.github.io/html-aam/#att-placeholder
      for (const { value } of element.attribute("placeholder")) {
        attributes = attributes.set("aria-placeholder", value);
      }

      return attributes;
    }
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of("tfoot", () => Option.of("rowgroup"))
);

Feature.register(
  Namespace.HTML,
  Feature.of(
    "th",
    (element) => {
      const table = element.closest(
        and(Element.isElement, Element.hasName("table"))
      );
      // If the <th> is not in a <table>, it doesn't really have a role…
      if (table.isNone()) return None;

      // Is this going to be memoized or re-computed every time?
      const tableModel = Table.from(table.get());
      // If the <th> is within a <table> with errors, it doesn't really have a role.
      if (tableModel.isErr()) return None;

      const cell = Iterable.find(tableModel.get().cells, (cell) =>
        cell.element.equals(element)
      );
      // If the current element is not a cell in the table, something weird happened and it doesn't have a role.
      if (cell.isNone()) return None;

      // This is not fully correct. If the header has no variant, its role should be computed as a <td>
      // @see https://www.w3.org/TR/html-aam-1.0/#html-element-role-mappings
      //     "th (is neither column header nor row header, and ancestor table element has table role)"
      // and "th (is neither column header nor row header, and ancestor table element has grid role)"
      return cell.get().variant.map((variant) => {
        switch (variant) {
          case Header.Variant.Column:
          case Header.Variant.ColumnGroup:
            return "ColumnHeader";
          case Header.Variant.Row:
          case Header.Variant.RowGroup:
            return "RowHeader";
        }
      });
    },

    (element) => {
      let attributes = Map.empty<string, string>();

      // https://w3c.github.io/html-aam/#att-colspan
      for (const { value } of element.attribute("colspan")) {
        attributes = attributes.set("aria-colspan", value);
      }

      // https://w3c.github.io/html-aam/#att-rowspan
      for (const { value } of element.attribute("rowspan")) {
        attributes = attributes.set("aria-rowspan", value);
      }

      return attributes;
    }
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of("thead", () => Option.of("rowgroup"))
);

Feature.register(
  Namespace.HTML,
  Feature.of("tr", () => Option.of("row"))
);

Feature.register(
  Namespace.HTML,
  Feature.of("ul", () => Option.of("list"))
);

Feature.register(
  Namespace.HTML,
  Feature.of(
    "meter",
    () => None,
    (element) => {
      let attributes = Map.empty<string, string>();

      // https://w3c.github.io/html-aam/#att-max
      for (const { value } of element.attribute("max")) {
        attributes = attributes.set("aria-valuemax", value);
      }

      // https://w3c.github.io/html-aam/#att-min
      for (const { value } of element.attribute("min")) {
        attributes = attributes.set("aria-valuemin", value);
      }

      // https://w3c.github.io/html-aam/#att-value-meter
      for (const { value } of element.attribute("value")) {
        attributes = attributes.set("aria-valuenow", value);
      }

      return attributes;
    }
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of(
    "progress",
    () => None,
    (element) => {
      let attributes = Map.empty<string, string>();

      // https://w3c.github.io/html-aam/#att-max
      for (const { value } of element.attribute("max")) {
        attributes = attributes.set("aria-valuemax", value);
      }

      // https://w3c.github.io/html-aam/#att-value-meter
      for (const { value } of element.attribute("value")) {
        attributes = attributes.set("aria-valuenow", value);
      }

      return attributes;
    }
  )
);

Feature.register(
  Namespace.SVG,
  Feature.of("a", (element) =>
    Option.of(element.attribute("href").isSome() ? "link" : "group")
  )
);

Feature.register(
  Namespace.SVG,
  Feature.of("circle", () => Option.of("graphics-symbol"))
);

Feature.register(
  Namespace.SVG,
  Feature.of("ellipse", () => Option.of("graphics-symbol"))
);

Feature.register(
  Namespace.SVG,
  Feature.of("foreignObject", () => Option.of("group"))
);

Feature.register(
  Namespace.SVG,
  Feature.of("g", () => Option.of("group"))
);

Feature.register(
  Namespace.SVG,
  Feature.of("image", () => Option.of("img"))
);

Feature.register(
  Namespace.SVG,
  Feature.of("line", () => Option.of("graphics-symbol"))
);

Feature.register(
  Namespace.SVG,
  Feature.of("mesh", () => Option.of("img"))
);

Feature.register(
  Namespace.SVG,
  Feature.of("path", () => Option.of("graphics-symbol"))
);

Feature.register(
  Namespace.SVG,
  Feature.of("polygon", () => Option.of("graphics-symbol"))
);

Feature.register(
  Namespace.SVG,
  Feature.of("polyline", () => Option.of("graphics-symbol"))
);

Feature.register(
  Namespace.SVG,
  Feature.of("rect", () => Option.of("graphics-symbol"))
);

Feature.register(
  Namespace.SVG,
  Feature.of("svg", () => Option.of("graphics-document"))
);

Feature.register(
  Namespace.SVG,
  Feature.of("symbol", () => Option.of("graphics-object"))
);

Feature.register(
  Namespace.SVG,
  Feature.of("text", () => Option.of("group"))
);

Feature.register(
  Namespace.SVG,
  Feature.of("textPath", () => Option.of("group"))
);

Feature.register(
  Namespace.SVG,
  Feature.of("use", () => Option.of("graphics-object"))
);
