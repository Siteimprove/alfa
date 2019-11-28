import { StyleRule, StyleSheet, Declaration } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-option";

/**
 * @see https://html.spec.whatwg.org/#rendering
 * @internal
 */
export const UserAgent = StyleSheet.of(self => [
  // cssRule("@namespace url(http://www.w3.org/1999/xhtml)"),

  /**
   * @see https://html.spec.whatwg.org/#hidden-elements
   */

  StyleRule.of(
    "[hidden], base, basefont, datalist, head, link, meta, noembed, noframes, param, rp, script, source, style, template, track, title",
    self => [Declaration.of("display", "none", false, Option.of(self))],
    self
  )

  // // <area> elements are a little special in that while they are not rendered,
  // // they are focusable for the purpose of users interacting with the image
  // // reference of the <area> element. To accommodate this, we assign them a
  // // default display property of inline rather than none.
  // cssRule("area", {
  //   display: "inline"
  // }),

  // cssRule("embed[hidden]", {
  //   display: "inline",
  //   height: "0",
  //   width: "0"
  // }),

  // cssRule("input[type=hidden i]", {
  //   display: "none !important"
  // }),

  // /**
  //  * @see https://html.spec.whatwg.org/#the-page
  //  */

  // cssRule("html, body", {
  //   display: "block"
  // }),

  // /**
  //  * @see https://html.spec.whatwg.org/#non-replaced-elements-flow-content
  //  */

  // cssRule(
  //   "address, blockquote, center, div, figure, figcaption, footer, form, header, hr, legend, listing, main, p, plaintext, pre, xmp",
  //   {
  //     display: "block"
  //   }
  // ),

  // cssRule("dialog:not([open])", {
  //   display: "none"
  // }),

  // cssRule("dialog", {
  //   color: "black"
  // }),

  // cssRule("slot", {
  //   display: "contents"
  // }),

  // /**
  //  * @see https://html.spec.whatwg.org/#non-replaced-elements-phrasing-content
  //  */

  // cssRule("big", {
  //   fontSize: "larger"
  // }),

  // cssRule("small", {
  //   fontSize: "smaller"
  // }),

  // cssRule("ruby", {
  //   display: "ruby"
  // }),

  // cssRule("rt", {
  //   display: "ruby-text"
  // }),

  // cssRule(":link", {
  //   color: "#0000ee"
  // }),

  // cssRule(":visited", {
  //   color: "#551a8b"
  // }),

  // cssRule(":link:active, :visited:active", {
  //   color: "#ff0000"
  // }),

  // cssRule("mark", {
  //   color: "black"
  // }),

  // /**
  //  * @see https://html.spec.whatwg.org/#sections-and-headings
  //  */

  // cssRule("article, aside, h1, h2, h3, h4, h5, h6, hgroup, nav, section", {
  //   display: "block"
  // }),

  // cssRule("h1", {
  //   fontSize: "2.00em"
  // }),

  // cssRule("h2", {
  //   fontSize: "1.50em"
  // }),

  // cssRule("h3", {
  //   fontSize: "1.17em"
  // }),

  // cssRule("h4", {
  //   fontSize: "1.00em"
  // }),

  // cssRule("h5", {
  //   fontSize: "0.83em"
  // }),

  // cssRule("h6", {
  //   fontSize: "0.67em"
  // }),

  // /**
  //  * @see https://html.spec.whatwg.org/#section-lists
  //  */

  // cssRule("dir, dd, dl, dt, ol, ul", {
  //   display: "block"
  // }),

  // cssRule("li", {
  //   display: "list-item"
  // }),

  // /**
  //  * @see https://html.spec.whatwg.org/#tables
  //  */

  // cssRule("table", {
  //   display: "table"
  // }),

  // cssRule("caption", {
  //   display: "table-caption"
  // }),

  // cssRule("colgroup, colgroup[hidden]", {
  //   display: "table-column-group"
  // }),

  // cssRule("col, col[hidden]", {
  //   display: "table-column"
  // }),

  // cssRule("thead, thead[hidden]", {
  //   display: "table-header-group"
  // }),

  // cssRule("tbody, tbody[hidden]", {
  //   display: "table-row-group"
  // }),

  // cssRule("tfoot, tfoot[hidden]", {
  //   display: "table-footer-group"
  // }),

  // cssRule("tr, tr[hidden]", {
  //   display: "table-row"
  // }),

  // cssRule("td, th, td[hidden], th[hidden]", {
  //   display: "table-cell"
  // }),

  // cssRule(
  //   "colgroup[hidden], col[hidden], thead[hidden], tbody[hidden], tfoot[hidden], tr[hidden], td[hidden], th[hidden]",
  //   {
  //     visibility: "collapse"
  //   }
  // ),

  // cssRule(":matches(table, thead, tbody, tfoot, tr) > form", {
  //   display: "none !important"
  // }),

  // /**
  //  * @see https://html.spec.whatwg.org/#the-hr-element-rendering
  //  */

  // cssRule("hr", {
  //   color: "gray"
  // }),

  // /**
  //  * @see https://html.spec.whatwg.org/#the-fieldset-and-legend-elements
  //  */

  // cssRule("fieldset", {
  //   display: "block"
  // })
]);
