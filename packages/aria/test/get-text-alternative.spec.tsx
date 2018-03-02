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

test("Falls through when aria-label is the empty string", async t => {
  t.is(getTextAlternative(<button aria-label="">Button</button>), "Button");
});

test("Falls through when aria-label is a boolean attribute", async t => {
  t.is(getTextAlternative(<button aria-label>Button</button>), "Button");
});

test("Computes the text alternative of a button with an aria-labelledby", async t => {
  const document = (
    <div>
      <button aria-labelledby="h w">Button</button>;
      <p id="h">Hello</p>
      <p id="w">world</p>
    </div>
  );

  const button = find(document, "button");

  if (button) {
    t.is(getTextAlternative(button), "Hello world");
  } else {
    t.fail();
  }
});

test("Falls through when no text alternative is found in aria-labelledby", async t => {
  const document = (
    <div>
      <button aria-labelledby="h w">Button</button>
    </div>
  );

  const button = find(document, "button");

  if (button) {
    t.is(getTextAlternative(button), "Button");
  } else {
    t.fail();
  }
});

test("Does not infitely recurse when recursive aria-labelledby references are encountered", async t => {
  t.is(
    getTextAlternative(
      <button id="button">
        Hello <span aria-labelledby="button">world</span>
      </button>
    ),
    "Hello"
  );
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

test("Computes the text alternative of a paragraph with a title", async t => {
  t.is(getTextAlternative(<p title="Hello world">Paragraph</p>), "Hello world");
});

test("Computes the text alternative of a paragraph with an aria-label", async t => {
  t.is(
    getTextAlternative(<p aria-label="Hello world">Paragraph</p>),
    "Hello world"
  );
});

test("Returns null when a paragraph has no text alternative", async t => {
  t.is(getTextAlternative(<p>Paragraph</p>), null);
});

test("Computes the text alternative of an anchor", async t => {
  t.is(getTextAlternative(<a href="http://foo.com">Anchor</a>), "Anchor");
});

test(
  "Returns null when an anchor has no href",
  { skip: "Need to locate the spec where this behaviour is defined" },
  async t => {
    t.is(getTextAlternative(<a>Anchor</a>), null);
  }
);
