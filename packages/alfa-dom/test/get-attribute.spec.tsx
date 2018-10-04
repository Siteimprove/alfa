import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { getAttribute } from "../src/get-attribute";
import { Namespace } from "../src/types";

test("Gets an attribute value when it is defined", t => {
  t.equal(
    getAttribute(<div aria-labelledby="foobar">Bar</div>, "aria-labelledby"),
    "foobar"
  );
});

test("Gets an attribute value when it is not defined", t => {
  t.equal(getAttribute(<div>Foo</div>, "aria-labelledby"), null);
});

test("Gets an attribute value when it is defined and trim=true", t => {
  t.equal(
    getAttribute(<div aria-labelledby="  foobar">Foo</div>, "aria-labelledby", {
      trim: true
    }),
    "foobar"
  );
});

test("Gets an attribute value when it is defined and lowercase=true", t => {
  t.equal(
    getAttribute(<div aria-labelledby="fooBar">Foo</div>, "aria-labelledby", {
      lowerCase: true
    }),
    "foobar"
  );
});

test("Gets an attribute with a HTML namespace", t => {
  const div = <div aria-labelledby="foobar" />;

  // In HTML5 attributes are not assigned to namespaces, not even the HTML
  // namespace.
  t.equal(getAttribute(div, "aria-labelledby", Namespace.HTML), null);
});

test("Gets an attribute with an SVG namespace", t => {
  const svg: jsx.JSX.Element = {
    nodeType: 1,
    prefix: null,
    localName: "svg",
    attributes: [
      {
        prefix: "xlink",
        localName: "href",
        value: "foo"
      }
    ],
    shadowRoot: null,
    childNodes: []
  };

  t.equal(getAttribute(svg, "xlink:href"), "foo");
  t.equal(getAttribute(svg, "href", Namespace.XLink), "foo");
});

test("Gets an attribute matching any namespace", t => {
  const div = <div aria-labelledby="foobar" />;
  t.deepEqual(getAttribute(div, "aria-labelledby", "*"), ["foobar"]);
});

test("Gets multiple attributes with different namespaces", t => {
  const svg: jsx.JSX.Element = {
    nodeType: 1,
    prefix: null,
    localName: "svg",
    attributes: [
      {
        prefix: "xlink",
        localName: "href",
        value: "foo"
      },
      {
        prefix: null,
        localName: "href",
        value: "bar"
      }
    ],
    shadowRoot: null,
    childNodes: []
  };

  t.deepEqual(getAttribute(svg, "href", "*"), ["foo", "bar"]);
  t.equal(getAttribute(svg, "title", "*"), null);
  t.equal(getAttribute(svg, "*:href"), null);
});

test("Gets an attribute with an incorrect namespace", t => {
  const div = <div aria-labelledby="foobar" />;

  t.equal(getAttribute(div, "svg:aria-labelledby"), null);
  t.equal(getAttribute(div, "aria-labelledby", Namespace.SVG), null);
  t.equal(getAttribute(div, "aria-hidden", Namespace.SVG), null);
});
