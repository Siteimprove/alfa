import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Browser } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { None, Some } from "@siteimprove/alfa-option";
import { getName } from "../src/get-name";

const device = Device.standard();

test("getName() computes the text alternative of a button with text", t => {
  const button = Element.fromElement(<button>Button</button>);

  t.deepEqual(getName(button, device).toJSON(), {
    values: [
      {
        value: {
          type: "some",
          value: "Button"
        },
        branches: null
      }
    ]
  });
});

test("getName() correctly resolves explicit roles", t => {
  const button = Element.fromElement(<div role="button">Button</div>);

  t.deepEqual(getName(button, device).toJSON(), {
    values: [
      {
        value: {
          type: "some",
          value: "Button"
        },
        branches: null
      }
    ]
  });
});

test("getName() computes the text alternative of a button with text within a span", t => {
  const button = Element.fromElement(
    <button>
      <span>Button</span>
    </button>
  );

  t.deepEqual(getName(button, device).toJSON(), {
    values: [
      {
        value: {
          type: "some",
          value: "Button"
        },
        branches: null
      }
    ]
  });
});

test("getName() ignores non-visible nodes", t => {
  const button = Element.fromElement(
    <button>
      Button <span style="display: none">Hidden</span>
    </button>
  );

  t.deepEqual(getName(button, device).toJSON(), {
    values: [
      {
        value: {
          type: "some",
          value: "Button"
        },
        branches: null
      }
    ]
  });
});

test("getName() computes the text alternative of a button with a title and no text", t => {
  const button = Element.fromElement(<button title="Hello world" />);

  t.deepEqual(getName(button, device).toJSON(), {
    values: [
      {
        value: {
          type: "some",
          value: "Hello world"
        },
        branches: null
      }
    ]
  });
});

test("getName() computes the text alternative of a button with an aria-label", t => {
  const button = Element.fromElement(
    <button aria-label="Hello world">Button</button>
  );

  t.deepEqual(getName(button, device).toJSON(), {
    values: [
      {
        value: {
          type: "some",
          value: "Hello world"
        },
        branches: null
      }
    ]
  });
});

test("getName() falls through when aria-label is the empty string", t => {
  const button = Element.fromElement(<button aria-label="">Button</button>);

  t.deepEqual(getName(button, device).toJSON(), {
    values: [
      {
        value: {
          type: "some",
          value: "Button"
        },
        branches: null
      }
    ]
  });
});

test("getName() computes the text alternative of a button with an aria-labelledby", t => {
  const div = Element.fromElement(
    <div>
      <button aria-labelledby="h w">Button</button>
      <p id="h">Hello</p>
      <p id="w">world</p>
    </div>
  );

  const button = div
    .children()
    .find(Element.isElement)
    .get();

  t.deepEqual(getName(button, device).toJSON(), {
    values: [
      {
        value: {
          type: "some",
          value: "Hello world"
        },
        branches: null
      }
    ]
  });
});

test("getName() falls through when no text alternative is found in aria-labelledby", t => {
  const button = Element.fromElement(
    <button aria-labelledby="h w">Button</button>
  );

  t.deepEqual(getName(button, device).toJSON(), {
    values: [
      {
        value: {
          type: "some",
          value: "Button"
        },
        branches: null
      }
    ]
  });
});

test("getName() does not infitely recurse when recursive aria-labelledby references are encountered", t => {
  const button = Element.fromElement(
    <button id="button">
      Hello <span aria-labelledby="button">world</span>
    </button>
  );

  t.deepEqual(getName(button, device).toJSON(), {
    values: [
      {
        value: {
          type: "some",
          value: "Hello world"
        },
        branches: null
      }
    ]
  });
});

test("getName() returns none when a button has no text alternative", t => {
  const button = Element.fromElement(<button />);

  t.deepEqual(getName(button, device).toJSON(), {
    values: [
      {
        value: {
          type: "none"
        },
        branches: null
      }
    ]
  });
});

test("getName() computes the text alternative of an image with an alt", t => {
  const img = Element.fromElement(<img src="foo.png" alt="Hello world" />);

  t.deepEqual(getName(img, device).toJSON(), {
    values: [
      {
        value: {
          type: "some",
          value: "Hello world"
        },
        branches: null
      }
    ]
  });
});

test("getName() computes the text alternative of an image with a title", t => {
  const img = Element.fromElement(<img src="foo.png" title="Hello world" />);

  t.deepEqual(getName(img, device).toJSON(), {
    values: [
      {
        value: {
          type: "some",
          value: "Hello world"
        },
        branches: null
      }
    ]
  });
});

test("getName() returns none when an image has no text alternative", t => {
  const img = Element.fromElement(<img src="foo.png" />);

  t.deepEqual(getName(img, device).toJSON(), {
    values: [
      {
        value: {
          type: "none"
        },
        branches: null
      }
    ]
  });
});

test("getName() computes the text alternative of a paragraph with a title", t => {
  const p = Element.fromElement(<p title="Hello world">Paragraph</p>);

  t.deepEqual(getName(p, device).toJSON(), {
    values: [
      {
        value: {
          type: "some",
          value: "Hello world"
        },
        branches: null
      }
    ]
  });
});

test("getName() computes the text alternative of a paragraph with an aria-label", t => {
  const p = Element.fromElement(<p aria-label="Hello world">Paragraph</p>);

  t.deepEqual(getName(p, device).toJSON(), {
    values: [
      {
        value: {
          type: "some",
          value: "Hello world"
        },
        branches: null
      }
    ]
  });
});

