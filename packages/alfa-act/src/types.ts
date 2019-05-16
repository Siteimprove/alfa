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

/**
 * A target is an entity that a rule can apply to and make expectations about.
 */
export type Target =
  | Attribute
  | Iterable<Attribute>
  | Document
  | Element
  | Iterable<Element>;

export const enum Outcome {
  Passed = "passed",
  Failed = "failed",
  Inapplicable = "inapplicable",
  CantTell = "cantTell"
}

export namespace Outcome {
  export type Applicable = Exclude<Outcome, Outcome.Inapplicable>;
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

  interface Base<A extends Aspect, T extends Target, O extends Outcome> {
    readonly rule: Rule<A, T>;
    readonly outcome: O;
    readonly browsers?: Result.Browsers;
  }

  interface WithTarget<A extends Aspect, T extends Target> {
    readonly aspect: A;
    readonly target: T;
  }

  interface WithExpectations {
    readonly expectations: Result.Expectations;
  }

  export interface Inapplicable<A extends Aspect, T extends Target>
    extends Base<A, T, Outcome.Inapplicable> {}

  export interface CantTell<A extends Aspect, T extends Target>
    extends Base<A, T, Outcome.CantTell>,
      WithTarget<A, T>,
      Partial<WithExpectations> {}

  export interface Failed<A extends Aspect, T extends Target>
    extends Base<A, T, Outcome.Failed>,
      WithTarget<A, T>,
      WithExpectations {}

  export interface Passed<A extends Aspect, T extends Target>
    extends Base<A, T, Outcome.Passed>,
      WithTarget<A, T>,
      WithExpectations {}
}

export type Result<
  A extends Aspect,
  T extends Target,
  O extends Outcome = Outcome
> = O extends Outcome.Inapplicable
  ? Result.Inapplicable<A, T>
  : O extends Outcome.CantTell
  ? Result.CantTell<A, T>
  : O extends Outcome.Failed
  ? Result.Failed<A, T>
  : Result.Passed<A, T>;

export const enum QuestionType {
  Boolean = "boolean",
  Node = "node",
  NodeList = "nodeList"
}

export const enum QuestionScope {
  Local = "local",
  Global = "global"
}

export interface Question<
  A extends Aspect,
  T extends Target,
  Q extends QuestionType = QuestionType
> {
  readonly type: Q;
  readonly id: string;
  readonly rule: Rule<A, T> | Iterable<Rule<A, T>>;
  readonly scope: QuestionScope;
  readonly aspect: A;
  readonly target: T;
  readonly message?: string;
}

export interface AnswerType {
  [QuestionType.Boolean]: boolean;
  [QuestionType.Node]: Element | Text | false;
  [QuestionType.NodeList]: Iterable<Element | Text>;
}

export interface Answer<
  A extends Aspect,
  T extends Target,
  Q extends QuestionType = QuestionType
> {
  readonly type: Q;
  readonly id: string;
  readonly rule?: Rule<A, T> | Iterable<Rule<A, T>>;
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
  applicable?: boolean | null;
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
      target: T,
      options?: { global?: boolean }
    ) => AnswerType[Q] | null
  ) => Iterable<Evaluand<A, T>> | BrowserSpecific<Iterable<Evaluand<A, T>>>;

  export type Expectations<A extends Aspect, T extends Target> = (
    aspect: A,
    target: T,
    question: <Q extends QuestionType>(
      type: Q,
      id: string,
      options?: { global?: boolean }
    ) => AnswerType[Q] | null
  ) => Evaluation | BrowserSpecific<Evaluation>;

  export interface Rule<A extends Aspect, T extends Target> {
    readonly id: string;

    readonly requirements?: Iterable<Requirement>;

    readonly locales?: Iterable<Locale>;

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
    outcomes: Iterable<{ outcome: Outcome }>
  ) => Evaluation | BrowserSpecific<Evaluation>;

  export interface Rule<A extends Aspect, T extends Target> {
    readonly id: string;

    readonly requirements?: Iterable<Requirement>;

    readonly locales?: Iterable<Locale>;

    readonly compose: (composition: Composition<A, T>) => void;

    readonly evaluate: (
      aspects: AspectsFor<A>
    ) => {
      readonly expectations: Expectations<A, T>;
    };
  }
}

export class Composition<A extends Aspect, T extends Target>
  implements Iterable<Atomic.Rule<A, T>> {
  /**
   * Compositions of rules are contravariant in the aspect and target type of
   * the rules. However, due to lack of variance annotations we have no way of
   * modelling this in TypeScript yet. As such, we're unfortunately forced to
   * use the `any` type for aspect and target types when storing rules for the
   * composition.
   */
  private readonly rules: Array<Atomic.Rule<any, any>> = []; // tslint:disable-line:no-any

  public [Symbol.iterator](): Iterator<Atomic.Rule<A, T>> {
    return this.rules[Symbol.iterator]();
  }

  public add<B extends A, U extends T>(rule: Atomic.Rule<B, U>): this {
    this.rules.push(rule);
    return this;
  }
}
