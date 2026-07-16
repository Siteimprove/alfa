import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";
import { h } from "@siteimprove/alfa-dom";

import { Node } from "../src/index.ts";

const device = Device.standard();

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
    role: null,
    children: [
      {
        type: "container",
        node: "/ul[1]/li[1]",
        role: null,
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
    role: null,
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
    role: null,
    children: [
      {
        type: "container",
        node: "/ul[1]/li[1]",
        role: null,
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
        role: null,
        children: [],
      },
    ],
  });
});

test(`.from() maps \`<select>\` to listboxes`, (t) => {
  // mono-line <select> are mapped to combobox by HTML AAM, but their child
  // <option> are still mapped to option, which are out of their context role.
  // We cheat and always map <select> to listbox
  const select = (
    <select>
      <option>Hello</option>
    </select>
  );

  t.deepEqual(Node.from(select, device).toJSON(), {
    type: "element",
    children: [
      {
        type: "element",
        children: [
          {
            type: "text",
            node: "/select[1]/option[1]/text()[1]",
            name: "Hello",
          },
        ],
        node: "/select[1]/option[1]",
        role: "option",
        name: "Hello",
        attributes: [{ name: "aria-selected", value: "false" }],
      },
    ],
    node: "/select[1]",
    role: "listbox",
    name: null,
    attributes: [{ name: "aria-orientation", value: "vertical" }],
  });
});

// The role of src-less images is still "img" in the specs (and major browsers),
// however, there seems to be consensus ARIA side that it should be "none", but
// the exact phrasing is complicated due to empty `<img>` inside `<picture>`.
// See https://github.com/w3c/aria/pull/2221
// Keeping this here for memory purpose.
// test(`.from() maps \`<img>\` with no source to image role`, (t) => {
//   const empty = {
//     type: "container",
//     node: "/img[1]",
//     role: null,
//     children: [],
//   };
//
//   const images = [<img />, <img src="" />, <img alt="Hello" src="" />];
//
//   for (const img of images) {
//     t.deepEqual(Node.from(img, device).toJSON(), empty);
//   }
// });
//
test(`.from() correctly handles slotted list items`, (t) => {
  const target = (
    <div>
      {h.shadow([
        <ul>
          <slot></slot>
        </ul>,
      ])}
      <li>Hello</li>
    </div>
  );

  t.deepEqual(
    Node.from(target, device).children().first().getUnsafe().toJSON(),
    {
      type: "element",
      node: "/div[1]/ul[1]",
      role: "list",
      name: null,
      attributes: [],
      children: [
        {
          type: "element",
          node: "/div[1]/ul[1]/li[1]",
          role: "listitem",
          name: null,
          attributes: [
            { name: "aria-setsize", value: "1" },
            { name: "aria-posinset", value: "1" },
          ],
          children: [
            {
              type: "text",
              node: "/div[1]/ul[1]/li[1]/text()[1]",
              name: "Hello",
            },
          ],
        },
      ],
    },
  );
});

test(`.from() gives a role to named sections`, (t) => {
  for (const target of [
    <section aria-label="named"></section>,
    <section title="named"></section>,
    // Empty/whitespace titles are considered as named.
    <section title=""></section>,
    <section title=" "></section>,
  ]) {
    t.deepEqual(Node.from(target, device).toJSON().role, "region");
  }

  {
    const target = <section aria-labelledby="name"></section>;
    <div>
      {target}
      <span id="name">Named</span>
    </div>;
    t.deepEqual(Node.from(target, device).toJSON().role, "region");
  }
  {
    // Empty aria-labelledby target is still considered as named.
    const target = <section aria-labelledby="name"></section>;
    <div>
      {target}
      <span id="name"></span>
    </div>;
    t.deepEqual(Node.from(target, device).toJSON().role, "region");
  }
});

test(`.from() doesn't give a role to unnamed sections`, (t) => {
  for (const target of [
    <section></section>,
    // Empty/whitespace aria-label are not considered named.
    <section aria-label=""></section>,
    <section aria-label=" "></section>,
  ]) {
    t.deepEqual(Node.from(target, device).toJSON().role, "generic");
  }

  const target = <section aria-labelledby="invalid"></section>;
  <div>
    {target}
    <span id="name">Named</span>
  </div>;
  t.deepEqual(Node.from(target, device).toJSON().role, "generic");
});

