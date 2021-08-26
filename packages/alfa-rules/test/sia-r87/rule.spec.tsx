import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { Option } from "@siteimprove/alfa-option";

import R87, { Outcomes } from "../../src/sia-r87/rule";

import { evaluate } from "../common/evaluate";
import { cantTell, passed, failed } from "../common/outcome";
import { oracle } from "../common/oracle";

test(`evaluate() passes a document whose first tabbable link references an
      element with a role of main`, async (t) => {
  const document = h.document([
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

  const document = h.document([
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
  const document = h.document([
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

  const document = h.document([
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
  const document = h.document([
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
  const document = h.document([
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

test(`evaluate() fails a document whose first tabbable element is not a
      link`, async (t) => {
  const document = h.document([
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

test(`evaluate() fails a document whose first tabbable element is not a
      semantic link`, async (t) => {
  const document = h.document([
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
  const document = h.document([
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
  const document = h.document(
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

  t.deepEqual(
    await evaluate(
      R87,
      { document },
      oracle({
        "first-tabbable-is-visible": false,
      })
    ),
    [
      failed(R87, document, {
        1: Outcomes.FirstTabbableIsNotVisible,
      }),
    ]
  );
});

test(`evaluate() fails a document whose first tabbable link is not visible`, async (t) => {
  const document = h.document(
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

  t.deepEqual(
    await evaluate(
      R87,
      { document },
      oracle({
        "first-tabbable-is-visible": true,
      })
    ),
    [
      passed(R87, document, {
        1: Outcomes.FirstTabbableIsLinkToContent,
      }),
    ]
  );
});

test(`evaluate() fails a document whose first tabbable link is not visible`, async (t) => {
  const document = h.document(
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

  t.deepEqual(await evaluate(R87, { document }), [cantTell(R87, document)]);
});

test(`evaluate() passes a document whose first tabbable link is visible when
      focused`, async (t) => {
  const document = h.document(
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

test(`evaluates() passe a document whose first tabbable link references a
      container child at the start of main`, async (t) => {
  const document = h.document([
    <html>
      <a href="#content">Skip to content</a>

      <main>
        <div id="content">
          <p>This is the content</p>
        </div>
      </main>
    </html>,
  ]);

  t.deepEqual(await evaluate(R87, { document }), [
    passed(R87, document, {
      1: Outcomes.FirstTabbableIsLinkToContent,
    }),
  ]);
});

test(`evaluates() passe a document whose first tabbable link references an
      empty child at the start of main`, async (t) => {
  const document = h.document([
    <html>
      <a href="#content">Skip to content</a>

      <main>
        <div id="content" />
        <p>This is the content</p>
      </main>
    </html>,
  ]);

  t.deepEqual(await evaluate(R87, { document }), [
    passed(R87, document, {
      1: Outcomes.FirstTabbableIsLinkToContent,
    }),
  ]);
});

test(`evaluates() passe a document whose first tabbable link references a
      container around main`, async (t) => {
  const document = h.document([
    <html>
      <a href="#content">Skip to content</a>

      <div id="content">
        <main>
          <p>This is the content</p>
        </main>
      </div>
    </html>,
  ]);

  t.deepEqual(await evaluate(R87, { document }), [
    passed(R87, document, {
      1: Outcomes.FirstTabbableIsLinkToContent,
    }),
  ]);
});

test(`evaluates() passe a document whose first tabbable link references an
      empty element before main`, async (t) => {
  const document = h.document([
    <html>
      <a href="#content">Skip to content</a>

      <div id="content" />
      <main>
        <p>This is the content</p>
      </main>
    </html>,
  ]);

  t.deepEqual(await evaluate(R87, { document }), [
    passed(R87, document, {
      1: Outcomes.FirstTabbableIsLinkToContent,
    }),
  ]);
});
