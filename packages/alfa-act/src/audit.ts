import { BrowserSpecific } from "@siteimprove/alfa-compatibility";
import { keys, Mutable, values } from "@siteimprove/alfa-util";
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
  QuestionType,
  Result,
  Rule,
  Target
} from "./types";

// The `audit()` function is special in that it requires use of conditional
// types in order to correctly infer the union of aspect and target types for a
// list of rules. In order to do so, we unfortunately have to make use of the
// `any` type, which trips up TSLint as we've made the `any` type forbidden and
// this for good reason.
//
// tslint:disable:no-any

const { isArray } = Array;
const { assign } = Object;
const { map, reduce, unwrap } = BrowserSpecific;

type AspectsOf<R extends Rule<any, any>> = R extends Rule<infer A, infer T>
  ? A
  : never;

type TargetsOf<R extends Rule<any, any>> = R extends Rule<infer A, infer T>
  ? T
  : never;

type ResultSet<A extends Aspect, T extends Target> = Array<
  Result<A, T> | BrowserSpecific<Result<A, T>>
>;

type ResultMap<A extends Aspect, T extends Target> = Map<
  Rule<A, T>,
  ResultSet<A, T> | BrowserSpecific<ResultSet<A, T>>
>;

export function audit<
  R extends Rule<any, any>,
  A extends AspectsOf<R> = AspectsOf<R>,
  T extends TargetsOf<R> = TargetsOf<R>
>(
  aspects: AspectsFor<A>,
  rules: ReadonlyArray<R> | { readonly [P in R["id"]]: R },
  answers: ReadonlyArray<Answer<QuestionType, A, T>> = []
): {
  results: ReadonlyArray<Result<A, T>>;
  questions: ReadonlyArray<Question<QuestionType, A, T>>;
} {
  rules = isArray(rules) ? rules : values(rules);

  const questions: Array<Question<QuestionType, A, T>> = [];

  const evaluations: ResultMap<A, T> = new Map();

  for (const _rule of sortRules(rules)) {
    const rule = (_rule as unknown) as Rule<A, T>;

    function question<Q extends QuestionType>(
      type: Q,
      id: string,
      aspect: A,
      target: T
    ): AnswerType[Q] | null {
      const answer = answers.find(
        answer =>
          answer.type === type &&
          answer.id === id &&
          answer.rule.id === rule.id &&
          answer.aspect === aspect &&
          answer.target === target
      );

      if (answer !== undefined) {
        return answer.answer;
      }

      questions.push({ type, id, rule, aspect, target });

      return null;
    }

    if (isAtomic(rule)) {
      evaluations.set(rule, auditAtomic(aspects, rule, question));
    } else {
      evaluations.set(rule, auditComposite(aspects, rule, evaluations));
    }
  }

  const results: Array<Result<A, T>> = [];

  for (const [rule, wrapped] of evaluations) {
    const unwrapped = unwrap(map(wrapped, wrapped => wrapped.map(unwrap)));

    for (const { value: evaluations, browsers } of unwrapped) {
      if (evaluations.length === 0) {
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
        for (const unwrapped of evaluations) {
          for (const { value: evaluation, browsers } of unwrapped) {
            results.push(assign(evaluation, { browsers }));
          }
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
): ResultSet<A, T> | BrowserSpecific<ResultSet<A, T>> {
  const evaluate = rule.evaluate(aspects);

  return reduce<Evaluand<A, T>, ResultSet<A, T>>(
    evaluate.applicability(question),
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

        return [...results, result];
      }

      const evaluator = getExpectationEvaluater(rule, aspect, target);

      const result = map(
        evaluate.expectations(aspect, target, (type, id) =>
          question(type, id, aspect, target)
        ),
        evaluations => {
          return evaluator(evaluations);
        }
      );

      return [...results, result];
    },
    []
  );
}

function auditComposite<A extends Aspect, T extends Target>(
  aspects: AspectsFor<A>,
  rule: Composite.Rule<A, T>,
  evaluations: ResultMap<A, T>
): ResultSet<A, T> | BrowserSpecific<ResultSet<A, T>> {
  const applicability: Array<
    ResultSet<A, T> | BrowserSpecific<ResultSet<A, T>>
  > = [];

  const composition = new Composition<A, T>();

  rule.compose(composition);

  for (const composite of composition) {
    const evaluation = evaluations.get(composite);

    if (evaluation !== undefined) {
      applicability.push(evaluation);
    }
  }

  const groups = map(
    reduce<ResultSet<A, T>, ResultSet<A, T>>(
      applicability,
      (results, evaluations) => {
        return map(evaluations, evaluations => {
          return [...results, ...evaluations];
        });
      },
      []
    ),
    targets => {
      interface Group {
        aspect: A;
        target: T;
        results: Array<Result<A, T>>;
      }

      return reduce<Result<A, T>, Array<Group>>(
        targets,
        (groups, result) => {
          if (result.outcome === Outcome.Inapplicable) {
            return groups;
          }

          let group = groups.find(group => {
            return (
              group.aspect === result.aspect && group.target === result.target
            );
          });

          if (group === undefined) {
            group = {
              aspect: result.aspect,
              target: result.target,
              results: []
            };
            groups = [...groups, group];
          }

          group.results.push(result);

          return groups;
        },
        []
      );
    }
  );

  const evaluate = rule.evaluate();

  return map(groups, groups => {
    return groups.map(group => {
      const { aspect, target, results } = group;

      const evaluator = getExpectationEvaluater(
        rule as Rule<A, T>,
        aspect,
        target
      );

      return map(evaluate.expectations(results), evaluations => {
        return evaluator(evaluations);
      });
    });
  });
}

type Applicable = Outcome.Passed | Outcome.Failed | Outcome.CantTell;

function getExpectationEvaluater<A extends Aspect, T extends Target>(
  rule: Rule<A, T>,
  aspect: A,
  target: T
): (evaluation: Evaluation) => Result<A, T, Applicable> {
  const { locales = [] } = rule;

  const locale = locales.find(locale => locale.id === "en");

  return evaluations => {
    const outcome = keys(evaluations).reduce<Applicable>((outcome, id) => {
      const { holds } = evaluations[id];
      return holds === null
        ? Outcome.CantTell
        : holds
        ? outcome
        : Outcome.Failed;
    }, Outcome.Passed);

    const expectations: Mutable<Result<A, T, Applicable>["expectations"]> = {};

    for (const id of keys(evaluations)) {
      const { holds, data } = evaluations[id];

      let message: string | null = null;

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

      if (message === null) {
        const status =
          holds === null
            ? "was not evaluated"
            : holds
            ? "holds"
            : "does not hold";

        message = `Expectation ${id} ${status}`;
      }

      expectations[id] = {
        holds,
        message,
        data: data === undefined ? null : data
      };
    }

    const result: Result<A, T, any> = {
      rule,
      outcome,
      aspect,
      target,
      expectations
    };

    return result;
  };
}
