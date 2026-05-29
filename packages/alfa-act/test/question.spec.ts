import { test } from "@siteimprove/alfa-test";
import { None, Option } from "@siteimprove/alfa-option";
import { Ok, Err } from "@siteimprove/alfa-result";

import { Diagnostic, Question } from "../src/index.ts";

import { Target } from "./fixtures/target.ts";

const target1 = Target.one;

// ── Question.of ────────────────────────────────────────────────────────────

test("of() returns a non-rhetorical question", (t) => {
  const q = Question.of("bool", "u", "?", {}, target1);
  t(!q.isRhetorical());
});

// ── answerIf overloads ─────────────────────────────────────────────────────

test("answerIf() returns a rhetorical question with stored answer when condition is true", (t) => {
  const q = Question.of("bool", "u", "?", {}, target1).answerIf(true, 42);
  t(q.isRhetorical());
  t.equal(q.answer(0 as never), 42);
});

test("answerIf() returns a non-rhetorical question when condition is false", (t) => {
  const q = Question.of("bool", "u", "?", {}, target1).answerIf(false, 42);
  t(!q.isRhetorical());
});

test("answerIf() returns a rhetorical question when predicate matches subject", (t) => {
  const q = Question.of("bool", "u", "?", 5, target1).answerIf(
    (n: number) => n > 3,
    true,
  );
  t(q.isRhetorical());
});

test("answerIf() returns a non-rhetorical question when predicate does not match subject", (t) => {
  const q = Question.of("bool", "u", "?", 1, target1).answerIf(
    (n: number) => n > 3,
    true,
  );
  t(!q.isRhetorical());
});

test("answerIf() returns a rhetorical question when given Some", (t) => {
  const q = Question.of("bool", "u", "?", {}, target1).answerIf(
    Option.of(true),
  );
  t(q.isRhetorical());
});

test("answerIf() returns a non-rhetorical question when given None", (t) => {
  const q = Question.of("bool", "u", "?", {}, target1).answerIf(None);
  t(!q.isRhetorical());
});

test("answerIf() returns a rhetorical question when given Ok", (t) => {
  const q = Question.of("bool", "u", "?", {}, target1).answerIf(Ok.of(true));
  t(q.isRhetorical());
});

test("answerIf() returns a non-rhetorical question with updated diagnostic when given Err of Diagnostic", (t) => {
  const original = Diagnostic.of("original");
  const updated = Diagnostic.of("updated");
  const q = Question.of("bool", "u", "?", {}, target1, {
    diagnostic: original,
  }).answerIf(Err.of(updated));
  t(!q.isRhetorical());
  t(q.diagnostic.equals(updated));
});

test("answerIf() returns unchanged diagnostic when given Err of non-Diagnostic", (t) => {
  const original = Diagnostic.of("original");
  const q = Question.of("bool", "u", "?", {}, target1, {
    diagnostic: original,
  }).answerIf(Err.of("plain error"));
  t(!q.isRhetorical());
  t(q.diagnostic.equals(original));
});

// ── map / flatMap / Rhetorical.map ─────────────────────────────────────────

test("map() transforms the answer via the quester", (t) => {
  const q = Question.of<string, {}, Target, number>(
    "num",
    "u",
    "?",
    {},
    target1,
  ).map((n) => n * 2);
  t.equal(q.answer(3), 6);
});

test("map() transforms the stored answer and returns a rhetorical question when the input is rhetorical", (t) => {
  const q = Question.of<string, {}, Target, number>(
    "num",
    "u",
    "?",
    {},
    target1,
  )
    .answerIf(true, 3)
    .map((n) => n * 2);
  t(q.isRhetorical());
  t.equal(q.answer(0 as never), 6);
});

test("flatMap() chains questions and passes the answer through", (t) => {
  const q = Question.of<string, {}, Target, number>(
    "num",
    "u",
    "?",
    {},
    target1,
  ).flatMap((n) =>
    Question.of<string, {}, Target, number>("num", "u2", "??", {}, target1).map(
      () => n + 10,
    ),
  );
  t.equal(q.answer(5), 15);
});

// ── Type guard ─────────────────────────────────────────────────────────────

test("isQuestion() returns true for Question instances and false otherwise", (t) => {
  const q = Question.of("bool", "u", "?", {}, target1);
  t(Question.isQuestion(q));
  t(!Question.isQuestion(42));
  t(!Question.isQuestion(null));
});
