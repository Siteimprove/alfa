import { test } from "@siteimprove/alfa-test";

import { None } from "@siteimprove/alfa-option";
import { jsx } from "../jsx";
import { getAttribute } from "../src/get-attribute";
import { Namespace, NodeType } from "../src/types";

test("Gets the value of an attribute", t => {
  const div = <div aria-labelledby="foo">Foo</div>;

  t.deepEqual(getAttribute(div, div, "aria-labelledby").toJSON(), {
    value: "foo"
  });
});

test("Returns none when an attribute does not exist", t => {
  const div = <div>Foo</div>;

  t.equal(getAttribute(div, div, "aria-labelledby"), None);
});

test("Returns none when getting an attribute in the HTML namespace", t => {
  const div = <div aria-labelledby="foobar" />;

  // In HTML5 attributes are not assigned to namespaces, not even the HTML
  // namespace.
  t.equal(getAttribute(div, div, "aria-labelledby", Namespace.HTML), None);
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

  t.deepEqual(getAttribute(a, svg, "xlink:href").toJSON(), {
    value: "foo"
  });

  t.deepEqual(getAttribute(a, svg, "href", Namespace.XLink).toJSON(), {
    value: "foo"
  });
});

test("Gets an attribute matching any namespace", t => {
  const div = <div aria-labelledby="foobar" />;

  t.deepEqual(
    getAttribute(div, div, "aria-labelledby", "*")
      .map(attributes => [...attributes])
      .toJSON(),
    {
      value: ["foobar"]
    }
  );
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

  t.deepEqual(
    getAttribute(a, svg, "href", "*")
      .map(attributes => [...attributes])
      .toJSON(),
    {
      value: ["foo", "bar"]
    }
  );

  t.equal(getAttribute(a, svg, "title", "*"), None);
  t.equal(getAttribute(a, svg, "*:href"), None);
});

test("Gets an attribute with an incorrect namespace", t => {
  const div = <div aria-labelledby="foobar" />;

  t.equal(getAttribute(div, div, "svg:aria-labelledby"), None);
  t.equal(getAttribute(div, div, "aria-labelledby", Namespace.SVG), None);
  t.equal(getAttribute(div, div, "aria-hidden", Namespace.SVG), None);
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

  t.deepEqual(getAttribute(html, html, "xml:lang").toJSON(), { value: "en" });
});
