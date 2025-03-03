import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { cascaded } from "../common.js";

test("#cascaded() parses `white-space: collapse`", (t) => {
  const element = <div style={{ ws: "collapse" }} />;

  t.deepEqual(cascaded(element, "white-space-collapse"), {
    value: {
      type: "keyword",
      value: "collapse",
    },
    source: h.declaration("ws", "collapse").toJSON(),
  });

  t.deepEqual(cascaded(element, "text-wrap-mode"), {
    value: {
      type: "keyword",
      value: "initial",
    },
    source: h.declaration("ws", "collapse").toJSON(),
  });

  t.deepEqual(cascaded(element, "white-space-trim"), {
    value: {
      type: "keyword",
      value: "initial",
    },
    source: h.declaration("ws", "collapse").toJSON(),
  });
});

test("#cascaded() parses `white-space: wrap`", (t) => {
  const element = <div style={{ ws: "wrap" }} />;

  t.deepEqual(cascaded(element, "white-space-collapse"), {
    value: {
      type: "keyword",
      value: "initial",
    },
    source: h.declaration("ws", "wrap").toJSON(),
  });

  t.deepEqual(cascaded(element, "text-wrap-mode"), {
    value: {
      type: "keyword",
      value: "wrap",
    },
    source: h.declaration("ws", "wrap").toJSON(),
  });

  t.deepEqual(cascaded(element, "white-space-trim"), {
    value: {
      type: "keyword",
      value: "initial",
    },
    source: h.declaration("ws", "wrap").toJSON(),
  });
});

test("#cascaded() parses `white-space: wrap discard-after discard-before collapse`", (t) => {
  const element = (
    <div style={{ ws: "wrap discard-after discard-before collapse" }} />
  );

  t.deepEqual(cascaded(element, "white-space-collapse"), {
    value: {
      type: "keyword",
      value: "collapse",
    },
    source: h
      .declaration("ws", "wrap discard-after discard-before collapse")
      .toJSON(),
  });

  t.deepEqual(cascaded(element, "text-wrap-mode"), {
    value: {
      type: "keyword",
      value: "wrap",
    },
    source: h
      .declaration("ws", "wrap discard-after discard-before collapse")
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
      .declaration("ws", "wrap discard-after discard-before collapse")
      .toJSON(),
  });
});

test("#cascaded() parses `white-space: pre`", (t) => {
  const element = <div style={{ ws: "pre" }} />;

  t.deepEqual(cascaded(element, "white-space-collapse"), {
    value: {
      type: "keyword",
      value: "preserve",
    },
    source: h.declaration("ws", "pre").toJSON(),
  });

  t.deepEqual(cascaded(element, "text-wrap-mode"), {
    value: {
      type: "keyword",
      value: "nowrap",
    },
    source: h.declaration("ws", "pre").toJSON(),
  });

  t.deepEqual(cascaded(element, "white-space-trim"), {
    value: {
      type: "keyword",
      value: "none",
    },
    source: h.declaration("ws", "pre").toJSON(),
  });
});

test("white-space overwrites text-mode", (t) => {
  const element = <div style={{ textWrap: "wrap", ws: "nowrap" }} />;

  t.deepEqual(cascaded(element, "text-wrap-mode"), {
    value: {
      type: "keyword",
      value: "nowrap",
    },
    source: h.declaration("ws", "nowrap").toJSON(),
  });
});

test("text-mode overwrite white-space", (t) => {
  const element = <div style={{ ws: "nowrap", textWrap: "wrap" }} />;

  t.deepEqual(cascaded(element, "text-wrap-mode"), {
    value: {
      type: "keyword",
      value: "wrap",
    },
    source: h.declaration("text-wrap", "wrap").toJSON(),
  });
});
