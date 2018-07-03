import { Node } from "@siteimprove/alfa-dom";
import { Response } from "@siteimprove/alfa-http";

export type Target = Node;

/**
 * @see https://www.w3.org/TR/act-rules-format/#input-aspects
 */
export interface Aspects {
  readonly response: Response;
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

export interface Question<T extends Target = Target> {
  readonly rule: string;
  readonly question: string;
  readonly target?: T;
}

export interface Answer<T extends Target = Target> extends Question<T> {
  readonly answer: boolean;
}

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
  T extends Target = Target
> = () => T | Array<T> | null;

/**
 * @see https://www.w3.org/TR/act-rules-format/#expectations
 */
export type Expectations<
  A extends Aspect = Aspect,
  T extends Target = Target
> = (
  target: T,
  expectation: (id: number, holds: boolean) => void,
  question: (question: string) => boolean
) => void;

/**
 * @see https://www.w3.org/TR/act-rules-format/#structure
 */
export interface Rule<A extends Aspect = Aspect, T extends Target = Target> {
  readonly id: string;
  readonly locales?: Array<Locale>;
  readonly definition: (
    applicability: (applicability: Applicability<A, T>) => void,
    expectations: (expectations: Expectations<A, T>) => void,
    aspects: Pick<Aspects, A>
  ) => void;
}
