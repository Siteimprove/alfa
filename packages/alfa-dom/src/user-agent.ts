import { parseStyleSheet } from "./parse-style-sheet";

/**
 * @see https://www.w3.org/TR/html5/rendering.html
 */
export const UserAgent = parseStyleSheet(`
  @namespace url(http://www.w3.org/1999/xhtml);

  /**
   * @see https://www.w3.org/TR/html5/rendering.html#hidden-elements
   */

  [hidden], area, base, basefont, datalist, head, link, meta, noembed, noframes, param, rp, script, source, style, template, track, title {
    display: none;
  }

  embed[hidden] {
    display: inline;
  }

  input[type=hidden i] {
    display: none !important;
  }

  /**
   * @see https://www.w3.org/TR/html5/rendering.html#the-page
   */

  html, body {
    display: block;
  }

  /**
   * @see https://www.w3.org/TR/html5/rendering.html#non-replaced-elements-flow-content
   */

  address, blockquote, center, div, figure, figcaption, footer, form, header, hr, legend, listing, main, p, plaintext, pre, xmp {
    display: block;
  }

  dialog:not([open]) {
    display: none;
  }

  dialog {
    color: black;
  }

  slot {
    display: contents;
  }

  /**
   * @see https://www.w3.org/TR/html5/rendering.html#non-replaced-elements-phrasing-content
   */

  big {
    font-size: larger;
  }

  small {
    font-size: smaller;
  }

  ruby {
    display: ruby;
  }

  rt {
    display: ruby-text;
  }

  :link {
    color: #0000ee;
  }

  :visited {
    color: #551a8b;
  }

  :link:active, :visited:active {
    color: #ff0000;
  }

  mark {
    color: black;
  }

  /**
   * @see https://www.w3.org/TR/html5/rendering.html#sections-and-headings
   */

  article, aside, h1, h2, h3, h4, h5, h6, hgroup, nav, section {
    display: block;
  }

  h1 {
    font-size: 2.00em;
    font-weight: bold;
  }

  h2 {
    font-size: 1.50em;
    font-weight: bold;
  }

  h3 {
    font-size: 1.17em;
    font-weight: bold;
  }

  h4 {
    font-size: 1.00em;
    font-weight: bold;
  }

  h5 {
    font-size: 0.83em;
    font-weight: bold;
  }

  h6 {
    font-size: 0.67em;
    font-weight: bold;
  }

  /**
   * @see https://www.w3.org/TR/html5/rendering.html#section-lists
   */

  dir, dd, dl, dt, ol, ul {
    display: block;
  }

  li {
    display: list-item;
  }

  /**
   * @see https://www.w3.org/TR/html5/rendering.html#tables
   */

  table {
    display: table;
  }

  caption {
    display: table-caption;
  }

  colgroup, colgroup[hidden] {
    display: table-column-group;
  }

  col, col[hidden] {
    display: table-column;
  }

  thead, thead[hidden] {
    display: table-header-group;
  }

  tbody, tbody[hidden] {
    display: table-row-group;
  }

  tfoot, tfoot[hidden] {
    display: table-footer-group;
  }

  tr, tr[hidden] {
    display: table-row;
  }

  td, th, td[hidden], th[hidden] {
    display: table-cell;
  }

  colgroup[hidden], col[hidden], thead[hidden], tbody[hidden], tfoot[hidden], tr[hidden], td[hidden], th[hidden] {
    visibility: collapse;
  }

  th {
    font-weight: bold;
  }

  :matches(table, thead, tbody, tfoot, tr) > form {
    display: none !important;
  }

  /**
   * @see https://www.w3.org/TR/html5/rendering.html#the-hr-element-rendering
   */

  hr {
    color: gray;
  }

  /**
   * @see https://www.w3.org/TR/html5/rendering.html#the-fieldset-and-legend-elements
   */

  fieldset {
    display: block;
  }
`);
