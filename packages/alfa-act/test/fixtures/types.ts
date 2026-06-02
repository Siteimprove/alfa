// Type of questions asked in fixture rules.
import { type Maybe } from "@siteimprove/alfa-option";
import type { Result } from "@siteimprove/alfa-result";
import type * as act from "../../src/index.ts";
import type { Target } from "./target.ts";

// Questions
export type Subject = Target;
export type Context = Subject;
export type Answer = Target;
export type Metadata = { q1: ["boolean", boolean]; q2: ["number", number] };

export type Question<ANSWER> = act.Question<
  "boolean",
  Subject,
  Context,
  boolean,
  ANSWER,
  "q1"
>;

export type Interview<D extends number = act.Interview.MaxDepth> =
  act.Interview<Metadata, Subject, Context, Answer, D>;

// Rules
export type Input = Iterable<Target>;

export type Applicable = act.Outcome.Applicable<Input, Target, Metadata>;
export type Expectation = {
  [key: string]: Maybe<Result<act.Diagnostic, act.Diagnostic>>;
};

export type Atomic<Q extends act.Question.Metadata = {}> = act.Rule.Atomic<
  Input,
  Target,
  Q
>;
export type Composite = act.Rule.Composite<Input, Target, Metadata>;
export type TRule = act.Rule<Input, Target, Metadata>;

export type Oracle = act.Oracle<Input, Target, Metadata, Subject>;

export type Event = act.Rule.Event<Input, Target, Metadata, Subject>;
