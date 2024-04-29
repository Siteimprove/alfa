import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";
import * as json from "@siteimprove/alfa-json";
import { Rectangle } from "@siteimprove/alfa-rectangle";
import { Option } from "@siteimprove/alfa-option";

import { h } from "../h";
import { Element, Node, Shadow } from "../src";

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

    for (let child of node.children) {
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
        for (let child of shadow.children) {
          visit(child);
        }
      }
    }

    if (node.children !== undefined) {
      for (let child of node.children) {
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
        for (let child of content.children) {
          visit(child);
        }
      }
    }

    if (node.children !== undefined) {
      for (let child of node.children) {
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
