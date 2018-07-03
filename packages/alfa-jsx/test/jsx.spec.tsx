import { test } from "@siteimprove/alfa-test";
import { find } from "@siteimprove/alfa-util";
import { jsx } from "../src/jsx";

test("Transforms JSX into DOM nodes", t => {
  const text: JSX.Text = {
    nodeType: 3,
    data: "Hello world",
    childNodes: []
  };

  t.deepEqual(<div class="foo">Hello world</div>, {
    nodeType: 1,
    prefix: null,
    localName: "div",
    attributes: [
      {
        prefix: null,
        localName: "class",
        value: "foo"
      }
    ],
    shadowRoot: null,
    childNodes: [text]
  });
});

test("Handles boolean attributes when truthy", t => {
  const element = <div hidden />;

  const hidden = find(
    element.attributes,
    attribute => attribute.localName === "hidden"
  );

  t.deepEqual(hidden, {
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

  t.equal(hidden, null);
});

test("Converts numbers in attributes to strings", t => {
  const element = <div number={20} />;

  const number = find(
    element.attributes,
    attribute => attribute.localName === "number"
  );

  t.deepEqual(number, {
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

  t.equal(foo, null);
});

test("Handles attributes with undefined values", t => {
  const element = <div foo={undefined} />;

  const foo = find(
    element.attributes,
    attribute => attribute.localName === "foo"
  );

  t.equal(foo, null);
});

test("Handles attributes with NaN values", t => {
  const element = <div foo={NaN} />;

  const foo = find(
    element.attributes,
    attribute => attribute.localName === "foo"
  );

  t.deepEqual(foo, {
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
    prefix: null,
    localName: "foo",
    value: "[object Object]"
  });
});

test("Constructs and attaches shadow roots from <shadow> elements", t => {
  const element = (
    <div>
      <shadow>I'm in the shadows!</shadow>
    </div>
  );

  const text: JSX.Text = {
    nodeType: 3,
    data: "I'm in the shadows!",
    childNodes: []
  };

  t.deepEqual(element, {
    nodeType: 1,
    prefix: null,
    localName: "div",
    attributes: [],
    shadowRoot: {
      nodeType: 11,
      mode: "open",
      childNodes: [text]
    },
    childNodes: []
  });
});
