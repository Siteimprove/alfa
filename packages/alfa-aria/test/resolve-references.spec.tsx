import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";
import { resolveReferences } from "../src/resolve-references";

test("Can resolve references", t => {
  const button = <button id="bar">Foo</button>;
  const html = <html>{button}</html>;
  t.deepEqual(resolveReferences(html, html, "bar"), [button]);
});
