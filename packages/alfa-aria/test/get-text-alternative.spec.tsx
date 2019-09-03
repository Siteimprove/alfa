import { BrowserSpecific, withBrowsers } from "@siteimprove/alfa-compatibility";
import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";
import { getTextAlternative } from "../src/get-text-alternative";

const device = getDefaultDevice();

test("Computes the text alternative of a button with text", t => {
  const button = <button>Button</button>;
  t.equal(getTextAlternative(button, button, device), "Button");
});

test("Correctly resolves explicit roles", t => {
  const button = <div role="button">Button</div>;
  t.equal(getTextAlternative(button, button, device), "Button");
});

test("Computes the text alternative of a button with text within a span", t => {
  const button = (
    <button>
      <span>Button</span>
    </button>
  );
  t.equal(getTextAlternative(button, button, device), "Button");
});

test("Ignores non-visible nodes", t => {
  const button = (
    <button>
      Button <span style="display: none">Hidden</span>
    </button>
  );
  t.equal(getTextAlternative(button, button, device), "Button");
});

test("Computes the text alternative of a button with a title and no text", t => {
  const button = <button title="Hello world" />;
  t.equal(getTextAlternative(button, button, device), "Hello world");
});

test("Computes the text alternative of a button with an aria-label", t => {
  const button = <button aria-label="Hello world">Button</button>;
  t.equal(getTextAlternative(button, button, device), "Hello world");
});

test("Falls through when aria-label is the empty string", t => {
  const button = <button aria-label="">Button</button>;
  t.equal(getTextAlternative(button, button, device), "Button");
});

test("Computes the text alternative of a button with an aria-labelledby", t => {
  const button = <button aria-labelledby="h w">Button</button>;
  const document = (
    <div>
      {button}
      <p id="h">Hello</p>
      <p id="w">world</p>
    </div>
  );
  t.equal(getTextAlternative(button, document, device), "Hello world");
});

test("Falls through when no text alternative is found in aria-labelledby", t => {
  const button = <button aria-labelledby="h w">Button</button>;
  t.equal(getTextAlternative(button, <div>{button}</div>, device), "Button");
});

test("Does not infitely recurse when recursive aria-labelledby references are encountered", t => {
  const button = (
    <button id="button">
      Hello <span aria-labelledby="button">world</span>
    </button>
  );
  t.equal(getTextAlternative(button, button, device), "Hello world");
});

test("Returns null when a button has no text alternative", t => {
  const button = <button />;
  t.equal(getTextAlternative(button, button, device), null);
});

test("Computes the text alternative of an image with an alt", t => {
  const img = <img src="foo.png" alt="Hello world" />;
  t.equal(getTextAlternative(img, img, device), "Hello world");
});

test("Computes the text alternative of an image with a title", t => {
  const img = <img src="foo.png" title="Hello world" />;
  t.equal(getTextAlternative(img, img, device), "Hello world");
});

test("Returns null when an image has no text alternative", t => {
  const img = <img src="foo.png" />;
  t.equal(getTextAlternative(img, img, device), null);
});

test("Computes the text alternative of a paragraph with a title", t => {
  const p = <p title="Hello world">Paragraph</p>;
  t.equal(getTextAlternative(p, p, device), "Hello world");
});

test("Computes the text alternative of a paragraph with an aria-label", t => {
  const p = <p aria-label="Hello world">Paragraph</p>;
  t.equal(getTextAlternative(p, p, device), "Hello world");
});

test("Returns null when a paragraph has no text alternative", t => {
  const p = <p>Paragraph</p>;
  t.equal(getTextAlternative(p, p, device), null);
});

test("Computes the text alternative of an anchor with an href", t => {
  const a = <a href="http://foo.com">Anchor</a>;
  t.equal(getTextAlternative(a, a, device), "Anchor");
});

test("Computes the text alternative of an anchor without an href", t => {
  const a = <a>Anchor</a>;
  t.equal(getTextAlternative(a, a, device), "Anchor");
});

test('Computes the text alternative of an input of type "submit" with a value', t => {
  const input = <input type="submit" value="Input" />;
  t.equal(getTextAlternative(input, input, device), "Input");
});

test('Computes the text alternative of an input of type "submit" without a value', t => {
  const input = <input type="submit" />;
  t.equal(getTextAlternative(input, input, device), "Submit");
});

