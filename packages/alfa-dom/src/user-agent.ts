import { keys } from "@siteimprove/alfa-util";
import { Style, parseRule } from "@siteimprove/alfa-css";
import { StyleSheet, Rule, RuleType, StyleRule } from "./types";

/**
 * @see https://www.w3.org/TR/html/rendering.html
 */
export const UserAgent: StyleSheet = {
  cssRules: [
    // cssRule("@namespace url(http://www.w3.org/1999/xhtml)"),

    /**
     * @see https://www.w3.org/TR/html/rendering.html#hidden-elements
     */

    cssRule(
      "[hidden], area, base, basefont, datalist, head, link, meta, noembed, noframes, param, rp, script, source, style, template, track, title",
      {
        display: "none"
      }
    ),

    cssRule("embed[hidden]", {
      display: "inline"
    }),

    cssRule("input[type=hidden i]", {
      display: "none !important"
    }),

    /**
     * @see https://www.w3.org/TR/html/rendering.html#the-page
     */

    cssRule("html, body", {
      display: "block"
    }),

    /**
     * @see https://www.w3.org/TR/html/rendering.html#non-replaced-elements-flow-content
     */

    cssRule(
      "address, blockquote, center, div, figure, figcaption, footer, form, header, hr, legend, listing, main, p, plaintext, pre, xmp",
      {
        display: "block"
      }
    ),

    cssRule("dialog:not([open])", {
      display: "none"
    }),

    cssRule("dialog", {
      color: "black"
    }),

    cssRule("slot", {
      display: "contents"
    }),

    /**
     * @see https://www.w3.org/TR/html/rendering.html#non-replaced-elements-phrasing-content
     */

    cssRule("big", {
      fontSize: "larger"
    }),

    cssRule("small", {
      fontSize: "smaller"
    }),

    cssRule("ruby", {
      display: "ruby"
    }),

    cssRule("rt", {
      display: "ruby-text"
    }),

    cssRule(":link", {
      color: "#0000ee"
    }),

    cssRule(":visited", {
      color: "#551a8b"
    }),

    cssRule(":link:active, :visited:active", {
      color: "#ff0000"
    }),

    cssRule("mark", {
      color: "black"
    }),

    /**
     * @see https://www.w3.org/TR/html/rendering.html#sections-and-headings
     */

    cssRule("article, aside, h1, h2, h3, h4, h5, h6, hgroup, nav, section", {
      display: "block"
    }),

    cssRule("h1", {
      fontSize: "2.00em"
    }),

    cssRule("h2", {
      fontSize: "1.50em"
    }),

    cssRule("h3", {
      fontSize: "1.17em"
    }),

    cssRule("h4", {
      fontSize: "1.00em"
    }),

    cssRule("h5", {
      fontSize: "0.83em"
    }),

    cssRule("h6", {
      fontSize: "0.67em"
    }),

    /**
     * @see https://www.w3.org/TR/html/rendering.html#section-lists
     */

    cssRule("dir, dd, dl, dt, ol, ul", {
      display: "block"
    }),

    cssRule("li", {
      display: "list-item"
    }),

    /**
     * @see https://www.w3.org/TR/html/rendering.html#tables
     */

    cssRule("table", {
      display: "table"
    }),

    cssRule("caption", {
      display: "table-caption"
    }),

    cssRule("colgroup, colgroup[hidden]", {
      display: "table-column-group"
    }),

    cssRule("col, col[hidden]", {
      display: "table-column"
    }),

    cssRule("thead, thead[hidden]", {
      display: "table-header-group"
    }),

    cssRule("tbody, tbody[hidden]", {
      display: "table-row-group"
    }),

    cssRule("tfoot, tfoot[hidden]", {
      display: "table-footer-group"
    }),

    cssRule("tr, tr[hidden]", {
      display: "table-row"
    }),

    cssRule("td, th, td[hidden], th[hidden]", {
      display: "table-cell"
    }),

    cssRule(
      "colgroup[hidden], col[hidden], thead[hidden], tbody[hidden], tfoot[hidden], tr[hidden], td[hidden], th[hidden]",
      {
        visibility: "collapse"
      }
    ),

    cssRule(":matches(table, thead, tbody, tfoot, tr) > form", {
      display: "none !important"
    }),

    /**
     * @see https://www.w3.org/TR/html/rendering.html#the-hr-element-rendering
     */

    cssRule("hr", {
      color: "gray"
    }),

    /**
     * @see https://www.w3.org/TR/html/rendering.html#the-fieldset-and-legend-elements
     */

    cssRule("fieldset", {
      display: "block"
    })
  ]
};

/**
 * @internal
 */
export function isUserAgentRule(rule: Rule): boolean {
  const { cssRules } = UserAgent;

  for (let i = 0, n = cssRules.length; i < n; i++) {
    if (cssRules[i] === rule) {
      return true;
    }
  }

  return false;
}

function cssRule(
  prelude: string,
  style: { [P in keyof Style]: string } = {}
): Rule {
  const parsed = parseRule(prelude);

  if (parsed === null) {
    const rule: StyleRule = {
      type: RuleType.Style,
      selectorText: prelude,
      style: {
        cssText: keys(style)
          .map(property => `${hyphenCase(property)}: ${style[property]}`)
          .join("; ")
      }
    };
    return rule;
  }

  throw new Error(`Invalid prelude "${prelude}"`);
}

function hyphenCase(input: string): string {
  return input.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}
