import { test } from "@siteimprove/alfa-test";
import { jsx } from "../jsx";
import { getRootNode } from "../src/get-root-node";
import { Document } from "../src/types";

test("Returns the root node of an element", t => {
  const button = <button />;

  const document: Document = {
    nodeType: 9,
    childNodes: [
      <html>
        <body>{button}</body>
      </html>
    ],
    styleSheets: []
  };

  t.equal(getRootNode(button, document), document);
});

test("Returns the root node of an element in an iframe", t => {
  const button = <button />;

  const iframe = (
    <iframe>
      <content>{button}</content>
    </iframe>
  );

  t.equal(getRootNode(button, iframe), iframe.contentDocument);
});
