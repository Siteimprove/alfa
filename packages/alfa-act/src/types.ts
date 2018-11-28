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

export type Result<
  A extends Aspect = Aspect,
  T extends Target = Target,
  O extends Outcome = Outcome
> = O extends Outcome.Inapplicable
  ? {
      readonly rule: Rule["id"];
      readonly outcome: O;
    }
  : {
      readonly rule: Rule["id"];
      readonly outcome: O;
      readonly aspect: A;
      readonly target: T;
    };

export interface Question<
  A extends Aspect = Aspect,
  T extends Target = Target
> {
  readonly rule: Rule["id"];
  readonly question: string;
  readonly aspect: A;
  readonly target: T;
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
  export type Applicability<
    A extends Aspect = Aspect,
    T extends Target = Target
  > = (aspect: A, applicability: () => ReadonlyArray<T> | null) => void;

  export type Expectations<
    A extends Aspect = Aspect,
    T extends Target = Target
  > = (
    expectations: (
      aspect: A,
      target: T,
      expectation: (id: number, holds: boolean) => void,
      question: (question: string) => boolean
    ) => void
  ) => void;

  export interface Rule<A extends Aspect = Aspect, T extends Target = Target> {
    readonly id: string;

    readonly requirements?: ReadonlyArray<Requirement>;

    readonly locales?: ReadonlyArray<Locale>;

    readonly definition: (
      applicability: Applicability<A, T>,
      expectations: Expectations<A, T>,
      aspects: AspectsFor<A>
    ) => void;
  }
}

export namespace Composite {
  export type Expectations<
    A extends Aspect = Aspect,
    T extends Target = Target
  > = (
    expectations: (
      outcomes: ReadonlyArray<Pick<Result<A, T>, "outcome">>,
      expectation: (id: number, holds: boolean) => void
    ) => void
  ) => void;

  export interface Rule<A extends Aspect = Aspect, T extends Target = Target> {
    readonly id: string;

    readonly requirements?: ReadonlyArray<Requirement>;

    readonly locales?: ReadonlyArray<Locale>;

    readonly composes: ReadonlyArray<Atomic.Rule<A, T>>;

    readonly definition: (expectations: Expectations<A, T>) => void;
  }
}
