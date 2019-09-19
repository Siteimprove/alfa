import { Roles } from "@siteimprove/alfa-aria";
import { getDefaultDevice } from "@siteimprove/alfa-device";
import { getAttributeNode, InputType, Namespace } from "@siteimprove/alfa-dom";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";
import { ElementChecker } from "../../src/helpers/element-checker";
import { isElement } from "../../src/helpers/predicate-builder";
import { documentFromNodes } from "./document-from-nodes";

const spanLink = <span role="link" />;
const span = <span id="foo" />;
const div = <div id="bar" />;
const link = <a href="www.siteimprove.com">Siteimprove</a>;
const img = <img type="hidden" />;
const svg = <svg />;
const inputHidden = <input type="hidden" />;
const inputSearch = <input type="search" />;
const document = documentFromNodes([
  spanLink,
  div,
  link,
  img,
  svg,
  span,
  inputHidden,
  inputSearch
]);

const device = getDefaultDevice();

test("Correctly detects element nodes", t => {
  const foo = getAttributeNode(span, "id")!;
  t(isElement()(span));
  t(!isElement()(document));
  t(!isElement()(foo));
});

test("Correctly checks single or multiple name", t => {
  const isDiv = isElement(builder => builder.withName("div"));
  const isDivOrSpan = isElement(builder => builder.withName("div", "span"));

  t(isDiv(div));
  t(!isDiv(spanLink));
  t(!isDiv(svg));
  t(isDivOrSpan(div));
  t(isDivOrSpan(spanLink));
  t(!isDivOrSpan(svg));
});

test("Correctly checks single or multiple input type", t => {
  const isHidden = isElement(builder =>
    builder.withInputType(InputType.Hidden)
  );
  const isHiddenOrSearch = isElement(builder =>
    builder.withInputType(InputType.Hidden, InputType.Search)
  );

  t(isHidden(inputHidden));
  t(!isHidden(inputSearch));
  t(!isHidden(img));
  t(!isHidden(div));
  t(isHiddenOrSearch(inputHidden));
  t(isHiddenOrSearch(inputSearch));
  t(!isHiddenOrSearch(img));
  t(!isHiddenOrSearch(div));
});

test("Correctly checks single or multiple namespace", t => {
  const isHTML = isElement(builder =>
    builder.withNamespace(document, Namespace.HTML)
  );
  const isHTMLOrSVG = isElement(builder =>
    builder.withNamespace(document, Namespace.HTML, Namespace.SVG)
  );

  t(isHTML(div));
  t(isHTML(spanLink));
  t(!isHTML(svg));
  t(isHTMLOrSVG(div));
  t(isHTMLOrSVG(spanLink));
  t(isHTMLOrSVG(svg));
});

test("Correctly checks single or multiple implicit and explicit roles", t => {
  const isLink = new ElementChecker()
    .withContext(document)
    .withRole(device, Roles.Link)
    .build();
  const isLinkOrImage = new ElementChecker()
    .withContext(document)
    .withRole(device, Roles.Link, Roles.Img)
    .build();

  t(isLink(link));
  t(isLink(spanLink));
  t(!isLink(img));
  t(isLinkOrImage(link));
  t(isLinkOrImage(img));
  t(!isLinkOrImage(svg));
});

test("Correctly checks several conditions", t => {
  const isHTMLDiv = isElement(builder =>
    builder.withName("div").withNamespace(document, Namespace.HTML)
  );
  const isSpanLink = new ElementChecker()
    .withName("span")
    .withContext(document)
    .withRole(device, Roles.Link)
    .build();
  const isHTMLLink = new ElementChecker()
    .withContext(document)
    .withNamespace(Namespace.HTML)
    .withRole(device, Roles.Link)
    .build();

  t(isHTMLDiv(div));
  t(!isHTMLDiv(spanLink));
  t(isSpanLink(spanLink));
  t(!isSpanLink(link));
  t(!isSpanLink(span));
  t(isHTMLLink(link));
  t(!isHTMLLink(div));
});