test('Computes the text alternative of an input of type "reset" with a value', t => {
  const input = <input type="reset" value="Input" />;
  t.equal(getTextAlternative(input, input, device), "Input");
});

test('Computes the text alternative of an input of type "reset" without a value', t => {
  const input = <input type="reset" />;
  t.equal(getTextAlternative(input, input, device), "Reset");
});

test('Computes the text alternative of an input of type "button" with a value', t => {
  const input = <input type="button" value="Input" />;
  t.equal(getTextAlternative(input, input, device), "Input");
});

test('Computes the text alternative of an input of type "button" with a title', t => {
  const input = <input type="button" title="Input" />;
  t.equal(getTextAlternative(input, input, device), "Input");
});

test('Computes the text alternative of an input of type "image" with an alt', t => {
  const input = <input type="image" alt="Input" />;
  t.equal(getTextAlternative(input, input, device), "Input");
});

test('Computes the text alternative of an input of type "image" with a value', t => {
  const input = <input type="image" value="Input" />;
  t.equal(getTextAlternative(input, input, device), "Input");
});

test('Computes the text alternative of an input of type "image" with a title', t => {
  const input = <input type="image" title="Input" />;
  t.equal(getTextAlternative(input, input, device), "Input");
});

test("Computes the text alternative of a table with a caption", t => {
  const table = (
    <table>
      <caption>Hello world</caption>
      <tbody>
        <tr>
          <td>Table row</td>
        </tr>
      </tbody>
    </table>
  );
  t.equal(getTextAlternative(table, table, device), "Hello world");
});

test("Computes the text alternative of a figure with a figcaption", t => {
  const figure = (
    <figure>
      <img src="foo.png" alt="Foo" />
      <figcaption>Hello world</figcaption>
    </figure>
  );
  t.equal(getTextAlternative(figure, figure, device), "Hello world");
});

test("Computes the text alternative of a fieldset with a legend", t => {
  const fieldset = (
    <fieldset>
      <legend>Hello world</legend>
      <input type="submit" />
    </fieldset>
  );
  t.equal(getTextAlternative(fieldset, fieldset, device), "Hello world");
});

test("Computes the text alternative of an input with an explicit label", t => {
  const input = <input type="text" id="test" />;
  const document = (
    <div>
      <label for="test">Hello world</label>
      {input}
    </div>
  );
  t.equal(getTextAlternative(input, document, device), "Hello world");
});

test("Computes the text alternative of an input with an implicit label", t => {
  const input = <input type="text" id="test" />;
  const document = (
    <label>
      Hello world
      {input}
    </label>
  );
  t.equal(getTextAlternative(input, document, device), "Hello world");
});

test("Computes the text alternative of an input with an explicit label that includes an embedded control", t => {
  const input = <input type="text" id="test" />;
  const document = (
    <div>
      <label for="test">
        <textarea>Hello world</textarea>
      </label>
      {input}
    </div>
  );
  t.equal(getTextAlternative(input, document, device), "Hello world");
});

test("Computes the text alternative of an SVG with a title element", t => {
  const svg = (
    <svg>
      <title>Hello world</title>
      <g>
        <text>Hi there</text>
      </g>
    </svg>
  );
  t.equal(getTextAlternative(svg, svg, device), "Hello world");
});

test("Computes the text alternative of an element with content in Shadow DOM", t => {
  const button = <button aria-labelledby="foo" />;
  const document = (
    <div>
      <p id="foo">
        <shadow>Hello world</shadow>
      </p>
      {button}
    </div>
  );
  t.equal(getTextAlternative(button, document, device), "Hello world");
});

test("Correctly handles browser specific case sensitivity of roles", t => {
  const button = <div role="Button">Button</div>;
  withBrowsers(["chrome", "firefox"], () => {
    t.deepEqual(
      getTextAlternative(button, button, device),
      BrowserSpecific.of<string | null>(null, ["firefox"]).branch("Button", [
        "chrome",
        "edge",
        "ie",
        "opera",
        "safari"
      ])
    );
  });
});

test("Correctly handles aria-labelledby that points to aria-hidden=true", t => {
  const button = (
    <button aria-labelledby="foo">
      <span id="foo" aria-hidden="true">
        Hello world
      </span>
    </button>
  );
  t.equal(getTextAlternative(button, button, device), "Hello world");
});