test(`.from() gives a role to sectioned named asides`, (t) => {
  for (const target of [
    <aside aria-label="named"></aside>,
    <aside title="named"></aside>,
    // Empty/whitespace titles are considered as named.
    <aside title=""></aside>,
    <aside title=" "></aside>,
  ]) {
    <section>{target}</section>;
    t.deepEqual(Node.from(target, device).toJSON().role, "complementary");
  }

  {
    const target = <aside aria-labelledby="name"></aside>;
    <section>
      {target}
      <span id="name">Named</span>
    </section>;
    t.deepEqual(Node.from(target, device).toJSON().role, "complementary");
  }
  {
    // Empty aria-labelledby target is still considered as named.
    const target = <aside aria-labelledby="name"></aside>;
    <section>
      {target}
      <span id="name"></span>
    </section>;
    t.deepEqual(Node.from(target, device).toJSON().role, "complementary");
  }
});

test(`.from() doesn't give a role to unnamed sectioned asides`, (t) => {
  for (const target of [
    <aside></aside>,
    // Empty/whitespace aria-label are not considered named.
    <aside aria-label=""></aside>,
    <aside aria-label=" "></aside>,
  ]) {
    <section>{target}</section>;
    t.deepEqual(Node.from(target, device).toJSON().role, "generic");
  }

  const target = <aside aria-labelledby="invalid"></aside>;
  <section>{target}</section>;
  t.deepEqual(Node.from(target, device).toJSON().role, "generic");
});

test(`.from() gives a role to all unscoped asides`, (t) => {
  for (const target of [
    <aside aria-label="named"></aside>,
    <aside title="named"></aside>,
    <aside title=""></aside>,
    <aside title=" "></aside>,
    <aside></aside>,
    <aside aria-label=""></aside>,
    <aside aria-label=" "></aside>,
  ]) {
    t.deepEqual(Node.from(target, device).toJSON().role, "complementary");
  }

  {
    const target = <aside aria-labelledby="name"></aside>;
    <div>
      {target}
      <span id="name">Named</span>
    </div>;
    t.deepEqual(Node.from(target, device).toJSON().role, "complementary");
  }
  {
    const target = <aside aria-labelledby="name"></aside>;
    <div>
      {target}
      <span id="name"></span>
    </div>;
    t.deepEqual(Node.from(target, device).toJSON().role, "complementary");
  }

  {
    const target = <aside aria-labelledby="invalid"></aside>;
    <div>{target}</div>;
    t.deepEqual(Node.from(target, device).toJSON().role, "complementary");
  }
});

test(`.from() gives a role to named alt-less images`, (t) => {
  for (const target of [
    <img alt="" src="foo.jpg" aria-label="named" />,
    // Empty/whitespace aria-label are considered named.
    <img alt="" src="foo.jpg" aria-label="" />,
    <img alt="" src="foo.jpg" aria-label=" " />,
    <img alt="" src="foo.jpg" title="named" />,
    // Empty/whitespace titles are considered as named.
    <img alt="" src="foo.jpg" title="" />,
    <img alt="" src="foo.jpg" title=" " />,
  ]) {
    t.deepEqual(Node.from(target, device).toJSON().role, "img");
  }

  {
    const target = <img alt="" src="foo.jpg" aria-labelledby="name" />;
    <div>
      {target}
      <span id="name">Named</span>
    </div>;
    t.deepEqual(Node.from(target, device).toJSON().role, "img");
  }
  {
    // Empty aria-labelledby target is still considered as named.
    const target = <img alt="" src="foo.jpg" aria-labelledby="name" />;
    <div>
      {target}
      <span id="name"></span>
    </div>;
    t.deepEqual(Node.from(target, device).toJSON().role, "img");
  }

  {
    // Invalid aria-labelledby is still considered as named
    const target = <img alt="" src="foo.jpg" aria-labelledby="invalid" />;
    <div>{target}</div>;
    t.deepEqual(Node.from(target, device).toJSON().role, "img");
  }
});

test(`.from() doesn't create a node for unnamed alt-less images`, (t) => {
  const target=<img alt="" src="foo.jpg" />;

  t.deepEqual(Node.from(target, device).toJSON().role, null);
});
