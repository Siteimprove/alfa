import { List, Map } from "@siteimprove/alfa-collection";
import { BrowserSpecific } from "@siteimprove/alfa-compatibility";
import { isIterable, keys, Mutable } from "@siteimprove/alfa-util";
import { isAtomic } from "./guards";
import { sortRules } from "./sort-rules";
import {
  Answer,
  AnswerType,
  Aspect,
  AspectsFor,
  Atomic,
  Composite,
  Composition,
  Evaluand,
  Evaluation,
  Outcome,
  Question,
  QuestionScope,
  QuestionType,
  Result,
  Rule,
  Target
} from "./types";

const { assign } = Object;
const {
  map,
  unwrap,
  Iterable: { reduce, groupBy }
} = BrowserSpecific;

// The `audit()` function is special in that it requires use of conditional
// types in order to correctly infer the union of aspect and target types for a
// list of rules. In order to do so, we unfortunately have to make use of the
// `any` type, which trips up TSLint as we've made the `any` type forbidden and
// this for good reason.

// tslint:disable-next-line:no-any
type AspectsOf<R extends Rule<any, any>> = R extends Rule<infer A, infer T>
  ? A
  : never;

// tslint:disable-next-line:no-any
type TargetsOf<R extends Rule<any, any>> = R extends Rule<infer A, infer T>
  ? T
  : never;

export function audit<
  R extends Rule<any, any>, // tslint:disable-line:no-any
  A extends AspectsOf<R> = AspectsOf<R>,
  T extends TargetsOf<R> = TargetsOf<R>
>(
  aspects: AspectsFor<A>,
  rules: Iterable<R>,
  answers: Iterable<Answer<QuestionType, A, T>> = [],
  options: { readonly obsolete?: boolean } = {}
): {
  results: Iterable<Result<A, T>>;
  questions: Iterable<Question<QuestionType, A, T>>;
} {
  const questions: Array<Question<QuestionType, A, T>> = [];

  const evaluations = reduce<Rule<A, T>, Map<Rule<A, T>, List<Result<A, T>>>>(
    sortRules(rules as Iterable<Rule<A, T>>),
    (evaluations, rule) => {
      const evaluator = getQuestionEvaluator(rule, questions, answers);

      const results = isAtomic(rule)
        ? auditAtomic(aspects, rule, evaluator)
        : auditComposite(aspects, rule, evaluations);

      return map(results, results => {
        return evaluations.set(rule, results);
      });
    },
    Map()
  );

  const results: Array<Result<A, T>> = [];

  for (const { value, browsers } of unwrap(evaluations)) {
    for (const [rule, evaluations] of value) {
      if (evaluations.size === 0) {
        results.push(<Result<A, T>>assign(
          {
            rule,
            outcome: Outcome.Inapplicable
          },
          {
            browsers
          }
        ));
      } else {
        for (const evaluation of evaluations) {
          results.push(assign(evaluation, { browsers }));
        }
      }
    }
  }

  return { results, questions };
}

function auditAtomic<A extends Aspect, T extends Target>(
  aspects: AspectsFor<A>,
  rule: Atomic.Rule<A, T>,
  question: <Q extends QuestionType>(
    type: Q,
    id: string,
    aspect: A,
    target: T
  ) => AnswerType[Q] | null
): List<Result<A, T>> | BrowserSpecific<List<Result<A, T>>> {
  const { applicability, expectations } = rule.evaluate(aspects);

  const evaluands = applicability(question);

  return reduce<Evaluand<A, T>, List<Result<A, T>>>(
    evaluands,
    (results, { applicable, aspect, target }) => {
      if (applicable === false) {
        return results;
      }

      if (applicable === null) {
        const result: Result<A, T, Outcome.CantTell> = {
          rule,
          outcome: Outcome.CantTell,
          aspect,
          target
        };

        return results.push(result);
      }

      const evaluator = getExpectationEvaluater(rule, aspect, target);

      const evaluation = expectations(aspect, target, (type, id) => {
        return question(type, id, aspect, target);
      });

      return map(evaluation, evaluation => {
        return results.push(evaluator(evaluation));
      });
    },
    List()
  );
}

