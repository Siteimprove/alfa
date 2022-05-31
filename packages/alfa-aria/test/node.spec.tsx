import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";

import { Node } from "../src";

const device = Device.standard();

test(`.from() constructs an accessible node from an element`, (t) => {
  const element = <button>Hello world</button>;

  t.deepEqual(Node.from(element, device).toJSON(), {
    type: "element",
    node: "/button[1]",
    role: "button",
    name: "Hello world",
    attributes: [],
    children: [
      {
        type: "text",
        node: "/button[1]/text()[1]",
        name: "Hello world",
      },
    ],
  });
});

test(`.from() gives precedence to aria-owns references`, (t) => {
  const header = (
    <header aria-owns="bar">
      <button id="foo" />
    </header>
  );

  const footer = (
    <footer>
      <input id="bar" />
    </footer>
  );

  <div>
    {header}
    {footer}
  </div>;

  t.deepEqual(Node.from(header, device).toJSON(), {
    type: "element",
    node: "/div[1]/header[1]",
    role: "banner",
    name: null,
    attributes: [
      {
        name: "aria-owns",
        value: "bar",
      },
    ],
    children: [
      {
        type: "element",
        node: "/div[1]/header[1]/button[1]",
        role: "button",
        name: null,
        attributes: [],
        children: [],
      },
      {
        type: "element",
        node: "/div[1]/footer[1]/input[1]",
        role: "textbox",
        name: null,
        attributes: [
          {
            name: "aria-checked",
            value: "false",
          },
        ],
        children: [],
      },
    ],
  });

  t.deepEqual(Node.from(footer, device).toJSON(), {
    type: "element",
    node: "/div[1]/footer[1]",
    role: "contentinfo",
    name: null,
    attributes: [],
    children: [],
  });
});

test(`.from() correctly handles conflicting aria-owns claims`, (t) => {
  const header = (
    <header aria-owns="bar">
      <button id="foo" />
    </header>
  );

  const footer = (
    <footer aria-owns="bar">
      <input id="bar" />
    </footer>
  );

  <div>
    {header}
    {footer}
  </div>;

  t.deepEqual(Node.from(header, device).toJSON(), {
    type: "element",
    node: "/div[1]/header[1]",
    role: "banner",
    name: null,
    attributes: [
      {
        name: "aria-owns",
        value: "bar",
      },
    ],
    children: [
      {
        type: "element",
        node: "/div[1]/header[1]/button[1]",
        role: "button",
        name: null,
        attributes: [],
        children: [],
      },
      {
        type: "element",
        node: "/div[1]/footer[1]/input[1]",
        role: "textbox",
        name: null,
        attributes: [
          {
            name: "aria-checked",
            value: "false",
          },
        ],
        children: [],
      },
    ],
  });

  t.deepEqual(Node.from(footer, device).toJSON(), {
    type: "element",
    node: "/div[1]/footer[1]",
    role: "contentinfo",
    name: null,
    attributes: [
      {
        name: "aria-owns",
        value: "bar",
      },
    ],
    children: [],
  });
});

test(`.from() correctly handles reordered aria-owns references`, (t) => {
  const header = (
    <header aria-owns="bar foo">
      <button id="foo" />
    </header>
  );

  <div>
    {header}
    <input id="bar" />
  </div>;

  t.deepEqual(Node.from(header, device).toJSON(), {
    type: "element",
    node: "/div[1]/header[1]",
    role: "banner",
    name: null,
    attributes: [
      {
        name: "aria-owns",
        value: "bar foo",
      },
    ],
    children: [
      {
        type: "element",
        node: "/div[1]/input[1]",
        role: "textbox",
        name: null,
        attributes: [
          {
            name: "aria-checked",
            value: "false",
          },
        ],
        children: [],
      },
      {
        type: "element",
        node: "/div[1]/header[1]/button[1]",
        role: "button",
        name: null,
        attributes: [],
        children: [],
      },
    ],
  });
});

test(`.from() correctly handles self-referential aria-owns references`, (t) => {
  const div = <div id="foo" aria-owns="foo" />;

  t.deepEqual(Node.from(div, device).toJSON(), {
    type: "element",
    node: "/div[1]",
    role: null,
    name: null,
    attributes: [
      {
        name: "aria-owns",
        value: "foo",
      },
    ],
    children: [],
  });
});

