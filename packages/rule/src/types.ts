import { Node, Element } from "@alfa/dom";
import { Style, State } from "@alfa/style";
import { Layout } from "@alfa/layout";

export type Criterion = string;

export type Target = Node;

export interface Aspects {
  readonly document: Node;
  readonly style: Map<Element, { [S in State]: Style }>;
  readonly layout: Map<Element, Layout>;
}

export type Aspect = keyof Aspects;

export type Result<T extends Target, A extends Aspect> = Readonly<{
  rule: string;
  aspects: Pick<Aspects, A>;
}> &
  (
    | Readonly<{
        target: T;
        outcome: "passed" | "failed";
      }>
    | Readonly<{
        outcome: "inapplicable";
      }>);

export type Question<T extends Target> = Readonly<{
  rule: string;
  question: string;
  target?: T;
}>;

export type Answer<T extends Target> = Question<T> &
  Readonly<{ answer: boolean }>;

export type Outcome = Result<Target, Aspect>["outcome"];

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

export type Applicability<T extends Target, A extends Aspect> = (
  aspects: Pick<Aspects, A>
) => Promise<Iterable<T>>;

export type Expectation<T extends Target, A extends Aspect> = (
  target: T,
  aspects: Pick<Aspects, A>,
  question: (question: string, target?: T) => boolean
) => Promise<boolean>;

export interface Rule<T extends Target, A extends Aspect> {
  readonly id: string;
  readonly criteria: Array<Criterion>;
  readonly locales: Array<Locale>;
  readonly applicability: Applicability<T, A>;
  readonly expectations: Readonly<{ [id: string]: Expectation<T, A> }>;
}
