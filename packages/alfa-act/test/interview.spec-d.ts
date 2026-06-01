import { describe, expectTypeOf, it } from "vitest";

import type * as act from "../src/index.ts";

type Subject = never;
type Context = Subject;
type Answer = number;
type Metadata = { q1: ["boolean", boolean]; q2: ["number", number] };

type Interview<D extends number = act.Interview.MaxDepth> = act.Interview<
  Metadata,
  Subject,
  Context,
  Answer,
  D
>;

type Question<ANSWER> = act.Question<
  "boolean",
  Subject,
  Context,
  boolean,
  ANSWER,
  "q1"
>;

describe("Interview", () => {
  it("collapses to ANSWER when Metadata is empty", () => {
    expectTypeOf<
      act.Interview<{}, Subject, Context, Answer>
    >().toEqualTypeOf<Answer>();
  });

  it("can be an ANSWER", () => {
    expectTypeOf<Answer>().toExtend<Interview>();
  });

  it("accepts a Question with a URI that is a key of Metadata", () => {
    // Keeping this one explicit as we test the basic case.
    type Q1 = act.Question<"boolean", Subject, Context, boolean, Answer, "q1">;

    expectTypeOf<Q1>().toExtend<Interview>();
  });

  it("rejects a Question with a URI not in Q", () => {
    type QWrong = act.Question<
      string,
      Subject,
      Context,
      boolean,
      Answer,
      "unknown-uri"
    >;

    expectTypeOf<QWrong>().not.toExtend<Interview>();
  });

  it("rejects a Question with valid URI but incorrect answer type", () => {
    // { "q1": ["boolean", number] } has incorrect "answer type" (number).
    type Q1 = act.Question<"boolean", Subject, Context, number, Answer, "q1">;

    expectTypeOf<Q1>().not.toExtend<Interview>();
  });

  it("rejects a Question with valid URI but incorrect answer type representation", () => {
    // { "q1": ["incorrect", boolean] } has incorrect "type representation".
    type Q1 = act.Question<
      "incorrect",
      Subject,
      Context,
      boolean,
      Answer,
      "q1"
    >;

    expectTypeOf<Q1>().not.toExtend<Interview>();
  });

  it("only accepts a nested Interview, with smaller depth", () => {
    // A Question returning an Interview of depth 1.
    type Q1 = Question<Interview<1>>;

    // The question is an interview with depth higher than the depth of the
    // nested interview.
    expectTypeOf<Q1>().toExtend<Interview<2>>();
    expectTypeOf<Q1>().toExtend<Interview<3>>();

    // The question is not an interview with depth smaller than or equal to the
    // depth of the nested interview.
    expectTypeOf<Q1>().not.toExtend<Interview<0>>();
    expectTypeOf<Q1>().not.toExtend<Interview<1>>();
  });

  it("rejects a nested Interview at depth -1", () => {
    // Not specifying the depths in the questions, to give more possibilities
    type Q1 = Question<Interview>;

    // No matter the depth, a nested interview is not an interview of depth -1.
    expectTypeOf<Q1>().not.toExtend<Interview<-1>>();
  });

  it("accepts non-nested question at depth -1", () => {
    expectTypeOf<Question<Answer>>().toExtend<Interview<-1>>();
  });
});