test(`.from() correctly handles circular aria-owns references between siblings`, (t) => {
  const foo = <div id="foo" aria-owns="bar" />;

  const bar = <div id="bar" aria-owns="foo" />;

  <div>
    {foo}
    {bar}
  </div>;

  t.deepEqual(Node.from(foo, device).toJSON(), {
    type: "element",
    node: "/div[1]/div[1]",
    role: null,
    name: null,
    attributes: [
      {
        name: "aria-owns",
        value: "bar",
      },
    ],
    children: [
      {
        type: "element",
        node: "/div[1]/div[2]",
        role: null,
        name: null,
        attributes: [
          {
            name: "aria-owns",
            value: "foo",
          },
        ],
        children: [],
      },
    ],
  });

  t.deepEqual(Node.from(bar, device).toJSON(), {
    type: "element",
    node: "/div[1]/div[2]",
    role: null,
    name: null,
    attributes: [
      {
        name: "aria-owns",
        value: "foo",
      },
    ],
    children: [],
  });
});

test(`.from() correctly handles circular aria-owns references between ancestors
      and descendants`, (t) => {
  const foo = <div id="foo" aria-owns="bar" />;

  const bar = <div id="bar">{foo}</div>;

  t.deepEqual(Node.from(foo, device).toJSON(), {
    type: "element",
    node: "/div[1]/div[1]",
    role: null,
    name: null,
    attributes: [
      {
        name: "aria-owns",
        value: "bar",
      },
    ],
    children: [],
  });

  t.deepEqual(Node.from(bar, device).toJSON(), {
    type: "container",
    node: "/div[1]",
    children: [
      {
        type: "element",
        node: "/div[1]/div[1]",
        role: null,
        name: null,
        attributes: [
          {
            name: "aria-owns",
            value: "bar",
          },
        ],
        children: [],
      },
    ],
  });
});

test(`.from() does not expose elements that are not rendered due to a DOM
      ancestor, but referred to by aria-owns`, (t) => {
  const target = <div id="target">Lorem ipsum…</div>;
  const owner = <div aria-owns="target">Hello World</div>;

  <div>
    <div style={{ display: "none" }}>{target}</div>
    {owner}
  </div>;

  t.deepEqual(Node.from(owner, device).toJSON(), {
    type: "element",
    node: "/div[1]/div[2]",
    attributes: [{ name: "aria-owns", value: "target" }],
    children: [
      {
        type: "text",
        node: "/div[1]/div[2]/text()[1]",
        name: "Hello World",
      },
      {
        type: "inert",
        node: "/div[1]/div[1]/div[1]",
      },
    ],
    role: null,
    name: null,
  });
});

test(`.from() exposes elements that are aria-hidden due to a DOM
      ancestor, but referred to by aria-owns`, (t) => {
  const target = <div id="target">Lorem ipsum…</div>;
  const owner = <div aria-owns="target">Hello World</div>;

  <div>
    <div aria-hidden="true">{target}</div>
    {owner}
  </div>;

  t.deepEqual(Node.from(owner, device).toJSON(), {
    type: "element",
    node: "/div[1]/div[2]",
    attributes: [{ name: "aria-owns", value: "target" }],
    children: [
      {
        type: "text",
        node: "/div[1]/div[2]/text()[1]",
        name: "Hello World",
      },
      {
        type: "container",
        node: "/div[1]/div[1]/div[1]",
        children: [
          {
            type: "text",
            node: "/div[1]/div[1]/div[1]/text()[1]",
            name: "Lorem ipsum…",
          },
        ],
      },
    ],
    role: null,
    name: null,
  });
});

test(".from() exposes elements if they have a role", (t) => {
  const foo = <button />;

  t.deepEqual(Node.from(foo, device).toJSON(), {
    type: "element",
    node: "/button[1]",
    role: "button",
    name: null,
    attributes: [],
    children: [],
  });
});

test(".from() exposes elements if they have ARIA attributes", (t) => {
  const foo = <div aria-label="foo" />;

  t.deepEqual(Node.from(foo, device).toJSON(), {
    type: "element",
    node: "/div[1]",
    role: null,
    name: "foo",
    attributes: [
      {
        name: "aria-label",
        value: "foo",
      },
    ],
    children: [],
  });
});

test(".from() exposes elements if they have a tabindex", (t) => {
  const foo = <div tabindex={0} />;

  t.deepEqual(Node.from(foo, device).toJSON(), {
    type: "element",
    node: "/div[1]",
    role: null,
    name: null,
    attributes: [],
    children: [],
  });

  const iframe = <iframe />; // Focusable by default, and no role

  t.deepEqual(Node.from(iframe, device).toJSON(), {
    type: "element",
    node: "/iframe[1]",
    role: null,
    name: null,
    attributes: [],
    children: [],
  });
});

test(`.from() does not expose elements that have no role, ARIA attributes, nor
      tabindex`, (t) => {
  const foo = <div>Hello world</div>;

  t.deepEqual(Node.from(foo, device).toJSON(), {
    type: "container",
    node: "/div[1]",
    children: [
      {
        type: "text",
        node: "/div[1]/text()[1]",
        name: "Hello world",
      },
    ],
  });
});

