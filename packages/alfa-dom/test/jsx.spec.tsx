import { test } from "@siteimprove/alfa-test";
import { jsx } from "../src/jsx";
import { NodeType } from "../src/types";

test("Transforms JSX into DOM nodes", t => {
  const text = {
    nodeType: NodeType.Text,
    data: "Hello world",
    childNodes: []
  };

  t.deepEqual(<div class="foo">Hello world</div>, {
    nodeType: NodeType.Element,
    prefix: null,
    localName: "div",
    attributes: [
      {
        nodeType: NodeType.Attribute,
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
    nodeType: NodeType.Text,
    data: "Hello ",
    childNodes: []
  };
  const world = {
    attributes: [],
    nodeType: NodeType.Element,
    localName: "b",
    shadowRoot: null,
    prefix: null,
    childNodes: [
      {
        nodeType: NodeType.Text,
        data: "world",
        childNodes: []
      }
    ]
  };
  const mark = {
    nodeType: NodeType.Text,
    data: "!",
    childNodes: []
  };

  t.deepEqual(
    <div class="foo">
      Hello <b>world</b>!
    </div>,
    {
      nodeType: NodeType.Element,
      prefix: null,
      localName: "div",
      attributes: [
        {
          nodeType: NodeType.Attribute,
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
    nodeType: NodeType.Attribute,
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
    nodeType: NodeType.Attribute,
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
    nodeType: NodeType.Attribute,
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
    nodeType: NodeType.Attribute,
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
    nodeType: NodeType.Attribute,
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
    nodeType: NodeType.Text,
    data: "I'm in the shadows!",
    childNodes: []
  };

  t.deepEqual(element, {
    nodeType: NodeType.Element,
    prefix: null,
    localName: "div",
    attributes: [],
    shadowRoot: {
      nodeType: NodeType.DocumentFragment,
      mode: "open",
      childNodes: [text],
      styleSheets: []
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
    nodeType: NodeType.Text,
    data: "I'm in an iframe!",
    childNodes: []
  };

  t.deepEqual(iframe, {
    nodeType: NodeType.Element,
    prefix: null,
    localName: "iframe",
    attributes: [],
    shadowRoot: null,
    childNodes: [],
    contentDocument: {
      nodeType: NodeType.Document,
      childNodes: [text],
      styleSheets: []
    }
  });
});
