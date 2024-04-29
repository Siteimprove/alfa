import { test } from "@siteimprove/alfa-test";
import { JSDOM } from "jsdom";

import { type Document, h, Node } from "../src";
import { Native } from "../src/native";

/**
 * Note: This test suite uses JSDOM parser to easily build native documents.
 * We could instead manually build the documents as needed. It would be more
 * complete as it could escape the quirks of JSDOM, but it would be more
 * work to write and maintain.
 *
 * Full integration tests should be written in the browser automation packages
 * of the `alfa-integrations` repository.
 */

/**
 * Note: JSDOM only has partial support for part of CSS, this seems to be
 * due to using an unmaintained library CSSOM 🙈
 * Therefore, it is not possible to test @layer rules and probably some others.
 */

/**
 * Note: all tests loop Native.fromNode through Node.from and .toJSON()
 * This effectively removes the box that is added by Native.fromNode.
 * Since we run in JSDOM, the document is not rendered and the box is always
 * { x:0, y:0, width:0, height:0 }.
 */

async function makeJSON(
  html: string,
  options?: Native.Options,
): Promise<Document.JSON> {
  const { document } = new JSDOM(html).window;

  return Node.from(await Native.fromNode(document!, options)).toJSON();
}

test("Native.fromNode() builds a simple document", async (t) => {
  const actual = await makeJSON("<div id='hello' class='foo'>Hello</div>");

  t.deepEqual(
    actual,
    h
      .document([
        <html>
          <head></head>
          <body>
            <div id="hello" class="foo">
              Hello
            </div>
          </body>
        </html>,
      ])
      .toJSON(),
  );
});

test("Native.fromNode() builds a document with element's style", async (t) => {
  const actual = await makeJSON("<div style='color: red'>Hello</div>");

  t.deepEqual(
    actual,
    h
      .document([
        <html>
          <head></head>
          <body>
            <div style={{ color: "red" }}>Hello</div>
          </body>
        </html>,
      ])
      .toJSON(),
  );
});

test("Native.fromNode() builds a document with global style", async (t) => {
  const actual = await makeJSON(
    "<head><style>div {color: red}</style></head><body><div>Hello</div></body>",
  );

  t.deepEqual(
    actual,
    h
      .document(
        [
          <html>
            <head>
              <style>{"div {color: red}"}</style>
            </head>
            <body>
              <div>Hello</div>
            </body>
          </html>,
        ],
        [h.sheet([h.rule.style("div", { color: "red" })])],
      )
      .toJSON(),
  );
});

test("Native.fromNode() does not change <link> by default", async (t) => {
  const actual = await makeJSON(
    "<head><link rel='stylesheet' href='foo.css' /></head><body>Hello</body>",
  );

  t.deepEqual(
    actual,
    h
      .document([
        <html>
          <head>
            <link rel="stylesheet" href="foo.css" />
          </head>
          <body>Hello</body>
        </html>,
      ])
      .toJSON(),
  );
});

test("Native.fromNode() adds crossorigin to <link> without one, when asked", async (t) => {
  // We can hardly test the replacement on a stylesheet link, because
  // Native.fromNode awaits the stylesheet to be loaded, which is not easy
  // in this setup.
  const actual = await makeJSON(
    "<head><link rel='icon' href='foo.png' /><link rel='stylesheet' href='bar.css' crossorigin='use-credentials'/></head><body>Hello</body>",
    { withCrossOrigin: true },
  );

  t.deepEqual(
    actual,
    h
      .document([
        <html>
          <head>
            <link rel="icon" href="foo.png" crossorigin="anonymous" />
            <link
              rel="stylesheet"
              href="bar.css"
              crossorigin="use-credentials"
            />
          </head>
          <body>Hello</body>
        </html>,
      ])
      .toJSON(),
  );
});

test("Native.fromNode() handles variables in shorthands", async (t) => {
  const actual = await makeJSON(
    "<head><style>div { --red: #FF0000; background: var(--red); }</style></head><body><div>Hello</div></body>",
  );

  t.deepEqual(
    actual,
    h
      .document(
        [
          <html>
            <head>
              <style>{"div { --red: #FF0000; background: var(--red); }"}</style>
            </head>
            <body>
              <div>Hello</div>
            </body>
          </html>,
        ],
        [
          h.sheet([
            h.rule.style("div", {
              "--red": "#FF0000",
              background: "var(--red)",
            }),
          ]),
        ],
      )
      .toJSON(),
  );
});
