import { test } from "@siteimprove/alfa-test";
import { jsx } from "../jsx";
import { getRootNode } from "../src/get-root-node";
import { Document } from "../src/types";

test("Returns root node", t => {
  const button = <button />;
  const body = <body>{button}</body>;
  const html = <html>{body}</html>;
  const document: Document = {
    nodeType: 9,
    childNodes: [html],
    styleSheets: []
  };
  t.equal(getRootNode(button, document), document);
});
