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
  readonly [P in AspectKeysFor<Aspect>]?: Aspects[P]
} &
  { readonly [P in AspectKeysFor<A>]: Aspects[P] };

export const enum Outcome {
  Passed = "passed",
  Failed = "failed",
  Inapplicable = "inapplicable",
  CantTell = "cantTell"
}

type Primitive = string | number | boolean | null | undefined;

type Value = Primitive | List | Dictionary;

interface List extends Array<Value> {}

interface Dictionary {
  readonly [key: string]: Value;
}

export type Data = Dictionary;

export type Result<
  A extends Aspect = Aspect,
  T extends Target = Target,
  O extends Outcome = Outcome
> = O extends Outcome.Inapplicable
  ? {
      readonly rule: Rule<A, T>;
      readonly outcome: O;
    }
  : {
      readonly rule: Rule<A, T>;
      readonly outcome: O;
      readonly aspect: A;
      readonly target: T;
      readonly expectations: {
        readonly [id: number]: {
          readonly holds: boolean;
          readonly message: string;
          readonly data: Data | null;
        };
      };
    };

export interface Question<
  A extends Aspect = Aspect,
  T extends Target = Target
> {
  readonly rule: Rule<A, T>;
  readonly question: string;
  readonly aspect: A;
  readonly target: T;
}

export interface Answer<A extends Aspect = Aspect, T extends Target = Target>
  extends Question<A, T> {
  readonly answer: boolean;
}

export type Message = (data: Data) => string;

export interface Locale {
  readonly id: "en";
  readonly title: string;
  readonly expectations: {
    readonly [id: number]: {
      readonly [P in Outcome.Passed | Outcome.Failed]: Message
    };
  };
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
      expectation: (id: number, holds: boolean, data?: Data) => void,
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
