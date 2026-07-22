import { test } from "@siteimprove/alfa-test";
import { None, Option } from "@siteimprove/alfa-option";
import { Ok, Err } from "@siteimprove/alfa-result";

import { Diagnostic, Question } from "../src/index.ts";

// ── Question.of ────────────────────────────────────────────────────────────

function makeQuestion(
  target: number,
  diagnostic?: Diagnostic,
): Question<"number", number, number, number> {
  return Question.of<"number", number, number, number>(
    "number",
    "test-question",
    `Which number goes with ${target}?`,
    target,
    target,
    { ...(diagnostic === undefined ? {} : { diagnostic }) },
  );
}
const original = Diagnostic.of("original");
const current = Diagnostic.of("current");

const question = makeQuestion(1);
const questionWithOriginal = makeQuestion(1, original);

test(".of() returns a non-rhetorical question", (t) => {
  t(!question.isRhetorical());
});

// ── answerIf overloads ─────────────────────────────────────────────────────

test("#answerIf() returns a rhetorical question with stored answer when condition is true", (t) => {
  const q = question.answerIf(true, 42);

  t(q.isRhetorical());
  t.equal(q.answer(NaN), 42);
});

test("#answerIf() returns a non-rhetorical question when condition is false", (t) => {
  const q = question.answerIf(false, 42);

  t(!q.isRhetorical());
});

test("#answerIf() applies the first matching condition in a chain", (t) => {
  const q = question
    .answerIf(false, 1) // skipped — condition false
    .answerIf(true, 42) // applied — becomes rhetorical with answer 42
    .answerIf(true, 99); // no-op — already rhetorical

  t(q.isRhetorical());
  t.equal(q.answer(NaN), 42);
});

test("#answerIf() returns a rhetorical question when predicate matches subject", (t) => {
  const q = question.answerIf((n: number) => n < 3, 42);

  t(q.isRhetorical());
});

test("#answerIf() returns a non-rhetorical question when predicate does not match subject", (t) => {
  const q = question.answerIf((n: number) => n > 3, 42);

  t(!q.isRhetorical());
});

test("#answerIf() returns a rhetorical question when given Some", (t) => {
  const q = question.answerIf(Option.of(42));

  t(q.isRhetorical());
});

test("#answerIf() returns a non-rhetorical question when given None", (t) => {
  const q = question.answerIf(None);

  t(!q.isRhetorical());
});

test("#answerIf() returns a rhetorical question when given Ok", (t) => {
  const q = question.answerIf(Ok.of(42));

  t(q.isRhetorical());
});

test("#answerIf() returns a non-rhetorical question with updated diagnostic when given Err of Diagnostic", (t) => {
  // The answerIf attempt is failing with Diagnostic `current`, so we
  // record it as the new question's diagnostic.
  const q = questionWithOriginal.answerIf(Err.of(current));

  t(!q.isRhetorical());
  t.deepEqual(q.diagnostic.toJSON(), current.toJSON());
});

test("#answerIf() returns unchanged diagnostic when given Err of non-Diagnostic", (t) => {
  // The answerIf attempt is failing without usable further information,
  // so we keep the original diagnostic as the new question's diagnostic.
  const q = questionWithOriginal.answerIf(Err.of("plain error"));

  t(!q.isRhetorical());
  t.deepEqual(q.diagnostic.toJSON(), original.toJSON());
});

test("#answerIf() applies a custom merger when given Err of Diagnostic", (t) => {
  // Merger keeps the old diagnostic and ignores the new one.
  const q = questionWithOriginal.answerIf(Err.of(current), (old, _cur) => old);

  t(!q.isRhetorical());
  t.deepEqual(q.diagnostic.toJSON(), original.toJSON());
});

test("#answerIf() passes both old and current diagnostics to the merger", (t) => {
  const q = questionWithOriginal.answerIf(Err.of(current), (old, cur) =>
    Diagnostic.of(`${old.message} + ${cur.message}`),
  );

  t(!q.isRhetorical());
  t.deepEqual(
    q.diagnostic.toJSON(),
    Diagnostic.of("original + current").toJSON(),
  );
});

test("#answerIf() merger accumulates across chained failing calls", (t) => {
  const merge = (old: Diagnostic, cur: Diagnostic) =>
    Diagnostic.of(`${old.message}+${cur.message}`);

  // Each answerIf failure feeds the previous result into old.
  const q = makeQuestion(1, Diagnostic.of("a"))
    .answerIf(Err.of(Diagnostic.of("b")), merge) // diagnostic: "a+b"
    .answerIf(Err.of(Diagnostic.of("c")), merge); // diagnostic: "a+b+c"

  t(!q.isRhetorical());
  t.deepEqual(q.diagnostic.toJSON(), Diagnostic.of("a+b+c").toJSON());
});

// ── map / Rhetorical.map / flatMap ─────────────────────────────────────────

test("#map() transforms the answer via the quester", (t) => {
  const q = question.map((n) => n * 2);

  t.equal(q.answer(3), 6);
});

test("#map() transforms the stored answer and returns a rhetorical question when the input is rhetorical", (t) => {
  const q = question.answerIf(true, 3).map((n) => n * 2);

  t(q.isRhetorical());
  t.equal(q.answer(NaN), 6);
});

test("#flatMap() chains questions and passes the answer through", (t) => {
  const q = question
    .map((n) => n * 2)
    .flatMap((n) => makeQuestion(n).map(() => n + 10));

  // We keep the initial message "Which number goes with 1?", double the answer before
  // sending it as answer to the nested question, which adds 10 to it with its
  // own quester.
  t.equal(q.message, "Which number goes with 1?");
  t.equal(q.answer(2), 14);
});

// ── Type guard ─────────────────────────────────────────────────────────────

test("isQuestion() returns true for Question instances and false otherwise", (t) => {
  t(Question.isQuestion(question));
  t(!Question.isQuestion(42));
  t(!Question.isQuestion(null));
});
