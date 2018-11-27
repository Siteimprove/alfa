import { Device } from "@siteimprove/alfa-device";
import { Attribute, Document, Element } from "@siteimprove/alfa-dom";
import { Request, Response } from "@siteimprove/alfa-http";

export type Target = Attribute | Document | Element;

export interface Aspects {
  readonly request: Request;
  readonly response: Response;
  readonly document: Document;
  readonly device: Device;
}

export type Aspect = Aspects[keyof Aspects];

export type AspectKeysFor<A extends Aspect> = {
  readonly [P in keyof Aspects]: Aspects[P] extends A ? P : never
}[keyof Aspects];

export type AspectsFor<A extends Aspect> = {
  readonly [P in AspectKeysFor<A>]: Aspects[P]
};

export const enum Outcome {
  Passed = "passed",
  Failed = "failed",
  Inapplicable = "inapplicable",
  CantTell = "cantTell"
}

export type Result<T extends Target = Target> = Readonly<
  | {
      rule: Rule["id"];
      outcome: Outcome.Passed | Outcome.Failed;
      target: T;
    }
  | {
      rule: Rule["id"];
      outcome: Outcome.Inapplicable;
    }
>;

export interface Question<T extends Target = Target> {
  readonly rule: Rule["id"];
  readonly question: string;
  readonly target: T;
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
      outcome: Readonly<{ [P in Outcome.Passed | Outcome.Failed]?: string }>;
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
  export type Applicability<T extends Target = Target> = () => ReadonlyArray<
    T
  > | null;

  export type Expectations<T extends Target = Target> = (
    target: T,
    expectation: (id: number, holds: boolean) => void,
    question: (question: string) => boolean
  ) => void;

  export interface Rule<A extends Aspect = Aspect, T extends Target = Target> {
    readonly id: string;

    readonly requirements?: ReadonlyArray<Requirement>;

    readonly locales?: ReadonlyArray<Locale>;

    readonly definition: (
      applicability: (applicability: Applicability<T>) => void,
      expectations: (expectations: Expectations<T>) => void,
      aspects: AspectsFor<A>
    ) => void;
  }
}

export namespace Composite {
  export type Expectations<T extends Target = Target> = (
    outcomes: ReadonlyArray<Pick<Result<T>, "outcome">>,
    expectation: (id: number, holds: boolean) => void
  ) => void;

  export interface Rule<A extends Aspect = Aspect, T extends Target = Target> {
    readonly id: string;

    readonly requirements?: ReadonlyArray<Requirement>;

    readonly locales?: ReadonlyArray<Locale>;

    readonly composes: ReadonlyArray<Atomic.Rule<A, T>>;

    readonly definition: (
      expectations: (expectations: Expectations<T>) => void
    ) => void;
  }
}
