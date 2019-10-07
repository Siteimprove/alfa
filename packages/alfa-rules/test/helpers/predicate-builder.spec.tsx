import { Roles } from "@siteimprove/alfa-aria";
import { withBrowsers } from "@siteimprove/alfa-compatibility";
import { getDefaultDevice } from "@siteimprove/alfa-device";
import { getAttributeNode, InputType, Namespace } from "@siteimprove/alfa-dom";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";
import {
  checker,
  inputTypeIs,
  multicheck,
  nameIs,
  namespaceIs,
  roleIs
} from "../../src/helpers/predicate-builder";
import { documentFromNodes } from "./document-from-nodes";

const spanLink = <span role="link" />;
const span = <span id="foo" />;
const div = <div id="bar" />;
const link = <a href="www.siteimprove.com">Siteimprove</a>;
const img = <img type="hidden" />;
const svg = <svg />;
const inputHidden = <input type="hidden" />;
const inputSearch = <input type="search" />;
const button = <button />;
const Button = <div role="Button" />;
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
  Button
]);

const device = getDefaultDevice();

test("Correctly detects element nodes", t => {
  const foo = getAttributeNode(span, "id")!;
  t(checker()(span));
  t(!checker()(document));
  t(!checker()(foo));
});

test("Correctly checks single or multiple name", t => {
  const isDiv = checker(isElement => isElement.and(nameIs("div")));
  const isDivOrSpan = checker(isElement =>
    isElement.and(nameIs("div", "span"))
  );

  t(isDiv(div));
  t(!isDiv(spanLink));
  t(!isDiv(svg));
  t(isDivOrSpan(div));
  t(isDivOrSpan(spanLink));
  t(!isDivOrSpan(svg));
});

test("Correctly checks single or multiple input type", t => {
  const isHidden = checker(isElement =>
    isElement.and(inputTypeIs(InputType.Hidden))
  );
  const isHiddenOrSearch = checker(isElement =>
    isElement.and(inputTypeIs(InputType.Hidden, InputType.Search))
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
  const isHTML = checker(isElement =>
    isElement.and(namespaceIs(document, Namespace.HTML))
  );
  const isHTMLOrSVG = checker(isElement =>
    isElement.and(namespaceIs(document, Namespace.HTML, Namespace.SVG))
  );

  t(isHTML(div));
  t(isHTML(spanLink));
  t(!isHTML(svg));
  t(isHTMLOrSVG(div));
  t(isHTMLOrSVG(spanLink));
  t(isHTMLOrSVG(svg));
});

test("Correctly checks single or multiple implicit and explicit roles", t => {
  const isLink = checker(isElement =>
    isElement.browserSpecific().and(roleIs(device, document, Roles.Link))
  );
  const isLinkOrImage = checker(IsElement =>
    IsElement.browserSpecific().and(
      roleIs(device, document, Roles.Link, Roles.Img)
    )
  );

  t(isLink(link));
  t(isLink(spanLink));
  t(!isLink(img));
  t(isLinkOrImage(link));
  t(isLinkOrImage(img));
  t(!isLinkOrImage(svg));
});

test("Correctly handles browser specific values", t => {
  const isButton = checker(isElement =>
    isElement.browserSpecific().and(roleIs(device, document, Roles.Button))
  );

  withBrowsers([["firefox", "<=", "60"]], () => {
    t(!isButton(Button));
  });

  withBrowsers([["chrome", ">=", "60"]], () => {
    t(isButton(Button));
  });
});

test("Correctly checks several conditions", t => {
  const isHTMLDiv = checker(isElement =>
    isElement.and(nameIs("div")).and(namespaceIs(document, Namespace.HTML))
  );
  const isSpanLink = checker(isElement =>
    isElement
      .and(nameIs("span"))
      .browserSpecific()
      .and(roleIs(device, document, Roles.Link))
  );
  const isHTMLLink = multicheck({
    namespace: { context: document, namespaces: [Namespace.HTML] },
    role: { device: device, context: document, roles: [Roles.Link] }
  });
  const isDivOrLink = checker(isElement =>
    isElement
      .browserSpecific()
      .and(roleIs(device, document, Roles.Link))
      .or(checker(isElement => isElement.and(nameIs("div"))))
  );

  t(isHTMLDiv(div));
  t(!isHTMLDiv(spanLink));
  t(isSpanLink(spanLink));
  t(!isSpanLink(link));
  t(!isSpanLink(span));
  t(isHTMLLink(link));
  t(!isHTMLLink(div));
  t(isDivOrLink(link));
  t(isDivOrLink(spanLink));
  t(isDivOrLink(div));
  t(!isDivOrLink(button));
});
