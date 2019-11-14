import { Cache } from "@siteimprove/alfa-cache";
import {
  Element,
  getAttribute,
  getClosest,
  getInputType,
  getParentElement,
  InputType,
  Namespace,
  Node
} from "@siteimprove/alfa-dom";
import { None, Option } from "@siteimprove/alfa-option";

import { getRole } from "./get-role";

export class Feature<N extends string = string> {
  public static of<N extends string>(
    name: N,
    role: Feature.Aspect<Option<string>> = () => None,
    status: Feature.Status = { obsolete: false }
  ): Feature<N> {
    return new Feature(name, role, status);
  }

  public readonly name: N;
  public readonly role: Feature.Aspect<Option<string>>;
  public readonly status: Feature.Status;

  private constructor(
    name: N,
    role: Feature.Aspect<Option<string>>,
    status: Feature.Status
  ) {
    this.name = name;
    this.role = role;
    this.status = status;
  }
}

export namespace Feature {
  export type Aspect<T> = (element: Element, context: Node) => T;

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
  Feature.of("a", (anchor, context) =>
    getAttribute(anchor, context, "href").map(() => "link")
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of("area", (area, context) =>
    getAttribute(area, context, "href").map(() => "link")
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

Feature.register(Namespace.HTML, Feature.of("dfn", () => Option.of("term")));

Feature.register(
  Namespace.HTML,
  Feature.of("dialog", () => Option.of("dialog"))
);

Feature.register(Namespace.HTML, Feature.of("dt", () => Option.of("term")));

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
  Feature.of("footer", (footer, context) =>
    getClosest(footer, context, "article, aside, main, nav, section").isNone()
      ? Option.of("contentinfo")
      : None
  )
);

Feature.register(Namespace.HTML, Feature.of("form", () => Option.of("form")));

Feature.register(Namespace.HTML, Feature.of("h1", () => Option.of("heading")));

Feature.register(Namespace.HTML, Feature.of("h2", () => Option.of("heading")));

Feature.register(Namespace.HTML, Feature.of("h3", () => Option.of("heading")));

Feature.register(Namespace.HTML, Feature.of("h4", () => Option.of("heading")));

Feature.register(Namespace.HTML, Feature.of("h5", () => Option.of("heading")));

Feature.register(Namespace.HTML, Feature.of("h6", () => Option.of("heading")));

Feature.register(
  Namespace.HTML,
  Feature.of("header", (footer, context) =>
    getClosest(footer, context, "article, aside, main, nav, section").isNone()
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
  Feature.of("img", (img, context) =>
    getAttribute(img, context, "alt")
      .filter(alt => alt !== "")
      .and(Option.of("img"))
      .or(Option.of("presentation"))
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of("input", (input, context) =>
    getInputType(input, context).flatMap(inputType => {
      switch (inputType) {
        case InputType.Button:
        case InputType.Image:
        case InputType.Reset:
        case InputType.Submit:
          return Option.of("button");

        case InputType.Checkbox:
          return Option.of("checkbox");

        case InputType.Number:
          return Option.of("spinbutton");

        case InputType.Radio:
          return Option.of("radio");

        case InputType.Range:
          return Option.of("slider");

        case InputType.Search:
          return Option.of(
            getAttribute(input, context, "list").isSome()
              ? "combobox"
              : "searchbox"
          );

        case InputType.Email:
        case InputType.Tel:
        case InputType.Text:
        case InputType.Url:
          return Option.of(
            getAttribute(input, context, "list").isSome()
              ? "combobox"
              : "textbox"
          );

        default:
          return None;
      }
    })
  )
);

Feature.register(
  Namespace.HTML,
  Feature.of("li", (li, context) =>
    getParentElement(li, context).flatMap(parentElement => {
      switch (parentElement.localName) {
        case "ol":
        case "ul":
        case "menu":
          return Option.of("listitem");
      }

      return None;
    })
  )
);

Feature.register(Namespace.HTML, Feature.of("main", () => Option.of("main")));

Feature.register(Namespace.HTML, Feature.of("math", () => Option.of("math")));

Feature.register(Namespace.HTML, Feature.of("menu", () => Option.of("list")));

Feature.register(
  Namespace.HTML,
  Feature.of("nav", () => Option.of("navigation"))
);

Feature.register(Namespace.HTML, Feature.of("ol", () => Option.of("list")));

Feature.register(
  Namespace.HTML,
  Feature.of("optgroup", () => Option.of("group"))
);

Feature.register(
  Namespace.HTML,
  Feature.of("option", (option, context) =>
    getClosest(option, context, "select, optgroup, datalist").and(
      Option.of("option")
    )
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
  Feature.of("select", (select, context) => {
    if (
      getAttribute(select, context, "multiple").isSome() &&
      getAttribute(select, context, "size")
        .filter(size => parseInt(size) > 1)
        .isSome()
    ) {
      return Option.of("listbox");
    }

    return Option.of("combobox");
  })
);

Feature.register(Namespace.HTML, Feature.of("table", () => Option.of("table")));

Feature.register(
  Namespace.HTML,
  Feature.of("tbody", () => Option.of("rowgroup"))
);

Feature.register(
  Namespace.HTML,
  Feature.of("td", (td, context) =>
    getClosest(td, context, "table").flatMap(table => {
      for (const [role] of getRole(table, context)) {
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
  Feature.of("th", (th, context) =>
    getAttribute(th, context, "scope").flatMap(scope => {
      switch (scope) {
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

Feature.register(Namespace.HTML, Feature.of("tr", () => Option.of("row")));

Feature.register(Namespace.HTML, Feature.of("ul", () => Option.of("list")));

Feature.register(
  Namespace.SVG,
  Feature.of("a", (element, context) =>
    getAttribute(element, context, "href")
      .and(Option.of("link"))
      .or(Option.of("group"))
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

Feature.register(Namespace.SVG, Feature.of("g", () => Option.of("group")));

Feature.register(Namespace.SVG, Feature.of("image", () => Option.of("img")));

Feature.register(
  Namespace.SVG,
  Feature.of("line", () => Option.of("graphics-symbol"))
);

Feature.register(Namespace.SVG, Feature.of("mesh", () => Option.of("img")));

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

Feature.register(Namespace.SVG, Feature.of("text", () => Option.of("group")));

Feature.register(
  Namespace.SVG,
  Feature.of("textPath", () => Option.of("group"))
);

Feature.register(
  Namespace.SVG,
  Feature.of("use", () => Option.of("graphics-object"))
);
