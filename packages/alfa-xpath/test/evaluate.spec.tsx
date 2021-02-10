import { h } from "@siteimprove/alfa-dom/h";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { evaluate } from "../src/evaluate";

test("evaluate() should respect traversal options", (t) => {
  const div = (
    <div>
      <button />
      <iframe>
        {h.document([
          <html>
            <body>
              <button />
            </body>
          </html>,
        ])}
      </iframe>
      <div>
        {h.shadow([<button />, <button />, <slot />])}
        <button />
      </div>
      <button />
    </div>
  );

  t.equal([...evaluate(div, "//button")].length, 3);

  t.equal(
    [
      ...evaluate(div, "//button", {
        nested: true,
      }),
    ].length,
    4
  );

  t.equal(
    [
      ...evaluate(div, "//button", {
        composed: true,
      }),
    ].length,
    5
  );

  t.equal(
    [
      ...evaluate(div, "//button", {
        nested: true,
        composed: true,
      }),
    ].length,
    6
  );
});
