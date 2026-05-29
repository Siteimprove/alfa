import { describe, it, expectTypeOf } from "vitest";

import type { Interview } from "../src/expectation/interview.ts";
import type { Question } from "../src/expectation/question.ts";

type S = {};
type C = string;
type A = number;
type Q = { "q1": [string, boolean]; "q2": [number, string] };

describe("Interview", () => {
  it("collapses to ANSWER when Q is empty", () => {
    expectTypeOf<Interview<{}, S, C, A>>().toEqualTypeOf<A>();
  });

  it("accepts a direct ANSWER value", () => {
    type _Check = A extends Interview<Q, S, C, A> ? true : false;
    expectTypeOf<_Check>().toEqualTypeOf<true>();
  });

  it("accepts a Question with a URI that is a key of Q", () => {
    // Interview<Q,S,C,A,3> contains Question<..., Interview<Q,S,C,A,2>, "q1">
    type Q1 = Question<string, S, C, boolean, Interview<Q, S, C, A, 2>, "q1">;
    type _Check = Q1 extends Interview<Q, S, C, A> ? true : false;
    expectTypeOf<_Check>().toEqualTypeOf<true>();
  });

  it("rejects a Question with a URI not in Q", () => {
    type QWrong = Question<string, S, C, boolean, Interview<Q, S, C, A, 2>, "unknown-uri">;
    type _Check = QWrong extends Interview<Q, S, C, A> ? true : false;
    expectTypeOf<_Check>().toEqualTypeOf<false>();
  });

  it("at depth -1, Question inner answer is ANSWER, not Interview", () => {
    type AtMinusOne = Interview<Q, S, C, A, -1>;
    type Q1AtMinusOne = Question<string, S, C, boolean, A, "q1">;
    type _Check = Q1AtMinusOne extends AtMinusOne ? true : false;
    expectTypeOf<_Check>().toEqualTypeOf<true>();
  });

  it("at depth 0, Question inner answer is Interview<D=-1>", () => {
    type AtZero = Interview<Q, S, C, A, 0>;
    type InnerAtZero = Question<string, S, C, boolean, Interview<Q, S, C, A, -1>, "q1">;
    type _Check = InnerAtZero extends AtZero ? true : false;
    expectTypeOf<_Check>().toEqualTypeOf<true>();
  });

  it("MaxDepth is 3", () => {
    expectTypeOf<Interview.MaxDepth>().toEqualTypeOf<3>();
  });
});
