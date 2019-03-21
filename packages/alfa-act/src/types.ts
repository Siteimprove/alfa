import { BrowserSpecific } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import { Attribute, Document, Element, Text } from "@siteimprove/alfa-dom";
import { Request, Response } from "@siteimprove/alfa-http";

/**
 * Aspects are the different resources that make up a test subject, which is the
 * entity under test by a rule. Aspects are the only input supplied to a rule;
 * everything a rule needs to make a decision must therefore be present within
 * the aspects passed to it.
 */
export interface Aspects {
  readonly request: Request;
  readonly response: Response;
  readonly document: Document;
  readonly device: Device;
}

/**
 * Aspect represents the type of any individual aspect.
 */
export type Aspect = Aspects[keyof Aspects];

/**
 * Given one or more aspects, get the keys of the aspects within the Aspects
 * type.
 */
export type AspectKeysFor<A extends Aspect> = {
  readonly [P in keyof Aspects]: Aspects[P] extends A ? P : never
}[keyof Aspects];

/**
 * Given one or more aspects, get a subset of the Aspects type that includes
 * only the given aspects.
 */
export type AspectsFor<A extends Aspect> = Partial<Aspects> &
  { readonly [P in AspectKeysFor<A>]: Aspects[P] };

/**
 * A target is an entity that a rule can apply to and make expectations about.
 */
export type Target = Attribute | Document | Element;

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
  A extends Aspect,
  T extends Target,
  O extends Outcome = Outcome
> = O extends Outcome.Inapplicable
  ? {
      readonly rule: Rule<A, T>;
      readonly outcome: O;
      readonly browsers?: { [key: string]: true | Array<string> };
    }
  : {
      readonly rule: Rule<A, T>;
      readonly outcome: O;
      readonly browsers?: { [key: string]: true | Array<string> };
      readonly aspect: A;
      readonly target: T;
      readonly expectations: {
        readonly [id: number]: {
          readonly holds: boolean | null;
          readonly message: string;
          readonly data: Data | null;
        };
      };
    };

export const enum QuestionType {
  Boolean = "boolean",
  Node = "node",
  NodeList = "nodeList"
}

export interface Question<
  Q extends QuestionType,
  A extends Aspect,
  T extends Target
> {
  readonly type: Q;
  readonly id: string;
  readonly rule: Rule<A, T>;
  readonly aspect: A;
  readonly target: T;
}

export interface AnswerType {
  [QuestionType.Boolean]: boolean;
  [QuestionType.Node]: Element | Text;
  [QuestionType.NodeList]: ReadonlyArray<Element | Text>;
}

export interface Answer<
  Q extends QuestionType,
  A extends Aspect,
  T extends Target
> extends Question<Q, A, T> {
  readonly answer: AnswerType[Q] | null;
}

export type Message = (data: Data) => string;

export interface Locale {
  readonly id: "en";
  readonly title: string;
  readonly expectations: {
    readonly [id: number]: {
      readonly [P in
        | Outcome.Passed
        | Outcome.Failed
        | Outcome.CantTell]?: Message
    };
  };
}

export interface Requirement {
  readonly id: string;
  readonly partial?: true;
}

export interface Evaluations {
  readonly [id: number]: {
    holds: boolean | null;
    data?: Data;
  };
}

export type Rule<A extends Aspect, T extends Target> =
  | Atomic.Rule<A, T>
  | Composite.Rule<A, T>;

export namespace Atomic {
  export type Applicability<A extends Aspect, T extends Target> = (
    aspect: A,
    applicability: (
      question: <Q extends QuestionType>(
        type: Q,
        id: string,
        target: T
      ) => AnswerType[Q] | null
    ) => ReadonlyArray<T> | BrowserSpecific<ReadonlyArray<T>> | null
  ) => void;

  export type Expectations<A extends Aspect, T extends Target> = (
    expectations: (
      aspect: A,
      target: T,
      question: <Q extends QuestionType>(
        type: Q,
        id: string
      ) => AnswerType[Q] | null
    ) => Evaluations | BrowserSpecific<Evaluations>
  ) => void;

  export interface Rule<A extends Aspect, T extends Target> {
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
  export type Expectations<A extends Aspect, T extends Target> = (
    expectations: (
      outcomes: ReadonlyArray<Pick<Result<A, T>, "outcome">>
    ) => Evaluations | BrowserSpecific<Evaluations>
  ) => void;

  export interface Rule<A extends Aspect, T extends Target> {
    readonly id: string;

    readonly requirements?: ReadonlyArray<Requirement>;

    readonly locales?: ReadonlyArray<Locale>;

    readonly composes: ReadonlyArray<Atomic.Rule<A, T>>;

    readonly definition: (expectations: Expectations<A, T>) => void;
  }
}
