import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { getAttribute } from "../src/get-attribute";
import { Namespace } from "../src/types";

test("Gets an attribute value when it is defined", t => {
  t.equal(
    getAttribute(<div aria-labelledby="foobar">Foo</div>, "aria-labelledby"),
    "foobar"
  );
});

test("Gets an attribute value when it is not defined", t => {
  t.equal(getAttribute(<div>Foo</div>, "aria-labelledby"), null);
});

test("Gets an attribute balue when it is defined and trim=true", t => {
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
  t.equal(
    getAttribute(
      <div aria-labelledby="foobar" />,
      "aria-labelledby",
      Namespace.HTML
    ),
    "foobar"
  );
  t.equal(
    getAttribute(<div aria-labelledby="foobar" />, "svg:aria-labelledby"),
    null
  );
});

test("Gets an attribute with an SVG namespace", t => {
  const svg: jsx.JSX.Element = {
    nodeType: 1,
    prefix: "svg",
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
  t.equal(
    getAttribute(
      <div aria-labelledby="foobar" />,
      "aria-labelledby",
      Namespace.SVG
    ),
    null
  );
});

test("Gets an attribute with no specific namespace", t => {
  t.equal(
    getAttribute(<div aria-labelledby="foobar" />, "aria-labelledby", "*"),
    "foobar"
  );
});
