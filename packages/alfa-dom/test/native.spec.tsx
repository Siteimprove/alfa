import { test } from "@siteimprove/alfa-test";
import { JSDOM } from "jsdom";

import { h, Node } from "../src";
import { Native } from "../src/native";

/**
 * Note: all tests loop Native.fromNode through Node.from and .toJSON()
 * This effectively removes the box that is added by Native.fromNode.
 * Since we run in JSDOM, the document is not rendered and the box is always
 * { x:0, y:0, width:0, height:0 }.
 */

test("Native.fromNode builds a simple document", (t) => {
  const document = new JSDOM("<div id='hello' class='foo'>hello</div>").window
    .document;

  t.deepEqual(
    Node.from(Native.fromNode(document!)).toJSON(),
    h
      .document([
        <html>
          <head></head>
          <body>
            <div id="hello" class="foo">
              hello
            </div>
          </body>
        </html>,
      ])
      .toJSON(),
  );
});

test("Native.fromNode builds a document with element's style", (t) => {
  const document = new JSDOM("<div style='color: red'>hello</div>").window
    .document;

  t.deepEqual(
    Node.from(Native.fromNode(document!)).toJSON(),
    h
      .document([
        <html>
          <head></head>
          <body>
            <div style={{ color: "red" }}>hello</div>
          </body>
        </html>,
      ])
      .toJSON(),
  );
});

test("Native.fromNode builds a document with global style", (t) => {
  const document = new JSDOM(
    "<head><style>div {color: red}</style></head><body><div>hello</div></body>",
    {},
  ).window.document;

  t.deepEqual(
    Node.from(Native.fromNode(document!)).toJSON(),
    h
      .document(
        [
          <html>
            <head>
              <style>{"div {color: red}"}</style>
            </head>
            <body>
              <div>hello</div>
            </body>
          </html>,
        ],
        [h.sheet([h.rule.style("div", { color: "red" })])],
      )
      .toJSON(),
  );
});
