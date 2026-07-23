import { test } from "@siteimprove/alfa-test";

import { Performance } from "@siteimprove/alfa-performance";

import { Instrument } from "../src/index.ts";

import { Rule as RuleFixture, usePerformance } from "./fixtures/index.ts";

const rule = RuleFixture.alwaysPass;

test("phase() returns the result of the work", async (t) => {
  const instrument = Instrument.of(rule);

  t.equal(await instrument.phase("total", () => 42), 42);
});

test("phase() awaits and returns asynchronous work", async (t) => {
  const instrument = Instrument.of(rule);

  t.equal(
    await instrument.phase("total", () => Promise.resolve("done")),
    "done",
  );
});

test("phase() runs the work with no marks when no performance is present", async (t) => {
  // With no performance instance there is nothing to observe but the result:
  // the bracket collapses to a plain call.
  const instrument = Instrument.of(rule);

  t.equal(await instrument.phase("total", () => "ok"), "ok");
});

test("phase() brackets the work with a paired start mark and end measure", async (t) => {
  const [perf, entries] = usePerformance();

  const instrument = Instrument.of(rule, perf);

  await instrument.phase("applicability", () => undefined);

  t.equal(entries.length, 2);

  const [start, end] = entries;

  t(Performance.isMark(start));
  t.equal(start.data.type, "start");
  t.equal(start.data.name, "applicability");

  t(Performance.isMeasure(end));
  t.equal(end.data.type, "end");
  t.equal(end.data.name, "applicability");
});

test("phase() emits the end measure even when the work rejects", async (t) => {
  const [perf, entries] = usePerformance();

  const instrument = Instrument.of(rule, perf);

  let thrown = false;
  try {
    await instrument.phase("total", () => {
      throw new Error("boom");
    });
  } catch {
    thrown = true;
  }

  t(thrown);
  t.equal(entries.length, 2);
  t.equal(entries[1].data.type, "end");
});

test("phase() nests, emitting entries from the outside in and the inside out", async (t) => {
  const [perf, entries] = usePerformance();

  const instrument = Instrument.of(rule, perf);

  await instrument.phase("total", () =>
    instrument.phase("applicability", () => undefined),
  );

  t.deepEqual(
    entries.map((entry) => [entry.data.type, entry.data.name]),
    [
      ["start", "total"],
      ["start", "applicability"],
      ["end", "applicability"],
      ["end", "total"],
    ],
  );
});