function auditComposite<A extends Aspect, T extends Target>(
  aspects: AspectsFor<A>,
  rule: Composite.Rule<A, T>,
  evaluations:
    | Map<Rule<A, T>, List<Result<A, T>>>
    | BrowserSpecific<Map<Rule<A, T>, List<Result<A, T>>>>
): List<Result<A, T>> | BrowserSpecific<List<Result<A, T>>> {
  const { expectations } = rule.evaluate(aspects);

  const composition = new Composition<A, T>();

  rule.compose(composition);

  const results = reduce<Rule<A, T>, List<Result<A, T, Outcome.Applicable>>>(
    composition,
    (results, rule) => {
      return map(evaluations, evaluations => {
        return List(evaluations.get(rule)!).reduce((results, result) => {
          return result.outcome === Outcome.Inapplicable
            ? results
            : results.push(result);
        }, results);
      });
    },
    List()
  );

  const evaluands = groupBy(results, result => {
    return result.target;
  });

  return reduce<
    [T, Iterable<Result<A, T, Outcome.Applicable>>],
    List<Result<A, T>>
  >(
    evaluands,
    (results, [target, evaluands]) => {
      const aspects = List(evaluands).groupBy(result => result.aspect);

      return reduce(
        aspects,
        (results, [aspect, evaluands]) => {
          const evaluator = getExpectationEvaluater(rule, aspect, target);

          const evaluation = expectations(evaluands.toList());

          return map(evaluation, evaluation => {
            return results.push(evaluator(evaluation));
          });
        },
        results
      );
    },
    List()
  );
}

type QuestionEvaluator<A extends Aspect, T extends Target> = <
  Q extends QuestionType
>(
  type: Q,
  id: string,
  aspect: A,
  target: T,
  options?: { global?: boolean }
) => AnswerType[Q] | null;

function getQuestionEvaluator<A extends Aspect, T extends Target>(
  rule: Rule<A, T>,
  questions: Array<Question<QuestionType, A, T>>,
  answers: Iterable<Answer<QuestionType, A, T>>
): QuestionEvaluator<A, T> {
  const { locales = [] } = rule;

  const locale = Array.from(locales).find(locale => locale.id === "en");

  return (type, id, aspect, target, options = {}) => {
    const answer = Array.from(answers).find(answer => {
      if (
        answer.type !== type ||
        answer.id !== id ||
        answer.aspect !== aspect ||
        answer.target !== target
      ) {
        return false;
      }

      if (answer.rule === undefined) {
        return options.global === true;
      }

      if (isIterable(answer.rule)) {
        return (
          Array.from(answer.rule).find(found => found.id === rule.id) !==
          undefined
        );
      }

      return answer.rule.id === rule.id;
    });

    if (answer !== undefined) {
      return answer.answer;
    }

    let message: string | undefined;

    if (locale !== undefined) {
      const messages = locale.questions;

      if (messages !== undefined) {
        message = messages[id];
      }
    }

    const scope =
      options.global === true ? QuestionScope.Global : QuestionScope.Local;

    questions.push({
      type,
      id,
      rule,
      scope,
      aspect,
      target,
      message
    });

    return null;
  };
}

type ExpectationEvaluator<A extends Aspect, T extends Target> = (
  evaluation: Evaluation
) => Result<A, T, Outcome.Applicable>;

function getExpectationEvaluater<A extends Aspect, T extends Target>(
  rule: Rule<A, T>,
  aspect: A,
  target: T
): ExpectationEvaluator<A, T> {
  const { locales = [] } = rule;

  const locale = Array.from(locales).find(locale => locale.id === "en");

  return evaluations => {
    const outcome = keys(evaluations).reduce<Outcome.Applicable>(
      (outcome, id) => {
        const { holds } = evaluations[id];
        return holds === null
          ? Outcome.CantTell
          : holds
          ? outcome
          : Outcome.Failed;
      },
      Outcome.Passed
    );

    const expectations: Mutable<Result.Expectations> = {};

    for (const id of keys(evaluations)) {
      const { holds, data } = evaluations[id];

      let message: string | undefined;

      if (locale !== undefined) {
        const messages = locale.expectations[id];

        if (messages !== undefined) {
          const outcome =
            holds === null
              ? Outcome.CantTell
              : holds
              ? Outcome.Passed
              : Outcome.Failed;

          const callback = messages[outcome];

          if (callback !== undefined) {
            message = callback(data === undefined ? {} : data);
          }
        }
      }

      expectations[id] = { holds, message, data };
    }

    // This seemingly redundant switch clause appeases the type checker by
    // separating return types for the different result outcomes. For now, the
    // type checker chokes on assignability of result outcomes if no separation
    // is made.
    switch (outcome) {
      case Outcome.Passed:
        return { rule, outcome, aspect, target, expectations };

      case Outcome.Failed:
        return { rule, outcome, aspect, target, expectations };

      case Outcome.CantTell:
        return { rule, outcome, aspect, target, expectations };
    }
  };
}
