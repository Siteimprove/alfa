/// <reference lib="dom" />
import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";
import { Rectangle } from "@siteimprove/alfa-rectangle";
import { Option } from "@siteimprove/alfa-option";

import * as json from "@siteimprove/alfa-json";

import { h } from "../dist/index.js";
import type { Attribute, Document, Element, Shadow } from "../dist/index.js";
import { Node } from "../dist/index.js";

test("#tabOrder() returns the tab order of a node", (t) => {
  const a = <button />;
  const b = <button />;

  const div = (
    <div>
      {a}
      {b}
    </div>
  );

  t.deepEqual([...div.tabOrder()], [a, b]);
});

test("#tabOrder() correctly handles explicitly ordered tab indices", (t) => {
  const a = <button tabindex="2" />;
  const b = <button tabindex="1" />;
  const c = <button />;

  const div = (
    <div>
      {a}
      {b}
      {c}
    </div>
  );

  t.deepEqual([...div.tabOrder()], [b, a, c]);
});

test(`#tabOrder() correctly orders light and shadow elements`, (t) => {
  const a = <button />;
  const b = <button />;

  const div = (
    <div>
      {a}
      <div>{h.shadow([b])}</div>
    </div>
  );

  t.deepEqual([...div.tabOrder()], [a, b]);
});

test(`#tabOrder() does not mix explicit taborder between trees`, (t) => {
  const a = <button tabindex="1" />;
  const b = <button tabindex="2" />;
  const c = <button tabindex="3" />;
  const d = <button tabindex="4" />;
  const e = <button tabindex="1" />;
  const f = <button />;

  const div = (
    <div>
      {c}
      <div>{h.shadow([d, e])}</div>
      <iframe>{h.document([b])}</iframe>
      {a}
      {f}
    </div>
  );

  // a and c, with >0 tabindex, come before the hosts and f.
  t.deepEqual([...div.tabOrder()], [a, c, e, d, b, f]);
});

test(`#tabOrder() correctly handles shadow roots with slotted elements before
      the shadow contents`, (t) => {
  const a = <button />;
  const b = <button />;

  const div = (
    <div>
      {h.shadow([<slot />, b])}
      {a}
    </div>
  );

  t.deepEqual([...div.tabOrder()], [a, b]);
});

test(`#tabOrder() correctly handles shadow roots with slotted elements after the
      shadow contents`, (t) => {
  const a = <button />;
  const b = <button />;

  const div = (
    <div>
      {h.shadow([b, <slot />])}
      {a}
    </div>
  );

  t.deepEqual([...div.tabOrder()], [b, a]);
});

test(`Node.clone() creates new instance with same value`, (t) => {
  const device = Device.standard();
  const doc = h.document(
    [
      <p title="foo" box={{ device, x: 1, y: 2, width: 3, height: 4 }}>
        hello
      </p>,
    ],
    [h.sheet([h.rule.style("p", { background: "green" })])],
    "bar",
    "some id",
    { extraStuff: "baz" },
  );

  const clonedDoc = Node.clone(doc);

  t.notEqual(clonedDoc, doc);

  t.deepEqual(clonedDoc.toJSON(), doc.toJSON());
});

test(`Node.clone() clones shadow`, (t) => {
  const shadow = h.shadow([<div>foo</div>]);
  const div = <div>{shadow}</div>;

  const clonedDiv = Node.clone(div);

  t.notEqual(clonedDiv.shadow.getUnsafe(), shadow);

  t.deepEqual(
    div.shadow.getUnsafe().toJSON(),
    clonedDiv.shadow.getUnsafe().toJSON(),
  );
});

test(`Node.clone() clones content`, (t) => {
  const content = h.document([<div>foo</div>]);
  const div = <div>{content}</div>;

  const clonedDiv = Node.clone(div);

  t.notEqual(clonedDiv.content.getUnsafe(), content);

  t.deepEqual(div.toJSON(), clonedDiv.toJSON());
});

test(`Node.clone() correctly replaces elements based on predicate`, (t) => {
  const foo = <div externalId="foo">Foo</div>;
  const bar = <div externalId="bar">Bar</div>;

  const doc = h.document([foo, bar]);

  const newElements = [
    <p externalId="foo1">Foo1</p>,
    <span externalId="foo2">Foo2</span>,
  ];

  const cloned = Node.clone(doc, {
    predicate: (element) => element.externalId === "foo",
    newElements,
  });

  t.deepEqual(cloned.toJSON(), {
    style: [],
    type: "document",
    children: [...newElements.map((e) => e.toJSON()), bar.toJSON()],
  });
});

