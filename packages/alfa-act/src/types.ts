import { Node, Element } from "@siteimprove/alfa-dom";

export type Criterion = string;

export type Target = Node;

/**
 * @see https://www.w3.org/TR/act-rules-format/#input-aspects
 */
export interface Aspects {
  readonly document: Node;
}

/**
 * @see https://www.w3.org/TR/act-rules-format/#input-aspects
 */
export type Aspect = keyof Aspects;

/**
 * @see https://www.w3.org/TR/act-rules-format/#output
 */
export type Result<T extends Target = Target> = Readonly<
  | {
      rule: string;
      outcome: "passed" | "failed";
      target: T;
    }
  | {
      rule: string;
      outcome: "inapplicable";
    }
>;

/**
 * @see https://www.w3.org/TR/act-rules-format/#output-outcome
 */
export type Outcome = Result["outcome"];

export type Question<T extends Target = Target> = Readonly<{
  rule: string;
  question: string;
  target?: T;
}>;

export type Answer<T extends Target = Target> = Question<T> &
  Readonly<{ answer: boolean }>;

export interface Locale {
  readonly id: "en";
  readonly title: string;
  readonly description: string;
  readonly assumptions?: string;
  readonly applicability: string;
  readonly expectations: Readonly<{
    [id: string]: Readonly<{
      description: string;
      outcome: Readonly<{ [P in Outcome]?: string }>;
    }>;
  }>;
}

/**
 * @see https://www.w3.org/TR/act-rules-format/#applicability
 */
export type Applicability<
  A extends Aspect = Aspect,
  T extends Target = Target,
  C = any
> = (aspects: Pick<Aspects, A>, context: C) => T | Array<T> | null;

/**
 * @see https://www.w3.org/TR/act-rules-format/#expectations
 */
export type Expectation<
  A extends Aspect = Aspect,
  T extends Target = Target,
  C = any
> = (
  target: T,
  aspects: Pick<Aspects, A>,
  question: (question: string, target?: T) => boolean,
  context: C
) => boolean;

/**
 * @see https://www.w3.org/TR/act-rules-format/#structure
 */
export interface Rule<
  A extends Aspect = Aspect,
  T extends Target = Target,
  C = any
> {
  readonly id: string;
  readonly criteria: Array<Criterion>;
  readonly locales: Array<Locale>;
  readonly context: (aspects: Pick<Aspects, A>) => C;
  readonly applicability: Applicability<A, T, C>;
  readonly expectations: Readonly<{ [id: string]: Expectation<A, T, C> }>;
}
