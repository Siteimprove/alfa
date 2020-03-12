import { Cache } from "@siteimprove/alfa-cache";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Map } from "@siteimprove/alfa-map";
import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";

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
      .flatMap(features => features.get(name) as Option<Feature<N>>);
  }
}

Feature.register(
  Namespace.HTML,
  Feature.of("a", element =>
    element.attribute("href").isSome() ? Option.of("link") : None
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of("area", element =>
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
  Feature.of("button", () => Option.of("button"))
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
  Feature.of("dialog", () => Option.of("dialog"))
);

Feature.register(
  Namespace.HTML,
  Feature.of("dt", () => Option.of("term"))
);

Feature.register(
  Namespace.HTML,
  Feature.of("fieldset", () => Option.of("group"))
);

Feature.register(
  Namespace.HTML,
  Feature.of("figure", () => Option.of("figure"))
);

Feature.register(
  Namespace.HTML,
  Feature.of("footer", element =>
    element
      .closest(
        and(Element.isElement, element =>
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
  Feature.of("h1", () => Option.of("heading"))
);

Feature.register(
  Namespace.HTML,
  Feature.of("h2", () => Option.of("heading"))
);

Feature.register(
  Namespace.HTML,
  Feature.of("h3", () => Option.of("heading"))
);

Feature.register(
  Namespace.HTML,
  Feature.of("h4", () => Option.of("heading"))
);

Feature.register(
  Namespace.HTML,
  Feature.of("h5", () => Option.of("heading"))
);

Feature.register(
  Namespace.HTML,
  Feature.of("h6", () => Option.of("heading"))
);

Feature.register(
  Namespace.HTML,
  Feature.of("header", element =>
    element
      .closest(
        and(Element.isElement, element =>
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
  Feature.of("img", element =>
    Option.of(
      element.attribute("alt").some(alt => alt.value === "")
        ? "presentation"
        : "img"
    )
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of(
    "input",
    element =>
      element
        .attribute("type")
        .andThen(type => {
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
    element => {
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
      if (element.attribute("readonly").isSome()) {
        attributes = attributes.set("aria-readonly", "true");
      }

      // https://w3c.github.io/html-aam/#att-required
      if (element.attribute("required").isSome()) {
        attributes = attributes.set("aria-required", "true");
      }

      return attributes;
    }
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of("li", element =>
    element
      .parent()
      .filter(Element.isElement)
      .flatMap(parent => {
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
  Feature.of("optgroup", () => Option.of("group"))
);

Feature.register(
  Namespace.HTML,
  Feature.of("option", element =>
    element
      .closest(
        and(Element.isElement, element =>
          test(equals("select", "optgroup", "datalist"), element.name)
        )
      )
      .isSome()
      ? Option.of("option")
      : None
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
  Feature.of("select", element => {
    if (
      element.attribute("multiple").isSome() &&
      element.attribute("size").some(size => parseInt(size.value) > 1)
    ) {
      return Option.of("listbox");
    }

    return Option.of("combobox");
  })
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
  Feature.of("td", element =>
    element
      .closest(and(Element.isElement, element => element.name === "table"))
      .flatMap(table => {
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
      })
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of("textarea", () => Option.of("textbox"))
);

Feature.register(
  Namespace.HTML,
  Feature.of("tfoot", () => Option.of("rowgroup"))
);

Feature.register(
  Namespace.HTML,
  Feature.of("th", element =>
    element.attribute("scope").flatMap(scope => {
      switch (scope.value.toLowerCase()) {
        case "row":
        case "rowgroup":
          return Option.of("RowHeader");
        case "col":
        case "colgroup":
          return Option.of("ColumnHeader");
        default:
          return None;
      }
    })
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
  Namespace.SVG,
  Feature.of("a", element =>
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