test(`#toJSON() serializes boxes of all descendants when device is passed in`, (t) => {
  const device = Device.standard();

  const doc = h.document([
    <div box={{ device, x: 8, y: 8, width: 100, height: 100 }}>
      Hello
      <div box={{ device, x: 16, y: 16, width: 50, height: 50 }}>World</div>
    </div>,
  ]);

  const boxes: Array<json.JSON> = [];

  function visit(node: Node.JSON) {
    if (node.type === "element" && node.box !== undefined) {
      boxes.push(node.box);
    }

    if (node.children === undefined) {
      return;
    }

    for (const child of node.children) {
      visit(child);
    }
  }

  visit(doc.toJSON({ device }));

  t.deepEqual(boxes, [
    Rectangle.of(8, 8, 100, 100).toJSON(),
    Rectangle.of(16, 16, 50, 50).toJSON(),
  ]);
});

test(`#toJSON() serializes box of descendant inside shadow DOM`, (t) => {
  const device = Device.standard();

  const doc = h.document([
    <div box={{ device, x: 8, y: 8, width: 100, height: 100 }}>
      Hello
      {h.shadow([
        <slot box={{ device, x: 12, y: 12, width: 50, height: 50 }} />,
        <span box={{ device, x: 16, y: 16, width: 50, height: 50 }}>
          World
        </span>,
      ])}
    </div>,
  ]);

  const boxes: Array<json.JSON> = [];

  function visit(node: Node.JSON) {
    if (node.type === "element") {
      const element = node as Element.JSON;
      if (element.box !== undefined) {
        boxes.push(element.box);
      }
    }

    if (Option.from(node.shadow).isSome()) {
      const shadow = node.shadow as Shadow.JSON;
      if (shadow.children !== undefined) {
        for (const child of shadow.children) {
          visit(child);
        }
      }
    }

    if (node.children !== undefined) {
      for (const child of node.children) {
        visit(child);
      }
    }
  }

  visit(doc.toJSON({ device }));

  t.deepEqual(boxes, [
    Rectangle.of(8, 8, 100, 100).toJSON(),
    Rectangle.of(12, 12, 50, 50).toJSON(),
    Rectangle.of(16, 16, 50, 50).toJSON(),
  ]);
});

test(`#toJSON() serializes box of descendant inside content`, (t) => {
  const device = Device.standard();

  const doc = h.document([
    <div box={{ device, x: 8, y: 8, width: 100, height: 100 }}>
      Hello
      {h.document([
        <span box={{ device, x: 16, y: 16, width: 50, height: 50 }}>
          World
        </span>,
      ])}
    </div>,
  ]);

  const boxes: Array<json.JSON> = [];

  function visit(node: Node.JSON) {
    if (node.type === "element") {
      const element = node as Element.JSON;
      if (element.box !== undefined) {
        boxes.push(element.box);
      }
    }

    if (Option.from(node.content).isSome()) {
      const content = node.content as Node.JSON;
      if (content.children !== undefined) {
        for (const child of content.children) {
          visit(child);
        }
      }
    }

    if (node.children !== undefined) {
      for (const child of node.children) {
        visit(child);
      }
    }
  }

  visit(doc.toJSON({ device }));

  t.deepEqual(boxes, [
    Rectangle.of(8, 8, 100, 100).toJSON(),
    Rectangle.of(16, 16, 50, 50).toJSON(),
  ]);
});

function docWithinternalIds(
  docId: string,
  elmId: string,
  attrId: string,
): Document {
  // We can't use JSX here because it doesn't support passing a serialization id when constructing an attribute
  return h.document(
    [
      h.element(
        "div",
        [h.attribute("id", "foo", undefined, attrId)],
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        elmId,
      ),
    ],
    undefined,
    undefined,
    docId,
  );
}

