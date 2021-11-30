import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { None, Option } from "@siteimprove/alfa-option";

import ER87, { Outcomes } from "../../src/sia-er87/rule";

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

  t.deepEqual(await evaluate(ER87, { document }), [
    passed(ER87, document, {
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
      ER87,
      { document },
      oracle({
        "first-tabbable-reference": Option.of(main),
      })
    ),
    [
      passed(ER87, document, {
        1: Outcomes.FirstTabbableIsLinkToContent,
      }),
    ]
  );
});

test(`evaluate() fails a document whose first tabbable link does not
      reference an element`, async (t) => {
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
      ER87,
      { document },
      oracle({
        "first-tabbable-reference": None,
      })
    ),
    [
      failed(ER87, document, {
        1: Outcomes.FirstTabbableIsNotInternalLink,
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
      ER87,
      { document },
      oracle({
        "is-start-of-main": true,
      })
    ),
    [
      passed(ER87, document, {
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
      ER87,
      { document },
      oracle({
        "first-tabbable-reference": Option.of(main),
        "is-start-of-main": true,
      })
    ),
    [
      passed(ER87, document, {
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

  t.deepEqual(await evaluate(ER87, { document }), [
    failed(ER87, document, {
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

  t.deepEqual(await evaluate(ER87, { document }), [
    failed(ER87, document, {
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

  t.deepEqual(await evaluate(ER87, { document }), [
    failed(ER87, document, {
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

  t.deepEqual(await evaluate(ER87, { document }), [
    failed(ER87, document, {
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

  t.deepEqual(await evaluate(ER87, { document }), [
    failed(ER87, document, {
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
      ER87,
      { document },
      oracle({
        "is-visible-when-focused": false,
      })
    ),
    [
      failed(ER87, document, {
        1: Outcomes.FirstTabbableIsNotVisible,
      }),
    ]
  );
});

test(`evaluate() passes a document whose first tabbable link is visible`, async (t) => {
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
      ER87,
      { document },
      oracle({
        "is-visible-when-focused": true,
      })
    ),
    [
      passed(ER87, document, {
        1: Outcomes.FirstTabbableIsLinkToContent,
      }),
    ]
  );
});

test(`evaluate() can´t tell if the first tabbable link of a document is not visible`, async (t) => {
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

  t.deepEqual(await evaluate(ER87, { document }), [cantTell(ER87, document)]);
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

  t.deepEqual(await evaluate(ER87, { document }), [
    passed(ER87, document, {
      1: Outcomes.FirstTabbableIsLinkToContent,
    }),
  ]);
});

test(`evaluates() passes a document whose first tabbable link references a
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

  t.deepEqual(await evaluate(ER87, { document }), [
    passed(ER87, document, {
      1: Outcomes.FirstTabbableIsLinkToContent,
    }),
  ]);
});

test(`evaluates() passes a document whose first tabbable link references an
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

  t.deepEqual(await evaluate(ER87, { document }), [
    passed(ER87, document, {
      1: Outcomes.FirstTabbableIsLinkToContent,
    }),
  ]);
});

test(`evaluates() passes a document whose first tabbable link references a
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

  t.deepEqual(await evaluate(ER87, { document }), [
    passed(ER87, document, {
      1: Outcomes.FirstTabbableIsLinkToContent,
    }),
  ]);
});

test(`evaluates() passes a document whose first tabbable link references an
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

  t.deepEqual(await evaluate(ER87, { document }), [
    passed(ER87, document, {
      1: Outcomes.FirstTabbableIsLinkToContent,
    }),
  ]);
});
