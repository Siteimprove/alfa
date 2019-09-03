import { test } from "@siteimprove/alfa-test";
import { jsx } from "../src/jsx";

test("Transforms JSX into DOM nodes", t => {
  const text = {
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
        nodeType: 2,
        prefix: null,
        localName: "class",
        value: "foo",
        childNodes: []
      }
    ],
    shadowRoot: null,
    childNodes: [text]
  });
});

test("Transforms JSX into DOM nodes with multiple children and tags", t => {
  const hello = {
    nodeType: 3,
    data: "Hello ",
    childNodes: []
  };
  const world = {
    attributes: [],
    nodeType: 1,
    localName: "b",
    shadowRoot: null,
    prefix: null,
    childNodes: [
      {
        nodeType: 3,
        data: "world",
        childNodes: []
      }
    ]
  };
  const mark = {
    nodeType: 3,
    data: "!",
    childNodes: []
  };

  t.deepEqual(
    <div class="foo">
      Hello <b>world</b>!
    </div>,
    {
      nodeType: 1,
      prefix: null,
      localName: "div",
      attributes: [
        {
          nodeType: 2,
          prefix: null,
          localName: "class",
          value: "foo",
          childNodes: []
        }
      ],
      shadowRoot: null,
      childNodes: [hello, world, mark]
    }
  );
});

test("Handles boolean attributes when truthy", t => {
  const element = <div hidden />;

  const hidden = Array.from(element.attributes).find(
    attribute => attribute.localName === "hidden"
  );

  t.deepEqual(hidden, {
    nodeType: 2,
    prefix: null,
    localName: "hidden",
    value: "hidden",
    childNodes: []
  });
});

test("Handles boolean attributes when falsey", t => {
  const element = <div hidden={false} />;

  const hidden = Array.from(element.attributes).find(
    attribute => attribute.localName === "hidden"
  );

  t.equal(hidden, undefined);
});

test("Converts numbers in attributes to strings", t => {
  const element = <div number={20} />;

  const number = Array.from(element.attributes).find(
    attribute => attribute.localName === "number"
  );

  t.deepEqual(number, {
    nodeType: 2,
    prefix: null,
    localName: "number",
    value: "20",
    childNodes: []
  });
});

test("Handles attributes with null values", t => {
  const element = <div foo={null} />;

  const foo = Array.from(element.attributes).find(
    attribute => attribute.localName === "foo"
  );

  t.equal(foo, undefined);
});

test("Handles attributes with undefined values", t => {
  const element = <div foo={undefined} />;

  const foo = Array.from(element.attributes).find(
    attribute => attribute.localName === "foo"
  );

  t.equal(foo, undefined);
});

test("Handles attributes with NaN values", t => {
  const element = <div foo={NaN} />;

  const foo = Array.from(element.attributes).find(
    attribute => attribute.localName === "foo"
  );

  t.deepEqual(foo, {
    nodeType: 2,
    prefix: null,
    localName: "foo",
    value: "NaN",
    childNodes: []
  });
});

test("Handles attributes with array values", t => {
  const element = <div foo={[1, 2, 3]} />;

  const foo = Array.from(element.attributes).find(
    attribute => attribute.localName === "foo"
  );

  t.deepEqual(foo, {
    nodeType: 2,
    prefix: null,
    localName: "foo",
    value: "1,2,3",
    childNodes: []
  });
});

test("Handles attributes with object values", t => {
  const element = <div foo={{ foo: "foo" }} />;

  const foo = Array.from(element.attributes).find(
    attribute => attribute.localName === "foo"
  );

  t.deepEqual(foo, {
    nodeType: 2,
    prefix: null,
    localName: "foo",
    value: "[object Object]",
    childNodes: []
  });
});

test("Constructs and attaches shadow roots from <shadow> elements", t => {
  const element = (
    <div>
      <shadow>I'm in the shadows!</shadow>
    </div>
  );

  const text = {
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

test("Constructs and attaches content documents from <content> elements", t => {
  const iframe = (
    <iframe>
      <content>I'm in an iframe!</content>
    </iframe>
  );

  const text = {
    nodeType: 3,
    data: "I'm in an iframe!",
    childNodes: []
  };

  t.deepEqual(iframe, {
    nodeType: 1,
    prefix: null,
    localName: "iframe",
    attributes: [],
    shadowRoot: null,
    childNodes: [],
    contentDocument: {
      nodeType: 9,
      childNodes: [text],
      styleSheets: []
    }
  });
});
