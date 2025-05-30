import { h } from "@siteimprove/alfa-dom";

/**
 * {@link https://html.spec.whatwg.org/#rendering}
 *
 * @internal
 */
export const UserAgent = h.sheet([
  h.rule.namespace("http://www.w3.org/1999/xhtml"),

  /**
   * {@link https://html.spec.whatwg.org/#hidden-elements}
   */

  h.rule.style(
    "[hidden], base, basefont, datalist, head, link, meta, noembed, noframes, param, rp, script, source, style, template, track, title",
    {
      display: "none",
    },
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
   * {@link https://html.spec.whatwg.org/#the-page}
   */

  h.rule.style("html, body", {
    display: "block",
  }),

  /**
   * {@link https://html.spec.whatwg.org/#flow-content-3}
   */

  h.rule.style(
    "address, blockquote, center, div, figure, figcaption, footer, form, header, hr, legend, listing, main, p, plaintext, pre, xmp",
    {
      display: "block",
    },
  ),

  h.rule.style("dialog:not([open])", {
    display: "none",
  }),

  h.rule.style("dialog", {
    background: "white",
    color: "black",
  }),

  h.rule.style("dialog::backdrop", {
    background: "rgb(0 0 0 / 0.1)",
  }),

  h.rule.style("slot", {
    display: "contents",
  }),

  /**
   * {@link https://html.spec.whatwg.org/#phrasing-content-3}
   */

  h.rule.style("cite, dfn, em, i, var", { fontStyle: "italic" }),
  h.rule.style("b, strong", { fontWeight: "bolder" }),
  h.rule.style("code, kbd, samp, tt", { fontFamily: "monospace" }),
  h.rule.style("big", { fontSize: "larger" }),
  h.rule.style("small", { fontSize: "smaller" }),

  h.rule.style("sub", { verticalAlign: "sub" }),
  h.rule.style("sup", { verticalAlign: "super" }),

  h.rule.style("ruby", { display: "ruby" }),
  h.rule.style("rt", { display: "ruby-text" }),

  h.rule.style(":link", { color: "#0000ee" }),
  h.rule.style(":visited", { color: "#551a8b" }),
  h.rule.style(":link:active, :visited:active", { color: "#ff0000" }),
  h.rule.style(":link, :visited", {
    textDecoration: "underline",
    cursor: "pointer",
  }),

  h.rule.style(":focus", { outline: "auto" }),

  h.rule.style("mark", { background: "yellow", color: "black" }),

  h.rule.style("ins, u", { textDecoration: "underline" }),
  h.rule.style("del, s, strike", { textDecoration: "line-through" }),

  /**
   * {@link https://html.spec.whatwg.org/#sections-and-headings}
   */

  h.rule.style("article, aside, h1, h2, h3, h4, h5, h6, hgroup, nav, section", {
    display: "block",
  }),

  h.rule.style("h1", { fontSize: "2.00em", fontWeight: "bold" }),
  h.rule.style("h2", { fontSize: "1.50em", fontWeight: "bold" }),
  h.rule.style("h3", { fontSize: "1.17em", fontWeight: "bold" }),
  h.rule.style("h4", { fontSize: "1.00em", fontWeight: "bold" }),
  h.rule.style("h5", { fontSize: "0.83em", fontWeight: "bold" }),
  h.rule.style("h6", { fontSize: "0.67em", fontWeight: "bold" }),

  /**
   * {@link https://html.spec.whatwg.org/#section-lists}
   */

  h.rule.style("dir, dd, dl, dt, ol, ul", { display: "block" }),
  h.rule.style("li", { display: "list-item" }),

  /**
   * {@link https://html.spec.whatwg.org/#tables}
   */

  h.rule.style("table", { display: "table" }),
  h.rule.style("caption", { display: "table-caption" }),
  h.rule.style("colgroup, colgroup[hidden]", { display: "table-column-group" }),
  h.rule.style("col, col[hidden]", { display: "table-column" }),
  h.rule.style("thead, thead[hidden]", { display: "table-header-group" }),
  h.rule.style("tbody, tbody[hidden]", { display: "table-row-group" }),
  h.rule.style("tfoot, tfoot[hidden]", { display: "table-footer-group" }),
  h.rule.style("tr, tr[hidden]", { display: "table-row" }),
  h.rule.style("td, th, td[hidden], th[hidden]", { display: "table-cell" }),

  h.rule.style(
    "colgroup[hidden], col[hidden], thead[hidden], tbody[hidden], tfoot[hidden], tr[hidden], td[hidden], th[hidden]",
    {
      visibility: "collapse",
    },
  ),

  h.rule.style("th", { fontWeight: "bold" }),

  h.rule.style(":is(table, thead, tbody, tfoot, tr) > form", {
    display: "none !important",
  }),

  /**
   * {@link https://html.spec.whatwg.org/#form-controls}
   */

  h.rule.style("input, select, button, textarea", {
    letterSpacing: "initial",
    wordSpacing: "initial",
    lineHeight: "initial",
    textTransform: "initial",
    textIndent: "initial",
    textShadow: "initial",
  }),

  h.rule.style("input, select, textarea", {
    textAlign: "initial",
  }),

  /**
   * {@link https://html.spec.whatwg.org/multipage/rendering.html#the-select-element-2}
   */
  h.rule.style("select", { display: "inline-block" }),

  h.rule.style(
    "input:is([type=reset i], [type=button i], [type=submit i]), button",
    {
      textAlign: "center",
    },
  ),

  h.rule.style(
    "input:is([type=reset i], [type=button i], [type=submit i], [type=color i]), button",
    {
      display: "inline-block",
    },
  ),

  h.rule.style(
    "input:is([type=radio i], [type=checkbox i], [type=reset i], [type=button i], [type=submit i], [type=color i], [type=search i]), select, button",
    {
      boxSizing: "border-box",
    },
  ),

  h.rule.style("textarea", { whiteSpace: "pre-wrap" }),

  h.rule.style("button", {
    // <button> element defaults applied consistently by browsers.
    fontStyle: "normal",
    fontWeight: "400",
    // <button> colors differ between browsers, additionally they can be
    // overwritten by OS settings which we do not really have access to (although
    // forced-color media query could help), so we default to the system color.
    // as of 21.09.23, Chrome uses rgb(240, 240, 240) but Firefox uses
    // rgb(233, 233, 233).
    backgroundColor: "buttonface",
    // color seems to rather consistently defaults to black, which is the default.
    // color: "buttontext",
  }),

  /**
   * {@link https://html.spec.whatwg.org/#the-hr-element-rendering}
   */

  h.rule.style("hr", {
    color: "gray",
    overflow: "hidden",
  }),

  /**
   * {@link https://html.spec.whatwg.org/#the-fieldset-and-legend-elements}
   */

  h.rule.style("fieldset", {
    display: "block",
  }),

  /**
   * {@link https://html.spec.whatwg.org/multipage/rendering.html#the-details-and-summary-elements}
   */

  h.rule.style("details, summary", { display: "block" }),
  h.rule.style("details > summary:first-of-type", {
    display: "list-item",
    counterIncrement: "list-item 0",
    listStyle: "disclosure-closed inside",
  }),
  h.rule.style("details[open] > summary:first-of-type", {
    listStyleType: "disclosure-open",
  }),

  // This is not totally accurate. Browsers hide <details> content using `content-visibility: hidden`
  // on an internal shadow pseudo-element `::details-content`. We approximate this behavior by
  // directly applying `display: none` to the actual DOM content. This ensures proper visibility
  // detection while acknowledging it's a simplified modeling choice.
  h.rule.style("details:not([open]) > :not(summary:first-of-type)", {
    display: "none",
  }),
]);
