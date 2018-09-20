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

  t.equal(getAttribute(div, "aria-labelledby", Namespace.HTML), "foobar");
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
        value: "foobar"
      }
    ],
    shadowRoot: null,
    childNodes: []
  };

  t.equal(getAttribute(svg, "xlink:href"), "foobar");
  t.equal(getAttribute(svg, "href", Namespace.XLink), "foobar");
});

test("Gets an attribute matching any namespace", t => {
  t.equal(
    getAttribute(<div aria-labelledby="foobar" />, "aria-labelledby", "*"),
    "foobar"
  );
});

test("Gets an attribute with an incorrect namespace", t => {
  const div = <div aria-labelledby="foobar" />;

  t.equal(getAttribute(div, "svg:aria-labelledby"), null);
  t.equal(getAttribute(div, "aria-labelledby", Namespace.SVG), null);
  t.equal(getAttribute(div, "aria-hidden", Namespace.SVG), null);
});
