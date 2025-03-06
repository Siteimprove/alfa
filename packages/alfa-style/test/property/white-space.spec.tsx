import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { cascaded } from "../common.js";

test("#cascaded() parses `white-space: collapse`", (t) => {
  const element = <div style={{ whiteSpace: "collapse" }} />;

  t.deepEqual(cascaded(element, "white-space-collapse"), {
    value: {
      type: "keyword",
      value: "collapse",
    },
    source: h.declaration("white-space", "collapse").toJSON(),
  });

  t.deepEqual(cascaded(element, "text-wrap-mode"), {
    value: {
      type: "keyword",
      value: "initial",
    },
    source: h.declaration("white-space", "collapse").toJSON(),
  });

  t.deepEqual(cascaded(element, "white-space-trim"), {
    value: {
      type: "keyword",
      value: "initial",
    },
    source: h.declaration("white-space", "collapse").toJSON(),
  });
});

test("#cascaded() parses `white-space: wrap`", (t) => {
  const element = <div style={{ whiteSpace: "wrap" }} />;

  t.deepEqual(cascaded(element, "white-space-collapse"), {
    value: {
      type: "keyword",
      value: "initial",
    },
    source: h.declaration("white-space", "wrap").toJSON(),
  });

  t.deepEqual(cascaded(element, "text-wrap-mode"), {
    value: {
      type: "keyword",
      value: "wrap",
    },
    source: h.declaration("white-space", "wrap").toJSON(),
  });

  t.deepEqual(cascaded(element, "white-space-trim"), {
    value: {
      type: "keyword",
      value: "initial",
    },
    source: h.declaration("white-space", "wrap").toJSON(),
  });
});

test("#cascaded() parses `white-space: wrap discard-after discard-before collapse`", (t) => {
  const element = (
    <div style={{ whiteSpace: "wrap discard-after discard-before collapse" }} />
  );

  t.deepEqual(cascaded(element, "white-space-collapse"), {
    value: {
      type: "keyword",
      value: "collapse",
    },
    source: h
      .declaration("white-space", "wrap discard-after discard-before collapse")
      .toJSON(),
  });

  t.deepEqual(cascaded(element, "text-wrap-mode"), {
    value: {
      type: "keyword",
      value: "wrap",
    },
    source: h
      .declaration("white-space", "wrap discard-after discard-before collapse")
      .toJSON(),
  });

  t.deepEqual(cascaded(element, "white-space-trim"), {
    value: {
      type: "trim-flags",
      "discard-before": true,
      "discard-after": true,
      "discard-inner": false,
    },
    source: h
      .declaration("white-space", "wrap discard-after discard-before collapse")
      .toJSON(),
  });
});

test("#cascaded() parses `white-space: pre`", (t) => {
  const element = <div style={{ whiteSpace: "pre" }} />;

  t.deepEqual(cascaded(element, "white-space-collapse"), {
    value: {
      type: "keyword",
      value: "preserve",
    },
    source: h.declaration("white-space", "pre").toJSON(),
  });

  t.deepEqual(cascaded(element, "text-wrap-mode"), {
    value: {
      type: "keyword",
      value: "nowrap",
    },
    source: h.declaration("white-space", "pre").toJSON(),
  });

  t.deepEqual(cascaded(element, "white-space-trim"), {
    value: {
      type: "keyword",
      value: "none",
    },
    source: h.declaration("white-space", "pre").toJSON(),
  });
});

test("white-space overwrites text-wrap", (t) => {
  const element = <div style={{ textWrap: "wrap", whiteSpace: "nowrap" }} />;

  t.deepEqual(cascaded(element, "text-wrap-mode"), {
    value: {
      type: "keyword",
      value: "nowrap",
    },
    source: h.declaration("white-space", "nowrap").toJSON(),
  });
});

test("text-wrap overwrite white-space", (t) => {
  const element = <div style={{ whiteSpace: "nowrap", textWrap: "wrap" }} />;

  t.deepEqual(cascaded(element, "text-wrap-mode"), {
    value: {
      type: "keyword",
      value: "wrap",
    },
    source: h.declaration("text-wrap", "wrap").toJSON(),
  });
});
