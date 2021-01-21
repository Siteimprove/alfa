import { h } from "@siteimprove/alfa-dom/h";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-option";

import R87, { Outcomes } from "../../src/sia-r87/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";
import { oracle } from "../common/oracle";

test(`evaluate() passes a document whose first tabbable link references an
      element with a role of main`, async (t) => {
  const document = Document.of([
    <html>
      <a href="#main">Skip to content</a>
      <main id="main">Content</main>
    </html>,
  ]);

  t.deepEqual(await evaluate(R87, { document }), [
    passed(R87, document, {
      1: Outcomes.FirstTabbableIsLinkToContent,
    }),
  ]);
});

test(`evaluate() passes a document whose first tabbable link references an
      element with a role of main`, async (t) => {
  const main = <main>Content</main>;

  const document = Document.of([
    <html>
      <div tabindex="0" role="link">
        Skip to content
      </div>
      {main}
    </html>,
  ]);

  t.deepEqual(
    await evaluate(
      R87,
      { document },
      oracle({
        "first-tabbable-is-internal-link": true,
        "first-tabbable-reference": Option.of(main),
      })
    ),
    [
      passed(R87, document, {
        1: Outcomes.FirstTabbableIsLinkToContent,
      }),
    ]
  );
});

test(`evaluate() passes a document whose first tabbable link references an
      element that is determined to be the main content`, async (t) => {
  const document = Document.of([
    <html>
      <a href="#main">Skip to content</a>
      <div id="main">Content</div>
    </html>,
  ]);

  t.deepEqual(
    await evaluate(
      R87,
      { document },
      oracle({
        "first-tabbable-reference-is-main": true,
      })
    ),
    [
      passed(R87, document, {
        1: Outcomes.FirstTabbableIsLinkToContent,
      }),
    ]
  );
});

test(`evaluate() passes a document whose first tabbable link references an
      element that is determined to be the main content`, async (t) => {
  const main = <div>Content</div>;

  const document = Document.of([
    <html>
      <div tabindex="0" role="link">
        Skip to content
      </div>
      {main}
    </html>,
  ]);

  t.deepEqual(
    await evaluate(
      R87,
      { document },
      oracle({
        "first-tabbable-is-internal-link": true,
        "first-tabbable-reference": Option.of(main),
        "first-tabbable-reference-is-main": true,
      })
    ),
    [
      passed(R87, document, {
        1: Outcomes.FirstTabbableIsLinkToContent,
      }),
    ]
  );
});

test(`evaluate() fails a document without tabbable elements`, async (t) => {
  const document = Document.of([
    <html>
      <main id="main">Content</main>
    </html>,
  ]);

  t.deepEqual(await evaluate(R87, { document }), [
    failed(R87, document, {
      1: Outcomes.HasNoTabbable,
    }),
  ]);
});

test(`evaluate() fails a document with a link that would be tabbable if not
      hidden`, async (t) => {
  const document = Document.of([
    <html>
      <a href="#main" hidden>
        Skip to content
      </a>
      <main id="main">Content</main>
    </html>,
  ]);

  t.deepEqual(await evaluate(R87, { document }), [
    failed(R87, document, {
      1: Outcomes.HasNoTabbable,
    }),
  ]);
});

test(`evaluate() fails a document whose first tabbable element is not a link`, async (t) => {
  const document = Document.of([
    <html>
      <button />
      <a href="#main">Skip to content</a>
      <main id="main">Content</main>
    </html>,
  ]);

  t.deepEqual(await evaluate(R87, { document }), [
    failed(R87, document, {
      1: Outcomes.FirstTabbableIsNotLink,
    }),
  ]);
});

test(`evaluate() fails a document whose first tabbable element is not a semantic link`, async (t) => {
  const document = Document.of([
    <html>
      <a href="#main" role="button">
        Skip to content
      </a>
      <main id="main">Content</main>
    </html>,
  ]);

  t.deepEqual(await evaluate(R87, { document }), [
    failed(R87, document, {
      1: Outcomes.FirstTabbableIsNotLink,
    }),
  ]);
});

test(`evaluate() fails a document whose first tabbable link is not included in
      the accessibility tree`, async (t) => {
  const document = Document.of([
    <html>
      <a href="#main" aria-hidden="true">
        Skip to content
      </a>
      <main id="main">Content</main>
    </html>,
  ]);

  t.deepEqual(await evaluate(R87, { document }), [
    failed(R87, document, {
      1: Outcomes.FirstTabbableIsIgnored,
    }),
  ]);
});

test(`evaluate() fails a document whose first tabbable link is not visible`, async (t) => {
  const document = Document.of(
    [
      <html>
        <a href="#main">Skip to content</a>
        <main id="main">Content</main>
      </html>,
    ],
    [
      h.sheet([
        h.rule.style("a", {
          opacity: "0",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R87, { document }), [
    failed(R87, document, {
      1: Outcomes.FirstTabbableIsNotKeyboardActionable,
    }),
  ]);
});

test(`evaluate() passes a document whose first tabbable link is visible when
      focused`, async (t) => {
  const document = Document.of(
    [
      <html>
        <a href="#main">Skip to content</a>
        <main id="main">Content</main>
      </html>,
    ],
    [
      h.sheet([
        h.rule.style("a", {
          opacity: "0",
        }),

        h.rule.style("a:focus", {
          opacity: "1",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R87, { document }), [
    passed(R87, document, {
      1: Outcomes.FirstTabbableIsLinkToContent,
    }),
  ]);
});
