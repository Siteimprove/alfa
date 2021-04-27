import { h } from "@siteimprove/alfa-dom/h";
import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";
import { Namespace } from "@siteimprove/alfa-dom";

import { Name } from "../src";

const device = Device.standard();

test(`.from() determines the name of a text node`, (t) => {
  const text = h.text("Hello world");

  t.deepEqual(Name.from(text, device).toJSON(), {
    type: "some",
    value: {
      value: "Hello world",
      sources: [
        {
          type: "data",
          text: "/text()[1]",
        },
      ],
    },
  });
});

test(`.from() determines the name of a <button> element with child text content`, (t) => {
  const button = <button>Hello world</button>;

  t.deepEqual(Name.from(button, device).toJSON(), {
    type: "some",
    value: {
      value: "Hello world",
      sources: [
        {
          type: "descendant",
          element: "/button[1]",
          name: {
            value: "Hello world",
            sources: [
              {
                type: "data",
                text: "/button[1]/text()[1]",
              },
            ],
          },
        },
      ],
    },
  });
});

test(`.from() determines the name of a <div> element with a role of button and
      with child text content`, (t) => {
  const button = <div role="button">Hello world</div>;

  t.deepEqual(Name.from(button, device).toJSON(), {
    type: "some",
    value: {
      value: "Hello world",
      sources: [
        {
          type: "descendant",
          element: "/div[1]",
          name: {
            value: "Hello world",
            sources: [
              {
                type: "data",
                text: "/div[1]/text()[1]",
              },
            ],
          },
        },
      ],
    },
  });
});

test(`.from() determines the name of a <button> element with partially hidden
      children`, (t) => {
  const button = (
    <button>
      Hello world
      <span style={{ display: "none" }}>!</span>
    </button>
  );

  t.deepEqual(Name.from(button, device).toJSON(), {
    type: "some",
    value: {
      value: "Hello world",
      sources: [
        {
          type: "descendant",
          element: "/button[1]",
          name: {
            value: "Hello world",
            sources: [
              {
                type: "data",
                text: "/button[1]/text()[1]",
              },
            ],
          },
        },
      ],
    },
  });
});

