import { Array } from "@siteimprove/alfa-array";
import type { Assertions } from "@siteimprove/alfa-test";
import { Performance } from "@siteimprove/alfa-performance";

import { Rule } from "../../src/index.ts";

import type { Event, TRule } from "./types.ts";

export function usePerformance(): [
  performance: Performance<Event>,
  entries: Array<Performance.Entry<Event>>,
] {
  const perf = Performance.of<Event>();
  const entries: Array<Performance.Entry<Event>> = [];
  perf.on((entry) => entries.push(entry));

  return [perf, entries];
}

function checkMark(
  entry: Performance.Mark<Event>,
  expected: Performance.Mark<Event>,
  t: Assertions,
) {
  t.deepEqual(entry.data.toJSON(), expected.data.toJSON());
  t(entry.start > 0);
}

function checkMeasure(
  entry: Performance.Measure<Event>,
  expected: Performance.Measure<Event>,
  t: Assertions,
) {
  t.deepEqual(entry.data.toJSON(), expected.data.toJSON());
  t(entry.start > 0);
  t(entry.duration > 0);
}

function checkEntry(
  entry: Performance.Entry<Event>,
  expected: Performance.Entry<Event>,
  t: Assertions,
) {
  t.equal(Performance.isMark(entry), Performance.isMark(expected));

  if (Performance.isMark(entry)) {
    checkMark(entry, expected as Performance.Mark<Event>, t);
  }

  if (Performance.isMeasure(entry)) {
    checkMeasure(entry, expected as Performance.Measure<Event>, t);
  }
}

export function checkEntries(
  entries: Array<Performance.Entry<Event>>,
  expected: Array<Performance.Entry<Event>>,
  t: Assertions,
) {
  Array.zip(entries, expected).forEach(([entry, expected]) => {
    checkEntry(entry, expected, t);
  });
}

export function mark(
  rule: TRule,
  type: "start" | "end",
  name: "applicability" | "expectation" | "total",
): Performance.Mark<Event> {
  return Performance.Mark.of(Rule.Event.of(type, rule, name), NaN);
}

export function measure(
  rule: TRule,
  type: "start" | "end",
  name: "applicability" | "expectation" | "total",
): Performance.Measure<Event> {
  return Performance.Measure.of(Rule.Event.of(type, rule, name), NaN, NaN);
}