test("getName() returns none when a paragraph has no text alternative", t => {
  const p = Element.fromElement(<p>Paragraph</p>);

  t.deepEqual(getName(p, device).toJSON(), {
    values: [
      {
        value: {
          type: "none"
        },
        branches: null
      }
    ]
  });
});

test("getName() computes the text alternative of an anchor with an href", t => {
  const a = Element.fromElement(<a href="http://foo.com">Hello world</a>);

  t.deepEqual(getName(a, device).toJSON(), {
    values: [
      {
        value: {
          type: "some",
          value: "Hello world"
        },
        branches: null
      }
    ]
  });
});

test("getName() computes the text alternative of an anchor without an href", t => {
  const a = Element.fromElement(<a>Hello world</a>);

  t.deepEqual(getName(a, device).toJSON(), {
    values: [
      {
        value: {
          type: "some",
          value: "Hello world"
        },
        branches: null
      }
    ]
  });
});

test("getName() computes the text alternative of a table with a caption", t => {
  const table = Element.fromElement(
    <table>
      <caption>Hello world</caption>
      <tbody>
        <tr>
          <td>Table row</td>
        </tr>
      </tbody>
    </table>
  );

  t.deepEqual(getName(table, device).toJSON(), {
    values: [
      {
        value: {
          type: "some",
          value: "Hello world"
        },
        branches: null
      }
    ]
  });
});

test("getName() computes the text alternative of a figure with a figcaption", t => {
  const figure = Element.fromElement(
    <figure>
      <img src="foo.png" alt="Foo" />
      <figcaption>Hello world</figcaption>
    </figure>
  );

  t.deepEqual(getName(figure, device).toJSON(), {
    values: [
      {
        value: {
          type: "some",
          value: "Hello world"
        },
        branches: null
      }
    ]
  });
});

test("getName() computes the text alternative of a fieldset with a legend", t => {
  const fieldset = Element.fromElement(
    <fieldset>
      <legend>Hello world</legend>
      <input type="submit" />
    </fieldset>
  );

  t.deepEqual(getName(fieldset, device).toJSON(), {
    values: [
      {
        value: {
          type: "some",
          value: "Hello world"
        },
        branches: null
      }
    ]
  });
});

test("getName() computes the text alternative of an input with an explicit label", t => {
  const div = Element.fromElement(
    <div>
      <label for="test">Hello world</label>
      <input type="text" id="test" />
    </div>
  );

  const input = div
    .children()
    .filter(Element.isElement)
    .find(element => element.name === "input")
    .get();

  t.deepEqual(getName(input, device).toJSON(), {
    values: [
      {
        value: {
          type: "some",
          value: "Hello world"
        },
        branches: null
      }
    ]
  });
});

test("getName() computes the text alternative of an input with an implicit label", t => {
  const label = Element.fromElement(
    <label>
      Hello world
      <input type="text" id="test" />
    </label>
  );

  const input = label
    .children()
    .find(Element.isElement)
    .get();

  t.deepEqual(getName(input, device).toJSON(), {
    values: [
      {
        value: {
          type: "some",
          value: "Hello world"
        },
        branches: null
      }
    ]
  });
});

test("getName() computes the text alternative of an input with an explicit label that includes an embedded control", t => {
  const div = Element.fromElement(
    <div>
      <label for="test">
        <textarea>Hello world</textarea>
      </label>
      <input type="text" id="test" />
    </div>
  );

  const input = div
    .children()
    .filter(Element.isElement)
    .find(element => element.name === "input")
    .get();

  t.deepEqual(getName(input, device).toJSON(), {
    values: [
      {
        value: {
          type: "some",
          value: "Hello world"
        },
        branches: null
      }
    ]
  });
});

test("getName() computes the text alternative of an SVG with a title element", t => {
  const svg = Element.fromElement(
    <svg>
      <title>Hello world</title>
      <g>
        <text>Hi there</text>
      </g>
    </svg>
  );

  t.deepEqual(getName(svg, device).toJSON(), {
    values: [
      {
        value: {
          type: "some",
          value: "Hello world"
        },
        branches: null
      }
    ]
  });
});

test("getName() computes the text alternative of an element with content in Shadow DOM", t => {
  const div = Element.fromElement(
    <div>
      <p id="foo">
        <shadow>Hello world</shadow>
      </p>
      <button aria-labelledby="foo" />
    </div>
  );

  const button = div
    .children()
    .filter(Element.isElement)
    .find(element => element.name === "button")
    .get();

  t.deepEqual(getName(button, device).toJSON(), {
    values: [
      {
        value: {
          type: "some",
          value: "Hello world"
        },
        branches: null
      }
    ]
  });
});

test("getName() correctly handles browser specific case sensitivity of roles", t => {
  const button = Element.fromElement(<div role="Button">Button</div>);

  t.deepEqual(getName(button, device).toJSON(), {
    values: [
      {
        value: {
          type: "some",
          value: "Button"
        },
        branches: null
      },
      {
        value: {
          type: "none"
        },
        branches: [
          {
            browser: "firefox",
            version: "68"
          }
        ]
      }
    ]
  });
});

test("getName() correctly handles aria-labelledby that points to aria-hidden=true", t => {
  const button = Element.fromElement(
    <button aria-labelledby="foo">
      <span id="foo" aria-hidden="true">
        Hello world
      </span>
    </button>
  );

  t.deepEqual(getName(button, device).toJSON(), {
    values: [
      {
        value: {
          type: "some",
          value: "Hello world"
        },
        branches: null
      }
    ]
  });
});
