import { BrowserSpecific } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import { Attribute, Document, Element, Text } from "@siteimprove/alfa-dom";
import { Request, Response } from "@siteimprove/alfa-http";
import { Primitive } from "@siteimprove/alfa-util";

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

export type Group<T> = ReadonlySet<T>;

/**
 * A target is an entity that a rule can apply to and make expectations about.
 */
export type Target =
  | Attribute
  | Group<Attribute>
  | Document
  | Element
  | Group<Element>;

export const enum Outcome {
  Passed = "passed",
  Failed = "failed",
  Inapplicable = "inapplicable",
  CantTell = "cantTell"
}

type Value = Primitive | List | Dictionary;

interface List extends Array<Value> {}

interface Dictionary {
  readonly [key: string]: Value;
}

export type Data = Dictionary;

export namespace Result {
  export interface Browsers {
    readonly [key: string]: true | ReadonlyArray<string>;
  }

  export interface Expectations {
    readonly [i: number]: {
      readonly holds: boolean | null;
      readonly message?: string;
      readonly data?: Data;
    };
  }
}

export type Result<
  A extends Aspect,
  T extends Target,
  O extends Outcome = Outcome
> = O extends Outcome.Inapplicable
  ? {
      readonly rule: Rule<A, T>;
      readonly outcome: O;
      readonly browsers?: Result.Browsers;
    }
  : O extends Outcome.CantTell
  ? {
      readonly rule: Rule<A, T>;
      readonly outcome: O;
      readonly browsers?: Result.Browsers;
      readonly aspect: A;
      readonly target: T;
      readonly expectations?: Result.Expectations;
    }
  : {
      readonly rule: Rule<A, T>;
      readonly outcome: O;
      readonly browsers?: Result.Browsers;
      readonly aspect: A;
      readonly target: T;
      readonly expectations: Result.Expectations;
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
  readonly message?: string;
}

export interface AnswerType {
  [QuestionType.Boolean]: boolean;
  [QuestionType.Node]: Element | Text | false;
  [QuestionType.NodeList]: ReadonlyArray<Element | Text>;
}

export interface Answer<
  Q extends QuestionType,
  A extends Aspect,
  T extends Target
> {
  readonly type: Q;
  readonly id: string;
  readonly rule: Rule<A, T> | ReadonlyArray<Rule<A, T>>;
  readonly aspect: A;
  readonly target: T;
  readonly answer: AnswerType[Q] | null;
}

export type Message = (data: Data) => string;

export interface Locale {
  readonly id: "en";
  readonly title: string;
  readonly expectations: {
    readonly [i: number]: {
      readonly [P in
        | Outcome.Passed
        | Outcome.Failed
        | Outcome.CantTell]?: Message
    };
  };
  readonly questions?: {
    readonly [id: string]: string;
  };
}

export interface Requirement {
  readonly id: string;
  readonly partial?: true;
}

export interface Evaluand<A extends Aspect, T extends Target> {
  applicable: boolean | null;
  aspect: A;
  target: T;
}

export interface Evaluation {
  readonly [i: number]: {
    holds: boolean | null;
    data?: Data;
  };
}

export type Rule<A extends Aspect, T extends Target> =
  | Atomic.Rule<A, T>
  | Composite.Rule<A, T>;

export namespace Atomic {
  export type Applicability<A extends Aspect, T extends Target> = (
    question: <Q extends QuestionType>(
      type: Q,
      id: string,
      aspect: A,
      target: T
    ) => AnswerType[Q] | null
  ) => ReadonlyArray<Evaluand<A, T> | BrowserSpecific<Evaluand<A, T>>>;

  export type Expectations<A extends Aspect, T extends Target> = (
    aspect: A,
    target: T,
    question: <Q extends QuestionType>(
      type: Q,
      id: string
    ) => AnswerType[Q] | null
  ) => Evaluation | BrowserSpecific<Evaluation>;

  export interface Rule<A extends Aspect, T extends Target> {
    readonly id: string;

    readonly requirements?: ReadonlyArray<Requirement>;

    readonly locales?: ReadonlyArray<Locale>;

    readonly evaluate: (
      aspects: AspectsFor<A>
    ) => {
      readonly applicability: Applicability<A, T>;
      readonly expectations: Expectations<A, T>;
    };
  }
}

export namespace Composite {
  export type Expectations<A extends Aspect, T extends Target> = (
    outcomes: ReadonlyArray<{ outcome: Outcome }>
  ) => Evaluation | BrowserSpecific<Evaluation>;

  export interface Rule<A extends Aspect, T extends Target> {
    readonly id: string;

    readonly requirements?: ReadonlyArray<Requirement>;

    readonly locales?: ReadonlyArray<Locale>;

    readonly compose: (composition: Composition<A, T>) => void;

    readonly evaluate: (
      aspects: AspectsFor<A>
    ) => {
      readonly expectations: Expectations<A, T>;
    };
  }
}

// tslint:disable:no-any

export class Composition<A extends Aspect, T extends Target> {
  /**
   * @internal
   */
  private readonly rules: Array<Atomic.Rule<any, any>> = [];

  /**
   * @internal
   */
  public [Symbol.iterator](): Iterator<Atomic.Rule<A, T>> {
    return this.rules[Symbol.iterator]();
  }

  public add<B extends A, U extends T>(rule: Atomic.Rule<B, U>): this {
    this.rules.push(rule);
    return this;
  }
}
