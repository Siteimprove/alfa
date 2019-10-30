import { test } from "@siteimprove/alfa-test";
import { jsx } from "../jsx";
import { getParentNode } from "../src/get-parent-node";

test("getParentNode() gets the parent of an element", t => {
  const child = <span class="child" />;
  const parent = <span class="parent">{child}</span>;

  t.deepEqual(getParentNode(child, <div>{parent}</div>).toJSON(), {
    value: parent
  });
});

test("getParentNode() gets the correct parent depending on context", t => {
  const child = <span class="child" />;
  const parent1 = <span class="parent1">{child}</span>;
  const parent2 = <span class="parent2">{child}</span>;

  t.deepEqual(getParentNode(child, <div>{parent1}</div>).toJSON(), {
    value: parent1
  });

  t.deepEqual(getParentNode(child, <div>{parent2}</div>).toJSON(), {
    value: parent2
  });
});

test("getParentNode() gets the parent of an element in a shadow host", t => {
  const child = <span class="child" />;

  const context = (
    <div>
      <shadow>{child}</shadow>
    </div>
  );

  t.deepEqual(getParentNode(child, context).toJSON(), {
    value: context.shadowRoot!
  });
});

test("getParentNode() gets the composed parent of an element", t => {
  const child = <span class="child" />;

  const context = (
    <div>
      <shadow>{child}</shadow>
    </div>
  );

  t.deepEqual(
    getParentNode(context.shadowRoot!, context, { composed: true }).toJSON(),
    {
      value: context
    }
  );
});

test("getParentNode() gets the flattened parent of an element", t => {
  const child = <span class="child" />;
  const parent = (
    <span class="parent">
      <slot />
    </span>
  );

  const context = (
    <div>
      {child}
      <shadow>{parent}</shadow>
    </div>
  );

  t.deepEqual(getParentNode(child, context, { flattened: true }).toJSON(), {
    value: parent
  });
});

test("Returns the parent of an element in an iframe", t => {
  const child = <span class="child" />;
  const parent = <div>{child}</div>;

  const context = (
    <iframe>
      <content>{parent}</content>
    </iframe>
  );

  t.deepEqual(getParentNode(child, context).toJSON(), {
    value: parent
  });
});
