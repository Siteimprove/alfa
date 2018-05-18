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
export type Result<T extends Target, A extends Aspect> = Readonly<{
  rule: string;
  aspects: Pick<Aspects, A>;
}> &
  Readonly<
    | {
        target: T;
        outcome: "passed" | "failed";
      }
    | {
        outcome: "inapplicable";
      }
  >;

/**
 * @see https://www.w3.org/TR/act-rules-format/#output-outcome
 */
export type Outcome = Result<Target, Aspect>["outcome"];

export type Question<T extends Target> = Readonly<{
  rule: string;
  question: string;
  target?: T;
}>;

export type Answer<T extends Target> = Question<T> &
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
export type Applicability<T extends Target, A extends Aspect, C = null> = (
  aspects: Pick<Aspects, A>,
  context: C
) => T | Array<T> | null | Promise<T | Array<T> | null>;

/**
 * @see https://www.w3.org/TR/act-rules-format/#expectations
 */
export type Expectation<T extends Target, A extends Aspect, C = null> = (
  target: T,
  aspects: Pick<Aspects, A>,
  question: (question: string, target?: T) => boolean,
  context: C
) => boolean | Promise<boolean>;

/**
 * @see https://www.w3.org/TR/act-rules-format/#structure
 */
export interface Rule<T extends Target, A extends Aspect, C = null> {
  readonly id: string;
  readonly criteria: Array<Criterion>;
  readonly locales: Array<Locale>;
  readonly context: (aspects: Pick<Aspects, A>) => C | Promise<C>;
  readonly applicability: Applicability<T, A, C>;
  readonly expectations: Readonly<{ [id: string]: Expectation<T, A, C> }>;
}