test("#toJSON() includes only internalId when verbosity is minimal", (t) => {
  const docId = "id of doc";
  const elmId = "id of element";
  const attrId = "id of attribute";

  const doc = docWithinternalIds(docId, elmId, attrId);

  const device = Device.standard();

  const options = {
    device,
    verbosity: json.Serializable.Verbosity.Minimal,
  } as const;

  t.deepEqual(doc.toJSON(options), {
    type: "document",
    internalId: docId,
    serializationId: docId,
  });

  const elm = doc.children().first().getUnsafe() as Element<"div">;

  t.deepEqual(elm.toJSON(options), {
    type: "element",
    internalId: elmId,
    serializationId: elmId,
  });

  const attr = elm.attributes.first().getUnsafe() as Attribute<"id">;

  t.deepEqual(attr.toJSON(options), {
    type: "attribute",
    internalId: attrId,
    serializationId: attrId,
  });
});

test("#toJSON() includes internalId and path when verbosity is low", (t) => {
  const docId = "id of doc";
  const elmId = "id of element";
  const attrId = "id of attribute";

  const doc = docWithinternalIds(docId, elmId, attrId);

  const device = Device.standard();

  const options = {
    device,
    verbosity: json.Serializable.Verbosity.Low,
  } as const;

  t.deepEqual(doc.toJSON(options), {
    type: "document",
    path: "/",
    internalId: docId,
    serializationId: docId,
  });

  const elm = doc.children().first().getUnsafe() as Element<"div">;

  t.deepEqual(elm.toJSON(options), {
    type: "element",
    path: "/div[1]",
    internalId: elmId,
    serializationId: elmId,
  });

  const attr = elm.attributes.first().getUnsafe() as Attribute<"id">;

  t.deepEqual(attr.toJSON(options), {
    type: "attribute",
    path: "/div[1]/@id",
    internalId: attrId,
    serializationId: attrId,
  });
});

test("#toJSON() uses composed path when verbosity is low", (t) => {
  // We want the serialized path to be explicit about entering shadow DOM
  const a = <span internalId="a"></span>;
  const b = <span internalId="b"></span>;
  const slot = <slot internalId="slot" />;
  const shadow = h.shadow([slot, b], undefined, undefined, undefined, "shadow");

  const div = (
    <div internalId="div">
      {shadow}
      {a}
    </div>
  );

  t.deepEqual(div.toJSON({ verbosity: json.Serializable.Verbosity.Low }), {
    type: "element",
    path: "/div[1]",
    internalId: "div",
    serializationId: "div",
  });

  t.deepEqual(a.toJSON({ verbosity: json.Serializable.Verbosity.Low }), {
    type: "element",
    path: "/div[1]/span[1]",
    internalId: "a",
    serializationId: "a",
  });

  t.deepEqual(b.toJSON({ verbosity: json.Serializable.Verbosity.Low }), {
    type: "element",
    path: "/div[1]/shadow-root()/span[1]",
    internalId: "b",
    serializationId: "b",
  });

  t.deepEqual(slot.toJSON({ verbosity: json.Serializable.Verbosity.Low }), {
    type: "element",
    path: "/div[1]/shadow-root()/slot[1]",
    internalId: "slot",
    serializationId: "slot",
  });

  t.deepEqual(shadow.toJSON({ verbosity: json.Serializable.Verbosity.Low }), {
    type: "shadow",
    path: "/div[1]/shadow-root()",
    internalId: "shadow",
    serializationId: "shadow",
  });
});

test("#toJSON() uses nested path when verbosity is low", (t) => {
  // We want the serialized path to be explicit about entering nested documents
  const a = <span internalId="a"></span>;
  const b = <span internalId="b"></span>;
  const innerDoc = h.document([b], undefined, undefined, "document");
  const iframe = <iframe internalId="iframe">{innerDoc}</iframe>;

  const div = (
    <div internalId="div">
      {iframe}
      {a}
    </div>
  );

  t.deepEqual(div.toJSON({ verbosity: json.Serializable.Verbosity.Low }), {
    type: "element",
    path: "/div[1]",
    internalId: "div",
    serializationId: "div",
  });

  t.deepEqual(a.toJSON({ verbosity: json.Serializable.Verbosity.Low }), {
    type: "element",
    path: "/div[1]/span[1]",
    internalId: "a",
    serializationId: "a",
  });

  t.deepEqual(b.toJSON({ verbosity: json.Serializable.Verbosity.Low }), {
    type: "element",
    path: "/div[1]/iframe[1]/document-node()/span[1]",
    internalId: "b",
    serializationId: "b",
  });

  t.deepEqual(innerDoc.toJSON({ verbosity: json.Serializable.Verbosity.Low }), {
    type: "document",
    path: "/div[1]/iframe[1]/document-node()",
    internalId: "document",
    serializationId: "document",
  });

  t.deepEqual(iframe.toJSON({ verbosity: json.Serializable.Verbosity.Low }), {
    type: "element",
    path: "/div[1]/iframe[1]",
    internalId: "iframe",
    serializationId: "iframe",
  });
});

