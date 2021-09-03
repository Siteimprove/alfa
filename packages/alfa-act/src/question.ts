import { Applicative } from "@siteimprove/alfa-applicative";
import { Functor } from "@siteimprove/alfa-functor";
import { Serializable } from "@siteimprove/alfa-json";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Monad } from "@siteimprove/alfa-monad";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";

import * as json from "@siteimprove/alfa-json";

const { isBoolean, isFunction } = Refinement;

/**
 * @public
 */
export class Question<Q, S, C, A, T = A>
  implements
    Functor<T>,
    Applicative<T>,
    Monad<T>,
    Serializable<Question.JSON<Q, S, C>>
{
  public static of<Q, S, C, A>(
    type: Q,
    uri: string,
    message: string,
    subject: S,
    context: C
  ): Question<Q, S, C, A> {
    return new Question(
      type,
      uri,
      message,
      subject,
      context,
      (answer) => answer
    );
  }

  protected readonly _type: Q;
  protected readonly _uri: string;
  protected readonly _message: string;
  protected readonly _subject: S;
  protected readonly _context: C;
  protected readonly _quester: Mapper<A, T>;

  protected constructor(
    type: Q,
    uri: string,
    message: string,
    subject: S,
    context: C,
    quester: Mapper<A, T>
  ) {
    this._type = type;
    this._uri = uri;
    this._message = normalize(message);
    this._subject = subject;
    this._context = context;
    this._quester = quester;
  }

  public get type(): Q {
    return this._type;
  }

  public get uri(): string {
    return this._uri;
  }

  public get message(): string {
    return this._message;
  }

  public get subject(): S {
    return this._subject;
  }

  public get context(): C {
    return this._context;
  }

  public isRhetorical(): this is Question.Rhetorical<Q, S, C, A, T> {
    return this instanceof Question.Rhetorical;
  }

  public answer(answer: A): T {
    return this._quester(answer);
  }

  public answerIf(condition: boolean, answer: A): Question<Q, S, C, A, T>;

  public answerIf(
    predicate: Predicate<S, [context: C]>,
    answer: A
  ): Question<Q, S, C, A, T>;

  public answerIf(answer: Option<A>): Question<Q, S, C, A, T>;

  public answerIf(
    conditionOrPredicateOrAnswer:
      | boolean
      | Predicate<S, [context: C]>
      | Option<A>,
    answer?: A
  ): Question<Q, S, C, A, T> {
    let condition: boolean;

    if (isBoolean(conditionOrPredicateOrAnswer)) {
      condition = conditionOrPredicateOrAnswer;
    } else if (isFunction(conditionOrPredicateOrAnswer)) {
      condition = conditionOrPredicateOrAnswer(this._subject, this._context);
    } else {
      condition = conditionOrPredicateOrAnswer.isSome();

      if (condition) {
        answer = conditionOrPredicateOrAnswer.get();
      }
    }

    return condition
      ? new Question.Rhetorical(
          this._type,
          this._uri,
          this._message,
          this._subject,
          this._context,
          this.answer(answer!)
        )
      : this;
  }

  public map<U>(mapper: Mapper<T, U>): Question<Q, S, C, A, U> {
    return new Question(
      this._type,
      this._uri,
      this._message,
      this._subject,
      this._context,
      (answer) => mapper(this._quester(answer))
    );
  }

  public apply<U>(
    mapper: Question<Q, S, C, A, Mapper<T, U>>
  ): Question<Q, S, C, A, U> {
    return mapper.flatMap((mapper) => this.map(mapper));
  }

  public flatMap<U>(
    mapper: Mapper<T, Question<Q, S, C, A, U>>
  ): Question<Q, S, C, A, U> {
    return new Question(
      this._type,
      this._uri,
      this._message,
      this._subject,
      this._context,
      (answer) => mapper(this._quester(answer))._quester(answer)
    );
  }

  public flatten<Q, S, C, A, T>(
    this: Question<Q, S, C, A, Question<Q, S, C, A, T>>
  ): Question<Q, S, C, A, T> {
    return new Question(
      this._type,
      this._uri,
      this._message,
      this._subject,
      this._context,
      (answer) => this._quester(answer)._quester(answer)
    );
  }

  public toJSON(): Question.JSON<Q, S, C> {
    return {
      type: Serializable.toJSON(this._type),
      uri: this._uri,
      message: this._message,
      subject: Serializable.toJSON(this._subject),
      context: Serializable.toJSON(this._context),
    };
  }
}

/**
 * @public
 */
export namespace Question {
  export interface JSON<Q, S, C> {
    [key: string]: json.JSON;
    type: Serializable.ToJSON<Q>;
    uri: string;
    message: string;
    subject: Serializable.ToJSON<S>;
    context: Serializable.ToJSON<C>;
  }

  export function isQuestion<Q, S, C, A, T = A>(
    value: unknown
  ): value is Question<Q, S, C, A, T> {
    return value instanceof Question;
  }

  /**
   * A rhetorical question is a special type of question in which the answer is
   * part of the question itself. This is useful for cases where the answer to
   * a question may optionally be given by the entity asking the question. This
   * means that a question can be conditionally answered while still retaining
   * its monadic structure as the question isn't unwrapped to its answer.
   *
   * @internal
   */
  export class Rhetorical<Q, S, C, A, T = A> extends Question<Q, S, C, A, T> {
    private readonly _answer: T;

    public constructor(
      type: Q,
      uri: string,
      message: string,
      subject: S,
      context: C,
      answer: T
    ) {
      super(type, uri, message, subject, context, () => answer);
      this._answer = answer;
    }

    public answer(): T {
      return this._answer;
    }

    /**
     * @remarks
     * Overriding {@link (Question:class).map} ensures that the answer to a
     * rhetorical question is not lost as the question is transformed.
     */
    public map<U>(mapper: Mapper<T, U>): Rhetorical<Q, S, C, A, U> {
      return new Rhetorical(
        this._type,
        this._uri,
        this._message,
        this._subject,
        this._context,
        mapper(this._answer)
      );
    }
  }
}

function normalize(string: string): string {
  return string.replace(/\s+/g, " ").trim();
}
