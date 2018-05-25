import { test } from "@siteimprove/alfa-test";
import { find } from "@siteimprove/alfa-util";
import { jsx } from "../src/jsx";

test("Transforms JSX into DOM nodes", t => {
  t.deepEqual(<div class="foo">Hello world</div>, {
    nodeType: 1,
    childNodes: [
      {
        nodeType: 3,
        childNodes: [],
        data: "Hello world"
      }
    ],
    namespaceURI: "http://www.w3.org/1999/xhtml",
    prefix: null,
    localName: "div",
    attributes: [
      {
        namespaceURI: null,
        prefix: null,
        localName: "class",
        value: "foo"
      }
    ],
    shadowRoot: null
  });
});

test("Handles boolean attributes when truthy", t => {
  const element = <div hidden />;

  const hidden = find(
    element.attributes,
    attribute => attribute.localName === "hidden"
  );

  t.deepEqual(hidden, {
    namespaceURI: null,
    prefix: null,
    localName: "hidden",
    value: "hidden"
  });
});

test("Handles boolean attributes when falsey", t => {
  const element = <div hidden={false} />;

  const hidden = find(
    element.attributes,
    attribute => attribute.localName === "hidden"
  );

  t.is(hidden, undefined);
});

test("Converts numbers in attributes to strings", t => {
  const element = <div number={20} />;

  const number = find(
    element.attributes,
    attribute => attribute.localName === "number"
  );

  t.deepEqual(number, {
    namespaceURI: null,
    prefix: null,
    localName: "number",
    value: "20"
  });
});

test("Handles attributes with null values", t => {
  const element = <div foo={null} />;

  const foo = find(
    element.attributes,
    attribute => attribute.localName === "foo"
  );

  t.is(foo, undefined);
});

test("Handles attributes with undefined values", t => {
  const element = <div foo={undefined} />;

  const foo = find(
    element.attributes,
    attribute => attribute.localName === "foo"
  );

  t.is(foo, undefined);
});

test("Handles attributes with NaN values", t => {
  const element = <div foo={NaN} />;

  const foo = find(
    element.attributes,
    attribute => attribute.localName === "foo"
  );

  t.deepEqual(foo, {
    namespaceURI: null,
    prefix: null,
    localName: "foo",
    value: "NaN"
  });
});

test("Handles attributes with array values", t => {
  const element = <div foo={[1, 2, 3]} />;

  const foo = find(
    element.attributes,
    attribute => attribute.localName === "foo"
  );

  t.deepEqual(foo, {
    namespaceURI: null,
    prefix: null,
    localName: "foo",
    value: "1,2,3"
  });
});

test("Handles attributes with object values", t => {
  const element = <div foo={{ foo: "foo" }} />;

  const foo = find(
    element.attributes,
    attribute => attribute.localName === "foo"
  );

  t.deepEqual(foo, {
    namespaceURI: null,
    prefix: null,
    localName: "foo",
    value: "[object Object]"
  });
});

test("Handles foreign objects in the SVG namespace", t => {
  t.deepEqual(
    <svg>
      <g>
        <path />
      </g>
    </svg>,
    {
      nodeType: 1,
      childNodes: [
        {
          nodeType: 1,
          childNodes: [
            {
              nodeType: 1,
              childNodes: [],
              namespaceURI: "http://www.w3.org/2000/svg",
              prefix: null,
              localName: "path",
              attributes: [],
              shadowRoot: null
            }
          ],
          namespaceURI: "http://www.w3.org/2000/svg",
          prefix: null,
          localName: "g",
          attributes: [],
          shadowRoot: null
        }
      ],
      namespaceURI: "http://www.w3.org/2000/svg",
      prefix: null,
      localName: "svg",
      attributes: [],
      shadowRoot: null
    }
  );
});

test("Handles foreign objects in the MathML namespace", t => {
  t.deepEqual(
    <math>
      <apply>
        <times />
      </apply>
    </math>,
    {
      nodeType: 1,
      childNodes: [
        {
          nodeType: 1,
          childNodes: [
            {
              nodeType: 1,
              childNodes: [],
              namespaceURI: "http://www.w3.org/1998/Math/MathML",
              prefix: null,
              localName: "times",
              attributes: [],
              shadowRoot: null
            }
          ],
          namespaceURI: "http://www.w3.org/1998/Math/MathML",
          prefix: null,
          localName: "apply",
          attributes: [],
          shadowRoot: null
        }
      ],
      namespaceURI: "http://www.w3.org/1998/Math/MathML",
      prefix: null,
      localName: "math",
      attributes: [],
      shadowRoot: null
    }
  );
});
