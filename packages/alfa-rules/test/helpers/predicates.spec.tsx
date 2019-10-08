import { Roles } from "@siteimprove/alfa-aria";
import { withBrowsers } from "@siteimprove/alfa-compatibility";
import { getDefaultDevice } from "@siteimprove/alfa-device";
import { getAttributeNode, InputType, Namespace } from "@siteimprove/alfa-dom";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";
import {
  inputTypeIs,
  isElement,
  nameIs,
  namespaceIs,
  roleIs
} from "../../src/helpers/predicates";
import { documentFromNodes } from "./document-from-nodes";

const spanLink = <span role="link" />;
const span = <span id="foo" />;
const div = <div id="bar" />;
const link = <a href="https://example.com">Example</a>;
const img = <img type="hidden" />;
const svg = <svg />;
const inputHidden = <input type="hidden" />;
const inputSearch = <input type="search" />;
const button = <button />;
const semanticButton = <div role="Button" />;

const document = documentFromNodes([
  spanLink,
  div,
  link,
  img,
  svg,
  span,
  inputHidden,
  inputSearch,
  button,
  semanticButton
]);

const device = getDefaultDevice();

test("Correctly detects element nodes", t => {
  const foo = getAttributeNode(span, "id")!;

  t(isElement.test(span));
  t(!isElement.test(document));
  t(!isElement.test(foo));
});

test("Correctly checks single or multiple name", t => {
  const isDiv = isElement.and(nameIs("div"));

  const isDivOrSpan = isElement.and(nameIs("div", "span"));

  t(isDiv.test(div));
  t(!isDiv.test(spanLink));
  t(!isDiv.test(svg));
  t(isDivOrSpan.test(div));
  t(isDivOrSpan.test(spanLink));
  t(!isDivOrSpan.test(svg));
});

test("Correctly checks single or multiple input type", t => {
  const isHidden = isElement.and(inputTypeIs(InputType.Hidden));

  const isHiddenOrSearch = isElement.and(
    inputTypeIs(InputType.Hidden, InputType.Search)
  );

  t(isHidden.test(inputHidden));
  t(!isHidden.test(inputSearch));
  t(!isHidden.test(img));
  t(!isHidden.test(div));
  t(isHiddenOrSearch.test(inputHidden));
  t(isHiddenOrSearch.test(inputSearch));
  t(!isHiddenOrSearch.test(img));
  t(!isHiddenOrSearch.test(div));
});

test("Correctly checks single or multiple namespace", t => {
  const isHTML = isElement.and(namespaceIs(document, Namespace.HTML));

  const isHTMLOrSVG = isElement.and(
    namespaceIs(document, Namespace.HTML, Namespace.SVG)
  );

  t(isHTML.test(div));
  t(isHTML.test(spanLink));
  t(!isHTML.test(svg));
  t(isHTMLOrSVG.test(div));
  t(isHTMLOrSVG.test(spanLink));
  t(isHTMLOrSVG.test(svg));
});

test("Correctly checks single or multiple implicit and explicit roles", t => {
  const isLink = isElement.and(roleIs(document, device, Roles.Link));

  const isLinkOrImage = isElement.and(
    roleIs(document, device, Roles.Link, Roles.Img)
  );

  t(isLink.test(link));
  t(isLink.test(spanLink));
  t(!isLink.test(img));
  t(isLinkOrImage.test(link));
  t(isLinkOrImage.test(img));
  t(!isLinkOrImage.test(svg));
});

test("Correctly handles browser specific values", t => {
  const isButton = isElement.and(roleIs(document, device, Roles.Button));

  withBrowsers([["firefox", "<=", "60"]], () => {
    t(!isButton.test(semanticButton));
  });

  withBrowsers([["chrome", ">=", "60"]], () => {
    t(isButton.test(semanticButton));
  });
});

test("Correctly checks several conditions", t => {
  const isHTMLDiv = isElement
    .and(nameIs("div"))
    .and(namespaceIs(document, Namespace.HTML));

  const isSpanLink = isElement
    .and(nameIs("span"))
    .and(roleIs(document, device, Roles.Link));

  const isDivOrLink = isElement.and(
    roleIs(document, device, Roles.Link).or(nameIs("div"))
  );

  t(isHTMLDiv.test(div));
  t(!isHTMLDiv.test(spanLink));
  t(isSpanLink.test(spanLink));
  t(!isSpanLink.test(link));
  t(!isSpanLink.test(span));
  t(isDivOrLink.test(link));
  t(isDivOrLink.test(spanLink));
  t(isDivOrLink.test(div));
  t(!isDivOrLink.test(button));
});