test(`.from() does not expose text nodes of a parent element with
      \`visibility: hidden\``, (t) => {
  const foo = <div style={{ visibility: "hidden" }}>Hello world</div>;

  t.deepEqual(Node.from(foo, device).toJSON(), {
    type: "container",
    node: "/div[1]",
    children: [
      {
        type: "inert",
        node: "/div[1]/text()[1]",
      },
    ],
  });
});

test(`.from() does not expose fallback DOM nodes for legacy browsers`, (t) => {
  const iframe = (
    <iframe>
      <div>Legacy content</div>
    </iframe>
  );

  t.deepEqual(Node.from(iframe, device).toJSON(), {
    type: "element",
    node: "/iframe[1]",
    role: null,
    name: null,
    attributes: [],
    children: [
      {
        type: "inert",
        node: "/iframe[1]/div[1]",
      },
    ],
  });
});

test(`.from() exposes implicitly required children of a presentational element
      with an inherited presentational role`, (t) => {
  const ul = (
    <ul role="presentation">
      <li />
    </ul>
  );

  t.deepEqual(Node.from(ul, device).toJSON(), {
    type: "container",
    node: "/ul[1]",
    children: [
      {
        type: "container",
        node: "/ul[1]/li[1]",
        children: [],
      },
    ],
  });
});

test(`.from() doesn't inherit presentational roles into explicitly required
      children of a presentational element`, (t) => {
  const ul = (
    <ul role="presentation">
      <li role="listitem" />
    </ul>
  );

  t.deepEqual(Node.from(ul, device).toJSON(), {
    type: "container",
    node: "/ul[1]",
    children: [
      {
        type: "element",
        node: "/ul[1]/li[1]",
        role: "listitem",
        name: null,
        attributes: [
          { name: "aria-setsize", value: "1" },
          { name: "aria-posinset", value: "1" },
        ],
        children: [],
      },
    ],
  });
});

test(`.from() doesn't inherit presentational roles into children of implicitly
      required children of a presentational element`, (t) => {
  const ul = (
    <ul role="presentation">
      <li>
        {
          // This element should _not_ inherit a presentational role as the
          // parent <li> element has no required children.
        }
        <button />
      </li>
    </ul>
  );

  t.deepEqual(Node.from(ul, device).toJSON(), {
    type: "container",
    node: "/ul[1]",
    children: [
      {
        type: "container",
        node: "/ul[1]/li[1]",
        children: [
          {
            type: "element",
            node: "/ul[1]/li[1]/button[1]",
            role: "button",
            name: null,
            attributes: [],
            children: [],
          },
        ],
      },
    ],
  });
});

test(`.from() doesn't expose children of elements with roles that designate
      their children as presentational`, (t) => {
  const button = (
    <button>
      <img src="#" />
    </button>
  );

  t.deepEqual(Node.from(button, device).toJSON(), {
    type: "element",
    node: "/button[1]",
    role: "button",
    name: null,
    attributes: [],
    children: [
      {
        type: "container",
        node: "/button[1]/img[1]",
        children: [],
      },
    ],
  });
});

test(`.from() correctly sets \`aria-setsize\` and \`aria-posinset\``, (t) => {
  const items = [
    <li>First</li>,
    <li>Second</li>,
    <li>Third</li>,
    <li>Fourth</li>,
  ];

  <ul>{items}</ul>;

  for (let i = 0; i < items.length; i++) {
    const node = Node.from(items[i], device);

    t.equal(node.attribute("aria-setsize").get().value, `${items.length}`);

    t.equal(node.attribute("aria-posinset").get().value, `${i + 1}`);
  }
});

test(`.from() behaves when encountering an element with global properties where
      the element should not be named by its subtree`, (t) => {
  const div = (
    <div aria-hidden="false">
      <label>
        Foo <input />
      </label>
    </div>
  );

  t.deepEqual(Node.from(div, device).toJSON(), {
    type: "element",
    node: "/div[1]",
    role: null,
    name: null,
    attributes: [
      {
        name: "aria-hidden",
        value: "false",
      },
    ],
    children: [
      {
        type: "container",
        node: "/div[1]/label[1]",
        children: [
          {
            type: "text",
            node: "/div[1]/label[1]/text()[1]",
            name: "Foo ",
          },
          {
            type: "element",
            node: "/div[1]/label[1]/input[1]",
            role: "textbox",
            name: "Foo",
            attributes: [
              {
                name: "aria-checked",
                value: "false",
              },
            ],
            children: [],
          },
        ],
      },
    ],
  });
});
