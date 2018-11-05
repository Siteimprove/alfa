import { Attribute, Document, Element } from "@siteimprove/alfa-dom";
import { Request, Response } from "@siteimprove/alfa-http";

export type Target = Attribute | Document | Element;

export interface Aspects {
  readonly request: Request;
  readonly response: Response;
  readonly document: Document;
}

export type Aspect = Aspects[keyof Aspects];

export type AspectsFor<A extends Aspect> = {
  readonly [P in keyof Aspects]: Aspects[P] extends A
    ? Aspects[P]
    : Aspects[P] | undefined
};

export const enum Outcome {
  Passed = "passed",
  Failed = "failed",
  Inapplicable = "inapplicable",
  CantTell = "cantTell"
}

export type Result<
  A extends Aspect = Aspect,
  T extends Target = Target
> = Readonly<
  | {
      rule: Rule<A, T>;
      outcome: Outcome.Passed | Outcome.Failed;
      target: T;
    }
  | {
      rule: Rule<A, T>;
      outcome: Outcome.Inapplicable;
    }
>;

export interface Question<
  A extends Aspect = Aspect,
  T extends Target = Target
> {
  readonly rule: Rule<A, T>;
  readonly question: string;
  readonly target?: T;
}

export interface Answer<A extends Aspect = Aspect, T extends Target = Target>
  extends Question<A, T> {
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

export interface Requirement {
  readonly id: string;
  readonly partial?: true;
}

export type Rule<A extends Aspect = Aspect, T extends Target = Target> =
  | Atomic.Rule<A, T>
  | Composite.Rule<A, T>;

export namespace Atomic {
  export type Applicability<
    A extends Aspect = Aspect,
    T extends Target = Target
  > = () => ReadonlyArray<T> | null;

  export type Expectations<
    A extends Aspect = Aspect,
    T extends Target = Target
  > = (
    target: T,
    expectation: (id: number, holds: boolean) => void,
    question: (question: string) => boolean
  ) => void;

  export interface Rule<A extends Aspect = Aspect, T extends Target = Target> {
    readonly id: string;

    readonly requirements?: ReadonlyArray<Requirement>;

    readonly locales?: ReadonlyArray<Locale>;

    readonly definition: (
      applicability: (applicability: Applicability<A, T>) => void,
      expectations: (expectations: Expectations<A, T>) => void,
      aspects: AspectsFor<A>
    ) => void;
  }
}

export namespace Composite {
  export type Expectations<
    A extends Aspect = Aspect,
    T extends Target = Target
  > = (
    results: ReadonlyArray<Result<A, T>>,
    expectation: (id: number, holds: boolean) => void
  ) => void;

  export interface Rule<A extends Aspect = Aspect, T extends Target = Target> {
    readonly id: string;

    readonly requirements?: ReadonlyArray<Requirement>;

    readonly locales?: ReadonlyArray<Locale>;

    readonly composes: ReadonlyArray<Atomic.Rule<A, T>>;

    readonly definition: (
      expectations: (expectations: Expectations<A, T>) => void
    ) => void;
  }
}
