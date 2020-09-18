import { h } from "@siteimprove/alfa-dom";

/**
 * @see https://html.spec.whatwg.org/#rendering
 * @internal
 */
export const UserAgent = h.sheet([
  h.rule.namespace("http://www.w3.org/1999/xhtml"),

  /**
   * @see https://html.spec.whatwg.org/#hidden-elements
   */

  h.rule.style(
    "[hidden], base, basefont, datalist, head, link, meta, noembed, noframes, param, rp, script, source, style, template, track, title",
    {
      display: "none",
    }
  ),

  // <area> elements are a little special in that while they are not rendered,
  // they are focusable for the purpose of users interacting with the image
  // reference of the <area> element. To accommodate this, we assign them a
  // default display property of inline rather than none.
  h.rule.style("area", {
    display: "inline",
  }),

  h.rule.style("embed[hidden]", {
    display: "inline",
    height: "0",
    width: "0",
  }),

  h.rule.style("input[type=hidden i]", {
    display: "none !important",
  }),

  h.rule.media("(scripting)", [
    h.rule.style("noscript", {
      display: "none !important",
    }),
  ]),

  /**
   * @see https://html.spec.whatwg.org/#the-page
   */

  h.rule.style("html, body", {
    display: "block",
  }),

  /**
   * @see https://html.spec.whatwg.org/#non-replaced-elements-flow-content
   */

  h.rule.style(
    "address, blockquote, center, div, figure, figcaption, footer, form, header, hr, legend, listing, main, p, plaintext, pre, xmp",
    {
      display: "block",
    }
  ),

  h.rule.style("dialog:not([open])", {
    display: "none",
  }),

  h.rule.style("dialog", {
    color: "black",
  }),

  h.rule.style("slot", {
    display: "contents",
  }),

  /**
   * @see https://html.spec.whatwg.org/#non-replaced-elements-phrasing-content
   */

  h.rule.style("big", {
    fontSize: "larger",
  }),

  h.rule.style("small", {
    fontSize: "smaller",
  }),

  h.rule.style("ruby", {
    display: "ruby",
  }),

  h.rule.style("rt", {
    display: "ruby-text",
  }),

  h.rule.style(":link", {
    color: "#0000ee",
  }),

  h.rule.style(":visited", {
    color: "#551a8b",
  }),

  h.rule.style(":link:active, :visited:active", {
    color: "#ff0000",
  }),

  h.rule.style("mark", {
    color: "black",
  }),

  /**
   * @see https://html.spec.whatwg.org/#sections-and-headings
   */

  h.rule.style("article, aside, h1, h2, h3, h4, h5, h6, hgroup, nav, section", {
    display: "block",
  }),

  h.rule.style("h1", {
    fontSize: "2.00em",
  }),

  h.rule.style("h2", {
    fontSize: "1.50em",
  }),

  h.rule.style("h3", {
    fontSize: "1.17em",
  }),

  h.rule.style("h4", {
    fontSize: "1.00em",
  }),

  h.rule.style("h5", {
    fontSize: "0.83em",
  }),

  h.rule.style("h6", {
    fontSize: "0.67em",
  }),

  /**
   * @see https://html.spec.whatwg.org/#section-lists
   */

  h.rule.style("dir, dd, dl, dt, ol, ul", {
    display: "block",
  }),

  h.rule.style("li", {
    display: "list-item",
  }),

  /**
   * @see https://html.spec.whatwg.org/#tables
   */

  h.rule.style("table", {
    display: "table",
  }),

  h.rule.style("caption", {
    display: "table-caption",
  }),

  h.rule.style("colgroup, colgroup[hidden]", {
    display: "table-column-group",
  }),

  h.rule.style("col, col[hidden]", {
    display: "table-column",
  }),

  h.rule.style("thead, thead[hidden]", {
    display: "table-header-group",
  }),

  h.rule.style("tbody, tbody[hidden]", {
    display: "table-row-group",
  }),

  h.rule.style("tfoot, tfoot[hidden]", {
    display: "table-footer-group",
  }),

  h.rule.style("tr, tr[hidden]", {
    display: "table-row",
  }),

  h.rule.style("td, th, td[hidden], th[hidden]", {
    display: "table-cell",
  }),

  h.rule.style(
    "colgroup[hidden], col[hidden], thead[hidden], tbody[hidden], tfoot[hidden], tr[hidden], td[hidden], th[hidden]",
    {
      visibility: "collapse",
    }
  ),

  h.rule.style(":matches(table, thead, tbody, tfoot, tr) > form", {
    display: "none !important",
  }),

  /**
   * @see https://html.spec.whatwg.org/#the-hr-element-rendering
   */

  h.rule.style("hr", {
    color: "gray",
  }),

  /**
   * @see https://html.spec.whatwg.org/#the-fieldset-and-legend-elements
   */

  h.rule.style("fieldset", {
    display: "block",
  }),
]);
