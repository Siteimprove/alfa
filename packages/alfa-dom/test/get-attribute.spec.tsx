import { test } from "@siteimprove/alfa-test";
import { jsx } from "../jsx";
import { getAttribute } from "../src/get-attribute";
import { Namespace, NodeType } from "../src/types";

test("Gets the value of an attribute", t => {
  t.equal(
    getAttribute(<div aria-labelledby="foobar">Bar</div>, "aria-labelledby"),
    "foobar"
  );
});

test("Returns null when an attribute does not exist", t => {
  t.equal(getAttribute(<div>Foo</div>, "aria-labelledby"), null);
});

test("Can trim the attribute value", t => {
  t.equal(
    getAttribute(<div aria-labelledby="  foobar">Foo</div>, "aria-labelledby", {
      trim: true
    }),
    "foobar"
  );
});

test("Can lowercase the attribute value", t => {
  t.equal(
    getAttribute(<div aria-labelledby="fooBar">Foo</div>, "aria-labelledby", {
      lowerCase: true
    }),
    "foobar"
  );
});

test("Returns null when getting an attribute in the HTML namespace", t => {
  const div = <div aria-labelledby="foobar" />;

  // In HTML5 attributes are not assigned to namespaces, not even the HTML
  // namespace.
  t.equal(getAttribute(div, div, "aria-labelledby", Namespace.HTML), null);
});

test("Gets the value of an attribute in the SVG namespace", t => {
  const a: jsx.JSX.Element = {
    nodeType: NodeType.Element,
    prefix: null,
    localName: "a",
    attributes: [
      {
        nodeType: NodeType.Attribute,
        prefix: "xlink",
        localName: "href",
        value: "foo",
        childNodes: []
      }
    ],
    shadowRoot: null,
    childNodes: []
  };

  const svg: jsx.JSX.Element = {
    nodeType: NodeType.Element,
    prefix: null,
    localName: "svg",
    attributes: [],
    shadowRoot: null,
    childNodes: [a]
  };

  t.equal(getAttribute(a, "xlink:href"), "foo");
  t.equal(getAttribute(a, svg, "href", Namespace.XLink), "foo");
});

test("Gets an attribute matching any namespace", t => {
  const div = <div aria-labelledby="foobar" />;
  t.deepEqual(getAttribute(div, div, "aria-labelledby", "*"), ["foobar"]);
});

test("Gets multiple attributes with different namespaces", t => {
  const a: jsx.JSX.Element = {
    nodeType: NodeType.Element,
    prefix: null,
    localName: "a",
    attributes: [
      {
        nodeType: NodeType.Attribute,
        prefix: "xlink",
        localName: "href",
        value: "foo",
        childNodes: []
      },
      {
        nodeType: NodeType.Attribute,
        prefix: null,
        localName: "href",
        value: "bar",
        childNodes: []
      }
    ],
    shadowRoot: null,
    childNodes: []
  };

  const svg: jsx.JSX.Element = {
    nodeType: NodeType.Element,
    prefix: null,
    localName: "svg",
    attributes: [],
    shadowRoot: null,
    childNodes: [a]
  };

  t.deepEqual(getAttribute(a, svg, "href", "*"), ["foo", "bar"]);
  t.equal(getAttribute(a, svg, "title", "*"), null);
  t.equal(getAttribute(a, "*:href"), null);
});

test("Gets an attribute with an incorrect namespace", t => {
  const div = <div aria-labelledby="foobar" />;

  t.equal(getAttribute(div, "svg:aria-labelledby"), null);
  t.equal(getAttribute(div, div, "aria-labelledby", Namespace.SVG), null);
  t.equal(getAttribute(div, div, "aria-hidden", Namespace.SVG), null);
});

test("Correctly handles attribute names containing colons", t => {
  const html: jsx.JSX.Element = {
    nodeType: NodeType.Element,
    prefix: null,
    localName: "html",
    attributes: [
      {
        nodeType: NodeType.Attribute,
        prefix: null,
        localName: "xml:lang",
        value: "en",
        childNodes: []
      }
    ],
    shadowRoot: null,
    childNodes: []
  };

  t.equal(getAttribute(html, "xml:lang"), "en");
});
