import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { resolveReferences } from "../src/resolve-references";

test("Can resolve references", t => {
  const button = <button id="bar">Foo</button>;
  const html = <html>{button}</html>;
  t.deepEqual([button], resolveReferences(html, html, "bar"));
});
