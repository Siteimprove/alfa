import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";

import { Node } from "../src";

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

test(`.from() maps \`<img>\` with no source to presentational role`, (t) => {
  const empty = {
    type: "container",
    node: "/img[1]",
    role: null,
    children: [],
  };

  const images = [<img />, <img src="" />, <img alt="Hello" src="" />];

  for (const img of images) {
    t.deepEqual(Node.from(img, device).toJSON(), empty);
  }
});