test(`.from() determines the name of a <button> element with a <span> child
      element with child text content`, (t) => {
  const button = (
    <button>
      <span>Hello world</span>
    </button>
  );

  t.deepEqual(Name.from(button, device).toJSON(), {
    type: "some",
    value: {
      value: "Hello world",
      sources: [
        {
          type: "descendant",
          element: "/button[1]",
          name: {
            value: "Hello world",
            sources: [
              {
                type: "descendant",
                element: "/button[1]/span[1]",
                name: {
                  value: "Hello world",
                  sources: [
                    {
                      type: "data",
                      text: "/button[1]/span[1]/text()[1]",
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  });
});

test(`.from() determines the name of a <button> element with an aria-label
      attribute`, (t) => {
  const button = <button aria-label="Hello world" />;

  t.deepEqual(Name.from(button, device).toJSON(), {
    type: "some",
    value: {
      value: "Hello world",
      sources: [
        {
          type: "label",
          attribute: "/button[1]/@aria-label",
        },
      ],
    },
  });
});

test(`.from() determines the name of a <button> element with an empty aria-label
      attribute and child text content`, (t) => {
  const button = <button aria-label="">Hello world</button>;

  t.deepEqual(Name.from(button, device).toJSON(), {
    type: "some",
    value: {
      value: "Hello world",
      sources: [
        {
          type: "descendant",
          element: "/button[1]",
          name: {
            value: "Hello world",
            sources: [
              {
                type: "data",
                text: "/button[1]/text()[1]",
              },
            ],
          },
        },
      ],
    },
  });
});

test(`.from() determines the name of a <button> element with an aria-labelledby
      attribute that points to a <p> element with child text content`, (t) => {
  const button = <button aria-labelledby="foo" />;

  <div>
    {button}
    <p id="foo">Hello world</p>
  </div>;

  t.deepEqual(Name.from(button, device).toJSON(), {
    type: "some",
    value: {
      value: "Hello world",
      sources: [
        {
          type: "reference",
          attribute: "/div[1]/button[1]/@aria-labelledby",
          name: {
            value: "Hello world",
            sources: [
              {
                type: "descendant",
                element: "/div[1]/p[1]",
                name: {
                  value: "Hello world",
                  sources: [
                    {
                      type: "data",
                      text: "/div[1]/p[1]/text()[1]",
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  });
});

test(`.from() determines the name of a <button> element with an aria-labelledby
      attribute that points to two <p> elements with child text content`, (t) => {
  const button = <button aria-labelledby="foo bar" />;

  <div>
    {button}
    <p id="foo">Hello</p>
    <p id="bar">world</p>
  </div>;

  t.deepEqual(Name.from(button, device).toJSON(), {
    type: "some",
    value: {
      value: "Hello world",
      sources: [
        {
          type: "reference",
          attribute: "/div[1]/button[1]/@aria-labelledby",
          name: {
            value: "Hello world",
            sources: [
              {
                type: "descendant",
                element: "/div[1]/p[1]",
                name: {
                  value: "Hello",
                  sources: [
                    {
                      type: "data",
                      text: "/div[1]/p[1]/text()[1]",
                    },
                  ],
                },
              },
              {
                type: "descendant",
                element: "/div[1]/p[2]",
                name: {
                  value: "world",
                  sources: [
                    {
                      type: "data",
                      text: "/div[1]/p[2]/text()[1]",
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  });
});

test(`.from() determines the name of a <button> element with a title attribute
      and no other non-whitespace child text content`, (t) => {
  const button = (
    <button title="Hello world">
      <span> </span>
    </button>
  );

  t.deepEqual(Name.from(button, device).toJSON(), {
    type: "some",
    value: {
      value: "Hello world",
      sources: [
        {
          type: "label",
          attribute: "/button[1]/@title",
        },
      ],
    },
  });
});

test(`.from() determines the name of an <img> element with an alt attribute`, (t) => {
  const img = <img alt="Hello world" />;

  t.deepEqual(Name.from(img, device).toJSON(), {
    type: "some",
    value: {
      value: "Hello world",
      sources: [
        {
          type: "label",
          attribute: "/img[1]/@alt",
        },
      ],
    },
  });
});

test(`.from() determines the name of an <a> element with a <img> child element
      with an alt attribute`, (t) => {
  const a = (
    <a href="#">
      <img alt="Hello world" />
    </a>
  );

  t.deepEqual(Name.from(a, device).toJSON(), {
    type: "some",
    value: {
      value: "Hello world",
      sources: [
        {
          type: "descendant",
          element: "/a[1]",
          name: {
            value: "Hello world",
            sources: [
              {
                type: "label",
                attribute: "/a[1]/img[1]/@alt",
              },
            ],
          },
        },
      ],
    },
  });
});

test(`.from() determines the name of an <a> element with a <figure> child element
      with a <img> child element with an alt attribute`, (t) => {
  const a = (
    <a href="#">
      <figure>
        <img alt="Hello world" />
      </figure>
    </a>
  );

  t.deepEqual(Name.from(a, device).toJSON(), {
    type: "some",
    value: {
      value: "Hello world",
      sources: [
        {
          type: "descendant",
          element: "/a[1]",
          name: {
            value: "Hello world",
            sources: [
              {
                type: "descendant",
                element: "/a[1]/figure[1]",
                name: {
                  value: "Hello world",
                  sources: [
                    {
                      type: "label",
                      attribute: "/a[1]/figure[1]/img[1]/@alt",
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  });
});

test(`.from() determines the name of an <a> element with text in its subtree`, (t) => {
  const a = (
    <a href="#" title="Content">
      Hello world
    </a>
  );

  t.deepEqual(Name.from(a, device).toJSON(), {
    type: "some",
    value: {
      value: "Hello world",
      sources: [
        {
          type: "descendant",
          element: "/a[1]",
          name: {
            value: "Hello world",
            sources: [
              {
                type: "data",
                text: "/a[1]/text()[1]",
              },
            ],
          },
        },
      ],
    },
  });
});

test(`.from() determines the name of an <a> element with text in its subtree,
      when the source is nested`, (t) => {
  const a = (
    <a href="#" title="Content">
      <span>Hello world</span>
    </a>
  );

  t.deepEqual(Name.from(a, device).toJSON(), {
    type: "some",
    value: {
      value: "Hello world",
      sources: [
        {
          type: "descendant",
          element: "/a[1]",
          name: {
            value: "Hello world",
            sources: [
              {
                type: "descendant",
                element: "/a[1]/span[1]",
                name: {
                  value: "Hello world",
                  sources: [
                    {
                      type: "data",
                      text: "/a[1]/span[1]/text()[1]",
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  });
});

test(`.from() determines the name of an <a> element with text in its subtree,
      when the source is nested and doesn't itself allow naming`, (t) => {
  const a = (
    <a href="#" title="Content">
      <p>Hello world</p>
    </a>
  );

  t.deepEqual(Name.from(a, device).toJSON(), {
    type: "some",
    value: {
      value: "Hello world",
      sources: [
        {
          type: "descendant",
          element: "/a[1]",
          name: {
            value: "Hello world",
            sources: [
              {
                type: "descendant",
                element: "/a[1]/p[1]",
                name: {
                  value: "Hello world",
                  sources: [
                    {
                      type: "data",
                      text: "/a[1]/p[1]/text()[1]",
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  });
});

test(`.from() determines the name of an <a> element with text in its subtree,
      when there are multiple nested sources`, (t) => {
  const a = (
    <a href="#" title="Content">
      <span>Hello</span>
      <span>world</span>
    </a>
  );

  t.deepEqual(Name.from(a, device).toJSON(), {
    type: "some",
    value: {
      value: "Hello world",
      sources: [
        {
          type: "descendant",
          element: "/a[1]",
          name: {
            value: "Hello",
            sources: [
              {
                type: "descendant",
                element: "/a[1]/span[1]",
                name: {
                  value: "Hello",
                  sources: [
                    {
                      type: "data",
                      text: "/a[1]/span[1]/text()[1]",
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          type: "descendant",
          element: "/a[1]",
          name: {
            value: "world",
            sources: [
              {
                type: "descendant",
                element: "/a[1]/span[2]",
                name: {
                  value: "world",
                  sources: [
                    {
                      type: "data",
                      text: "/a[1]/span[2]/text()[1]",
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  });
});

test(`.from() determines the name of an <area> element with an alt attribute`, (t) => {
  const area = <area alt="Hello world" />;

  t.deepEqual(Name.from(area, device).toJSON(), {
    type: "some",
    value: {
      value: "Hello world",
      sources: [
        {
          type: "label",
          attribute: "/area[1]/@alt",
        },
      ],
    },
  });
});

test(`.from() determines the name of a <fieldset> element with a <legend> child
      element with child text content`, (t) => {
  const fieldset = (
    <fieldset>
      <legend>Hello world</legend>
      This is a fieldset
    </fieldset>
  );

  t.deepEqual(Name.from(fieldset, device).toJSON(), {
    type: "some",
    value: {
      value: "Hello world",
      sources: [
        {
          type: "descendant",
          element: "/fieldset[1]",
          name: {
            value: "Hello world",
            sources: [
              {
                type: "descendant",
                element: "/fieldset[1]/legend[1]",
                name: {
                  value: "Hello world",
                  sources: [
                    {
                      type: "data",
                      text: "/fieldset[1]/legend[1]/text()[1]",
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  });
});

test(`.from() determines the name of a <figure> element with a <figcaption>
      child element with child text content`, (t) => {
  const figure = (
    <figure>
      <img alt="This is an image" />
      <figcaption>Hello world</figcaption>
    </figure>
  );

  t.deepEqual(Name.from(figure, device).toJSON(), {
    type: "some",
    value: {
      value: "Hello world",
      sources: [
        {
          type: "descendant",
          element: "/figure[1]",
          name: {
            value: "Hello world",
            sources: [
              {
                type: "descendant",
                element: "/figure[1]/figcaption[1]",
                name: {
                  value: "Hello world",
                  sources: [
                    {
                      type: "data",
                      text: "/figure[1]/figcaption[1]/text()[1]",
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  });
});

test(`.from() determines the name of a <table> element with a <caption> child
      element with child text content`, (t) => {
  const table = (
    <table>
      <caption>Hello world</caption>
      <tr>
        <td>This is a table cell</td>
      </tr>
    </table>
  );

  t.deepEqual(Name.from(table, device).toJSON(), {
    type: "some",
    value: {
      value: "Hello world",
      sources: [
        {
          type: "descendant",
          element: "/table[1]",
          name: {
            value: "Hello world",
            sources: [
              {
                type: "descendant",
                element: "/table[1]/caption[1]",
                name: {
                  value: "Hello world",
                  sources: [
                    {
                      type: "data",
                      text: "/table[1]/caption[1]/text()[1]",
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  });
});

test(`.from() determines the name of an <input> element with a <label> parent
      element with child text content`, (t) => {
  const input = <input />;

  <form>
    <label>
      Hello world
      {input}
    </label>
  </form>;

  t.deepEqual(Name.from(input, device).toJSON(), {
    type: "some",
    value: {
      value: "Hello world",
      sources: [
        {
          type: "ancestor",
          element: "/form[1]/label[1]",
          name: {
            value: "Hello world",
            sources: [
              {
                type: "descendant",
                element: "/form[1]/label[1]",
                name: {
                  value: "Hello world",
                  sources: [
                    {
                      type: "data",
                      text: "/form[1]/label[1]/text()[1]",
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  });
});

test(`.from() determines the name of an <input> element with a <label> element
      whose for attribute points to the <input> element`, (t) => {
  const input = <input id="foo" />;

  <form>
    <label for="foo">Hello world</label>
    {input}
  </form>;

  t.deepEqual(Name.from(input, device).toJSON(), {
    type: "some",
    value: {
      value: "Hello world",
      sources: [
        {
          type: "reference",
          attribute: "/form[1]/label[1]/@for",
          name: {
            value: "Hello world",
            sources: [
              {
                type: "descendant",
                element: "/form[1]/label[1]",
                name: {
                  value: "Hello world",
                  sources: [
                    {
                      type: "data",
                      text: "/form[1]/label[1]/text()[1]",
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  });
});

test(`.from() determines the name of an <input> element with both a <label>
      parent element with child text content and a <label> element whose for
      attribute points to the <input> element`, (t) => {
  const input = <input id="foo" />;

  <form>
    <label>
      Hello world
      {input}
    </label>
    <label for="foo">!</label>
  </form>;

  t.deepEqual(Name.from(input, device).toJSON(), {
    type: "some",
    value: {
      value: "Hello world !",
      sources: [
        {
          type: "ancestor",
          element: "/form[1]/label[1]",
          name: {
            value: "Hello world",
            sources: [
              {
                type: "descendant",
                element: "/form[1]/label[1]",
                name: {
                  value: "Hello world",
                  sources: [
                    {
                      type: "data",
                      text: "/form[1]/label[1]/text()[1]",
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          type: "reference",
          attribute: "/form[1]/label[2]/@for",
          name: {
            value: "!",
            sources: [
              {
                type: "descendant",
                element: "/form[1]/label[2]",
                name: {
                  value: "!",
                  sources: [
                    {
                      type: "data",
                      text: "/form[1]/label[2]/text()[1]",
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  });
});

test(`.from() determines the name of a <select> element with a <label> parent
      element with child text content`, (t) => {
  const select = <select />;

  <form>
    <label>
      Hello world
      {select}
    </label>
  </form>;

  t.deepEqual(Name.from(select, device).toJSON(), {
    type: "some",
    value: {
      value: "Hello world",
      sources: [
        {
          type: "ancestor",
          element: "/form[1]/label[1]",
          name: {
            value: "Hello world",
            sources: [
              {
                type: "descendant",
                element: "/form[1]/label[1]",
                name: {
                  value: "Hello world",
                  sources: [
                    {
                      type: "data",
                      text: "/form[1]/label[1]/text()[1]",
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  });
});

test(`.from() determines the name of an <input> element with a placeholder
      attribute`, (t) => {
  const input = <input placeholder="Hello world" />;

  t.deepEqual(Name.from(input, device).toJSON(), {
    type: "some",
    value: {
      value: "Hello world",
      sources: [
        {
          type: "label",
          attribute: "/input[1]/@placeholder",
        },
      ],
    },
  });
});

test(`.from() determines the name of an <input> element with a placeholder
      and a title attribute, with the title attribute taking precedence`, (t) => {
  const input = <input title="Hello title" placeholder="Hello placeholder" />;

  t.deepEqual(Name.from(input, device).toJSON(), {
    type: "some",
    value: {
      value: "Hello title",
      sources: [
        {
          type: "label",
          attribute: "/input[1]/@title",
        },
      ],
    },
  });
});

test(`.from() determines the name of an <input type="button"> element with a
      value attribute`, (t) => {
  const input = <input type="button" value="Hello world" />;

  t.deepEqual(Name.from(input, device).toJSON(), {
    type: "some",
    value: {
      value: "Hello world",
      sources: [
        {
          type: "label",
          attribute: "/input[1]/@value",
        },
      ],
    },
  });
});

test(`.from() determines the name of an <input type="submit"> element`, (t) => {
  const input = <input type="submit" />;

  t.deepEqual(Name.from(input, device).toJSON(), {
    type: "some",
    value: {
      value: "Submit",
      sources: [],
    },
  });
});

test(`.from() determines the name of an <input type="submit"> element with a
      value attribute`, (t) => {
  const input = <input type="submit" value="Hello world" />;

  t.deepEqual(Name.from(input, device).toJSON(), {
    type: "some",
    value: {
      value: "Hello world",
      sources: [
        {
          type: "label",
          attribute: "/input[1]/@value",
        },
      ],
    },
  });
});

test(`.from() determines the name of an <input type="reset"> element`, (t) => {
  const input = <input type="reset" />;

  t.deepEqual(Name.from(input, device).toJSON(), {
    type: "some",
    value: {
      value: "Reset",
      sources: [],
    },
  });
});

test(`.from() determines the name of an <input type="reset"> element with a
      value attribute`, (t) => {
  const input = <input type="reset" value="Hello world" />;

  t.deepEqual(Name.from(input, device).toJSON(), {
    type: "some",
    value: {
      value: "Hello world",
      sources: [
        {
          type: "label",
          attribute: "/input[1]/@value",
        },
      ],
    },
  });
});

test(`.from() determines the name of an <input type="image"> element`, (t) => {
  const input = <input type="image" />;

  t.deepEqual(Name.from(input, device).toJSON(), {
    type: "some",
    value: {
      value: "Submit",
      sources: [],
    },
  });
});

test(`.from() determines the name of an <input type="image"> element with an
      alt attribute`, (t) => {
  const input = <input type="image" alt="Hello world" />;

  t.deepEqual(Name.from(input, device).toJSON(), {
    type: "some",
    value: {
      value: "Hello world",
      sources: [
        {
          type: "label",
          attribute: "/input[1]/@alt",
        },
      ],
    },
  });
});

test(`.from() determines the name of a <button> element with a role of
      presentation`, (t) => {
  // Due to presentational role conflict resolution, the role of `presentation`
  // is ignored to ensure that the button, which is focusable, remains operable.
  const button = <button role="presentation">Hello world</button>;

  t.deepEqual(Name.from(button, device).toJSON(), {
    type: "some",
    value: {
      value: "Hello world",
      sources: [
        {
          type: "descendant",
          element: "/button[1]",
          name: {
            value: "Hello world",
            sources: [
              {
                type: "data",
                text: "/button[1]/text()[1]",
              },
            ],
          },
        },
      ],
    },
  });
});

test(`.from() determines the name of a <img> element with a an empty alt
      attribute and an aria-label attribute`, (t) => {
  // Due to presentational role conflict resolution, the role of `presentation`
  // is ignored to ensure that the `aria-label` attribute, which is a global
  // `aria-*` attribute, is exposed.
  const img = <img alt="" aria-label="Hello world" />;

  t.deepEqual(Name.from(img, device).toJSON(), {
    type: "some",
    value: {
      value: "Hello world",
      sources: [
        {
          type: "label",
          attribute: "/img[1]/@aria-label",
        },
      ],
    },
  });
});

test(`.from() determines the name of an SVG <svg> element with a <title> child
      element with child text content`, (t) => {
  const svg = (
    <svg xmlns={Namespace.SVG}>
      <title xmlns={Namespace.SVG}>Hello world</title>
    </svg>
  );

  t.deepEqual(Name.from(svg, device).toJSON(), {
    type: "some",
    value: {
      value: "Hello world",
      sources: [
        {
          type: "descendant",
          element: "/svg[1]",
          name: {
            value: "Hello world",
            sources: [
              {
                type: "descendant",
                element: "/svg[1]/title[1]",
                name: {
                  value: "Hello world",
                  sources: [
                    {
                      type: "data",
                      text: "/svg[1]/title[1]/text()[1]",
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  });
});

test(`.from() determines the name of an SVG <a> element with child text content`, (t) => {
  const a = (
    <a xmlns={Namespace.SVG} href="#">
      Hello world
    </a>
  );

  t.deepEqual(Name.from(a, device).toJSON(), {
    type: "some",
    value: {
      value: "Hello world",
      sources: [
        {
          type: "descendant",
          element: "/a[1]",
          name: {
            value: "Hello world",
            sources: [
              {
                type: "data",
                text: "/a[1]/text()[1]",
              },
            ],
          },
        },
      ],
    },
  });
});

test(`.from() correctly handles aria-labelledby references to hidden elements
      with child elements with child text content`, (t) => {
  const label = <label aria-labelledby="foo" />;

  <div>
    {label}
    <div id="foo" hidden>
      <span>Hello world</span>
    </div>
  </div>;

  t.deepEqual(Name.from(label, device).toJSON(), {
    type: "some",
    value: {
      value: "Hello world",
      sources: [
        {
          type: "reference",
          attribute: "/div[1]/label[1]/@aria-labelledby",
          name: {
            value: "Hello world",
            sources: [
              {
                type: "descendant",
                element: "/div[1]/div[1]",
                name: {
                  value: "Hello world",
                  sources: [
                    {
                      type: "descendant",
                      element: "/div[1]/div[1]/span[1]",
                      name: {
                        value: "Hello world",
                        sources: [
                          {
                            type: "data",
                            text: "/div[1]/div[1]/span[1]/text()[1]",
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  });
});

test(`.from() correctly handles circular aria-labelledby references`, (t) => {
  const foo = (
    <div id="foo" aria-labelledby="bar">
      Foo
    </div>
  );

  const bar = (
    <div id="bar" aria-labelledby="foo">
      Bar
    </div>
  );

  <div>
    {foo}
    {bar}
  </div>;

  t.deepEqual(Name.from(foo, device).toJSON(), {
    type: "some",
    value: {
      value: "Bar",
      sources: [
        {
          type: "reference",
          attribute: "/div[1]/div[1]/@aria-labelledby",
          name: {
            value: "Bar",
            sources: [
              {
                type: "descendant",
                element: "/div[1]/div[2]",
                name: {
                  value: "Bar",
                  sources: [
                    {
                      type: "data",
                      text: "/div[1]/div[2]/text()[1]",
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  });

  t.deepEqual(Name.from(bar, device).toJSON(), {
    type: "some",
    value: {
      value: "Foo",
      sources: [
        {
          type: "reference",
          attribute: "/div[1]/div[2]/@aria-labelledby",
          name: {
            value: "Foo",
            sources: [
              {
                type: "descendant",
                element: "/div[1]/div[1]",
                name: {
                  value: "Foo",
                  sources: [
                    {
                      type: "data",
                      text: "/div[1]/div[1]/text()[1]",
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  });
});

test(`.from() correctly handles chained aria-labelledby references`, (t) => {
  const foo = (
    <div id="foo" aria-labelledby="bar">
      Foo
    </div>
  );

  const bar = (
    <div id="bar" aria-labelledby="baz">
      Bar
    </div>
  );

  <div>
    {foo}
    {bar}
    <div id="baz">Baz</div>
  </div>;

  // From the perspective of `foo`, `bar` has a name of "Bar" as the second
  // `aria-labelledby` reference isn't followed.
  t.deepEqual(Name.from(foo, device).toJSON(), {
    type: "some",
    value: {
      value: "Bar",
      sources: [
        {
          type: "reference",
          attribute: "/div[1]/div[1]/@aria-labelledby",
          name: {
            value: "Bar",
            sources: [
              {
                type: "descendant",
                element: "/div[1]/div[2]",
                name: {
                  value: "Bar",
                  sources: [
                    {
                      type: "data",
                      text: "/div[1]/div[2]/text()[1]",
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  });

  // From the perspective of `bar`, it has a name of "Baz" as `bar` doesn't care
  // about `foo` and therefore only sees a single `aria-labelledby` reference.
  t.deepEqual(Name.from(bar, device).toJSON(), {
    type: "some",
    value: {
      value: "Baz",
      sources: [
        {
          type: "reference",
          attribute: "/div[1]/div[2]/@aria-labelledby",
          name: {
            value: "Baz",
            sources: [
              {
                type: "descendant",
                element: "/div[1]/div[3]",
                name: {
                  value: "Baz",
                  sources: [
                    {
                      type: "data",
                      text: "/div[1]/div[3]/text()[1]",
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  });
});

test(`.from() correctly handles self-referencing aria-labelledby references`, (t) => {
  const foo = (
    <div id="foo" aria-labelledby="foo bar">
      Hello
    </div>
  );

  <div>
    {foo}
    <div id="bar">world</div>
  </div>;

  t.deepEqual(Name.from(foo, device).toJSON(), {
    type: "some",
    value: {
      value: "Hello world",
      sources: [
        {
          type: "reference",
          attribute: "/div[1]/div[1]/@aria-labelledby",
          name: {
            value: "Hello world",
            sources: [
              {
                type: "descendant",
                element: "/div[1]/div[1]",
                name: {
                  value: "Hello",
                  sources: [
                    {
                      type: "data",
                      text: "/div[1]/div[1]/text()[1]",
                    },
                  ],
                },
              },
              {
                type: "descendant",
                element: "/div[1]/div[2]",
                name: {
                  value: "world",
                  sources: [
                    {
                      type: "data",
                      text: "/div[1]/div[2]/text()[1]",
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  });
});

test(".from() ignores nodes that are not exposed when computing name from content", (t) => {
  const heading = (
    <h1>
      <span>Hello</span>
      <span aria-hidden="true">world</span>
    </h1>
  );

  t.deepEqual(Name.from(heading, device).toJSON(), {
    type: "some",
    value: {
      value: "Hello",
      sources: [
        {
          type: "descendant",
          element: "/h1[1]",
          name: {
            value: "Hello",
            sources: [
              {
                type: "descendant",
                element: "/h1[1]/span[1]",
                name: {
                  value: "Hello",
                  sources: [
                    {
                      type: "data",
                      text: "/h1[1]/span[1]/text()[1]",
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  });
});

test(`.from() behaves correctly when encountering a descendant that doesn't
      itself have a name, but should have one when required by an ancestor`, (t) => {
  const table = <table>Hello world</table>;

  const heading = <h1>{table}</h1>;

  // On its own, the <table> element has no name as it's not named by its
  // contents.
  t.deepEqual(Name.from(table, device).toJSON(), {
    type: "none",
  });

  // When part of an <h1> element, which is named by its content, the <table>
  // element also takes its name from its content to ensure that the name
  // propagates to the <h1> element.
  t.deepEqual(Name.from(heading, device).toJSON(), {
    type: "some",
    value: {
      value: "Hello world",
      sources: [
        {
          type: "descendant",
          element: "/h1[1]",
          name: {
            value: "Hello world",
            sources: [
              {
                type: "descendant",
                element: "/h1[1]/table[1]",
                name: {
                  value: "Hello world",
                  sources: [
                    {
                      type: "data",
                      text: "/h1[1]/table[1]/text()[1]",
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  });
});
