import { jsx } from "@alfa/jsx";
import { test } from "@alfa/test";
import { find } from "@alfa/dom";
import { getTextAlternative } from "../src/get-text-alternative";

test("Computes the text alternative of a button with text", async t => {
  t.is(getTextAlternative(<button>Button</button>), "Button");
});

test("Computes the text alternative of a button with a title and no text", async t => {
  t.is(getTextAlternative(<button title="Hello world" />), "Hello world");
});

test("Computes the text alternative of a button with an aria-label", async t => {
  t.is(
    getTextAlternative(<button aria-label="Hello world">Button</button>),
    "Hello world"
  );
});

test("Computes the text alternative of a button with an aria-labelledby", async t => {
  const button = <button aria-labelledby="h w">Button</button>;

  const document = (
    <div>
      {button}
      <p id="h">Hello</p>
      <p id="w">world</p>
    </div>
  );

  t.is(getTextAlternative(button), "Hello world");
});

test("Returns null when a button has no text alternative", async t => {
  t.is(getTextAlternative(<button />), null);
});

test("Computes the text alternative of an image with an alt", async t => {
  t.is(
    getTextAlternative(<img src="foo.png" alt="Hello world" />),
    "Hello world"
  );
});

test("Computes the text alternative of an image with a title", async t => {
  t.is(
    getTextAlternative(<img src="foo.png" title="Hello world" />),
    "Hello world"
  );
});

test("Returns null when an image has no text alternative", async t => {
  t.is(getTextAlternative(<img src="foo.png" />), null);
});
