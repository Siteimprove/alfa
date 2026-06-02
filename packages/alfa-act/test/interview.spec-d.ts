import { describe, expectTypeOf, it } from "vitest";

import type * as act from "../src/index.ts";

type Subject = never;
type Context = Subject;
type Answer = number;
type Metadata = { q1: ["boolean", boolean]; q2: ["number", number] };

type Question<ANSWER> = act.Question<
  "boolean",
  Subject,
  Context,
  boolean,
  ANSWER,
  "q1"
>;

type Interview<D extends number = act.Interview.MaxDepth> = act.Interview<
  Metadata,
  Subject,
  Context,
  Answer,
  D
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

  it("can be a Question with a URI that is a key of the Metadata", () => {
    // Keeping this one explicit as we test the basic case.
    type Q1 = act.Question<"boolean", Subject, Context, boolean, Answer, "q1">;

    expectTypeOf<Q1>().toExtend<Interview>();
  });

  it("cannot be a Question with a URI not in the Metadata", () => {
    type QWrongURI = act.Question<
      "boolean",
      Subject,
      Context,
      boolean,
      Answer,
      "unknown-uri"
    >;

    expectTypeOf<QWrongURI>().not.toExtend<Interview>();
  });

  it("cannot be a Question with incorrect answer type", () => {
    // { "q1": ["boolean", number] } has incorrect "answer type" (number).
    type QWrongType = act.Question<
      "boolean",
      Subject,
      Context,
      number,
      Answer,
      "q1"
    >;

    expectTypeOf<QWrongType>().not.toExtend<Interview>();
  });

  it("cannot be a Question with incorrect answer type representation", () => {
    // { "q1": ["incorrect", boolean] } has incorrect "type representation".
    type QWrongRepresentation = act.Question<
      "incorrect",
      Subject,
      Context,
      boolean,
      Answer,
      "q1"
    >;

    expectTypeOf<QWrongRepresentation>().not.toExtend<Interview>();
  });

  it("can be a nested Interview, with a smaller depth", () => {
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

  it("cannot be a nested Interview at depth -1", () => {
    // Not specifying the depths in the questions, to give more possibilities
    type Q1 = Question<Interview>;

    // No matter the depth, a nested interview is not an interview of depth -1.
    expectTypeOf<Q1>().not.toExtend<Interview<-1>>();
  });

  it("can be a non-nested question at depth -1", () => {
    expectTypeOf<Question<Answer>>().toExtend<Interview<-1>>();
  });
});
