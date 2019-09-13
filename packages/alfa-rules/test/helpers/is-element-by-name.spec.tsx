import { Namespace } from "@siteimprove/alfa-dom";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";
import { isElementByName } from "../../src/helpers/is-element-by-name";
import { documentFromNodes } from "../helpers/document-from-nodes";

test("Returns true if element has matching name and namespace", t => {
  const span = <span id="foo" />;
  const div = <div id="bar" />;
  const svg = <svg></svg>;
  const document = documentFromNodes([span, div, svg]);
  t(
    isElementByName(
      div,
      document,
      ["div", "span", "svg"],
      [Namespace.HTML, Namespace.SVG]
    )
  );
  t(
    isElementByName(
      span,
      document,
      ["div", "span", "svg"],
      [Namespace.HTML, Namespace.SVG]
    )
  );
  t(
    isElementByName(
      svg,
      document,
      ["div", "span", "svg"],
      [Namespace.HTML, Namespace.SVG]
    )
  );
});

test("Returns false if element does not have matching name or namespace", t => {
  const div = <div id="bar" />;
  const document = documentFromNodes([div]);
  t(
    !isElementByName(
      div,
      document,
      ["p", "title", "circle"],
      [Namespace.HTML, Namespace.SVG]
    )
  );
  t(
    !isElementByName(
      div,
      document,
      ["div", "span", "svg"],
      [Namespace.MathML, Namespace.XML]
    )
  );
});

test("Accept non array arguments", t => {
  const span = <span id="foo" />;
  const div = <div id="bar" />;
  const svg = <svg></svg>;
  const document = documentFromNodes([span, div, svg]);
  t(isElementByName(div, document, "div", Namespace.HTML));
  t(isElementByName(svg, document, "svg", Namespace.SVG));
  t(!isElementByName(div, document, "p", Namespace.HTML));
  t(!isElementByName(div, document, "div", Namespace.MathML));
});

test("Uses HTML as default namespace", t => {
  const div = <div id="bar" />;
  const svg = <svg></svg>;
  const document = documentFromNodes([div, svg]);
  t(isElementByName(div, document, "div"));
  t(!isElementByName(svg, document, ["div", "span", "svg"]));
});