test("#toJSON() includes everything except internalId when options is undefined or verbosity is medium", (t) => {
  const doc = h.document([<div id="foo"></div>]);

  const device = Device.standard();

  const options = [
    undefined,
    {
      device,
      verbosity: json.Serializable.Verbosity.Medium,
    } as const,
  ] as const;

  for (const option of options) {
    t.deepEqual(doc.toJSON(option), {
      type: "document",
      style: [],
      children: [
        {
          type: "element",
          attributes: [
            {
              type: "attribute",
              name: "id",
              namespace: null,
              prefix: null,
              value: "foo",
            },
          ],
          box: null,
          children: [],
          content: null,
          name: "div",
          namespace: "http://www.w3.org/1999/xhtml",
          prefix: null,
          shadow: null,
          style: null,
        },
      ],
    });
  }
});

test("#toJSON() includes everything including internalId and assigned slot when verbosity is high", (t) => {
  const docId = "id of doc";
  const elmId = "id of element";
  const attrId = "id of attribute";

  const doc = docWithinternalIds(docId, elmId, attrId);

  const options = {
    device: Device.standard(),
    verbosity: json.Serializable.Verbosity.High,
  } as const;

  t.deepEqual(doc.toJSON(options), {
    type: "document",
    internalId: docId,
    serializationId: docId,
    style: [],
    children: [
      {
        type: "element",
        internalId: elmId,
        serializationId: elmId,
        assignedSlot: null,
        attributes: [
          {
            type: "attribute",
            internalId: attrId,
            serializationId: attrId,
            name: "id",
            namespace: null,
            prefix: null,
            value: "foo",
          },
        ],
        box: null,
        children: [],
        content: null,
        name: "div",
        namespace: "http://www.w3.org/1999/xhtml",
        prefix: null,
        shadow: null,
        style: null,
      },
    ],
  });
});

test("#toJSON() includes internalId of assigned slots when verbosity is high", (t) => {
  const a = <span internalId="a"></span>;
  const b = <span internalId="b"></span>;

  const div = (
    <div internalId="div">
      {h.shadow(
        [<slot internalId="slot" />, b],
        undefined,
        undefined,
        undefined,
        "shadow",
      )}
      {a}
    </div>
  );

  t.deepEqual(div.toJSON({ verbosity: json.Serializable.Verbosity.High }), {
    type: "element",
    children: [
      {
        type: "element",
        children: [],
        internalId: "a",
        serializationId: "a",
        assignedSlot: {
          type: "element",
          internalId: "slot",
          serializationId: "slot",
        },
        namespace: "http://www.w3.org/1999/xhtml",
        prefix: null,
        name: "span",
        attributes: [],
        style: null,
        shadow: null,
        content: null,
        box: null,
      },
    ],
    internalId: "div",
    serializationId: "div",
    assignedSlot: null,
    namespace: "http://www.w3.org/1999/xhtml",
    prefix: null,
    name: "div",
    attributes: [],
    style: null,
    shadow: {
      type: "shadow",
      children: [
        {
          type: "element",
          children: [],
          internalId: "slot",
          serializationId: "slot",
          assignedSlot: null,
          namespace: "http://www.w3.org/1999/xhtml",
          prefix: null,
          name: "slot",
          attributes: [],
          style: null,
          shadow: null,
          content: null,
          box: null,
        },
        {
          type: "element",
          children: [],
          internalId: "b",
          serializationId: "b",
          assignedSlot: null,
          namespace: "http://www.w3.org/1999/xhtml",
          prefix: null,
          name: "span",
          attributes: [],
          style: null,
          shadow: null,
          content: null,
          box: null,
        },
      ],
      internalId: "shadow",
      serializationId: "shadow",
      mode: "open",
      style: [],
    },
    content: null,
    box: null,
  });
});
