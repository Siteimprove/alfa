import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { used } from "../common.js";

test(".used() returns the computed value for a block container", (t) => {
  for (const value of [
    "auto",
    "clip",
    "hidden",
    "scroll",
    "visible",
  ] as const) {
    const target = <div style={{ overflow: value }}></div>;
    h.document([target]);

    for (const direction of ["x", "y"] as const) {
      t.deepEqual(used(target, `overflow-${direction}`), {
        value: {
          type: "some",
          value: { type: "keyword", value },
        },
        source: { name: `overflow`, value, important: false },
      });
    }
  }
});

test(".used() returns the computed value for a flex container", (t) => {
  for (const value of [
    "auto",
    "clip",
    "hidden",
    "scroll",
    "visible",
  ] as const) {
    for (const display of ["flex", "inline-flex", "block flex"]) {
      const target = <div style={{ overflow: value, display }}></div>;
      h.document([target]);

      for (const direction of ["x", "y"] as const) {
        t.deepEqual(used(target, `overflow-${direction}`), {
          value: {
            type: "some",

            value: { type: "keyword", value },
          },
          source: { name: `overflow`, value, important: false },
        });
      }
    }
  }
});

test(".used() returns the computed value for a grid container", (t) => {
  for (const value of [
    "auto",
    "clip",
    "hidden",
    "scroll",
    "visible",
  ] as const) {
    for (const display of ["grid", "inline-grid", "block grid"]) {
      const target = <div style={{ overflow: value, display }}></div>;
      h.document([target]);

      for (const direction of ["x", "y"] as const) {
        t.deepEqual(used(target, `overflow-${direction}`), {
          value: {
            type: "some",
            value: { type: "keyword", value },
          },
          source: { name: `overflow`, value, important: false },
        });
      }
    }
  }
});

test(".used() returns None for others element", (t) => {
  for (const value of [
    "auto",
    "clip",
    "hidden",
    "scroll",
    "visible",
  ] as const) {
    const target = <span style={{ overflow: value }}></span>;
    h.document([target]);

    t.deepEqual(used(target, "overflow-x"), {
      value: { type: "none" },
      source: { name: "overflow", value, important: false },
    });
    t.deepEqual(used(target, "overflow-y"), {
      value: { type: "none" },
      source: { name: "overflow", value, important: false },
    });
  }
});
