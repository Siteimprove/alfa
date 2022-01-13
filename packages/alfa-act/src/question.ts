import { Applicative } from "@siteimprove/alfa-applicative";
import { Functor } from "@siteimprove/alfa-functor";
import { Serializable } from "@siteimprove/alfa-json";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Monad } from "@siteimprove/alfa-monad";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Result } from "@siteimprove/alfa-result";

import * as json from "@siteimprove/alfa-json";
import { Diagnostic } from "./diagnostic";

const { isOption } = Option;
const { isBoolean, isFunction } = Refinement;

/**
 * @public
 * * TYPE is a (JavaScript manipulable) representation of the expected type of
 *   answers. It allows oracles and such to act on it. It can be an Enum, an ID,
 *   a union of string literals, …
 * * SUBJECT is the subject of the question.
 * * CONTEXT is the context, some extra info added to help the subject make sense.
 *   By convention, the context is *always* the test target (or potential test
 *   target when questions are asked in Applicability).
 * * ANSWER is the expected type of the answer.
 * * T is the final result of the question, after transformation. This gives a
 *   monadic structure to the question and allow manipulation of the answer
 *   without breaking the Question structure.
 * * URI is a unique identifier for the question.
 */
export class Question<
  TYPE,
  SUBJECT,
  CONTEXT,
  ANSWER,
  T = ANSWER,
  URI extends string = string
> implements
    Functor<T>,
    Applicative<T>,
    Monad<T>,
    Serializable<Question.JSON<TYPE, SUBJECT, CONTEXT, URI>>
{
  public static of<TYPE, SUBJECT, CONTEXT, ANSWER, URI extends string = string>(
    type: TYPE,
    uri: URI,
    diagnostic: Diagnostic,
    subject: SUBJECT,
    context: CONTEXT
  ): Question<TYPE, SUBJECT, CONTEXT, ANSWER, ANSWER, URI> {
    return new Question(
      type,
      uri,
      diagnostic,
      subject,
      context,
      (answer) => answer
    );
  }

  protected readonly _type: TYPE;
  protected readonly _uri: URI;
  protected readonly _diagnostic: Diagnostic;
  protected readonly _subject: SUBJECT;
  protected readonly _context: CONTEXT;
  protected readonly _quester: Mapper<ANSWER, T>;

  protected constructor(
    type: TYPE,
    uri: URI,
    diagnostic: Diagnostic,
    subject: SUBJECT,
    context: CONTEXT,
    quester: Mapper<ANSWER, T>
  ) {
    this._type = type;
    this._uri = uri;
    this._diagnostic = diagnostic;
    this._subject = subject;
    this._context = context;
    this._quester = quester;
  }

  public get type(): TYPE {
    return this._type;
  }

  public get uri(): URI {
    return this._uri;
  }

  public get diagnostic(): Diagnostic {
    return this._diagnostic;
  }

  public get subject(): SUBJECT {
    return this._subject;
  }

  public get context(): CONTEXT {
    return this._context;
  }

  public isRhetorical(): this is Question.Rhetorical<
    TYPE,
    SUBJECT,
    CONTEXT,
    ANSWER,
    T
  > {
    return this instanceof Question.Rhetorical;
  }

  public answer(answer: ANSWER): T {
    return this._quester(answer);
  }

  public answerIf(
    condition: boolean,
    answer: ANSWER
  ): Question<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI>;

  public answerIf(
    predicate: Predicate<SUBJECT, [context: CONTEXT]>,
    answer: ANSWER
  ): Question<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI>;

  public answerIf(
    answer: Option<ANSWER>
  ): Question<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI>;

  public answerIf(
    answer: Result<ANSWER, unknown>
  ): Question<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI>;

  public answerIf(
    conditionOrPredicateOrAnswer:
      | boolean
      | Predicate<SUBJECT, [context: CONTEXT]>
      | Option<ANSWER>
      | Result<ANSWER, unknown>,
    answer?: ANSWER
  ): Question<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI> {
    let condition: boolean;

    if (isBoolean(conditionOrPredicateOrAnswer)) {
      condition = conditionOrPredicateOrAnswer;
    } else if (isFunction(conditionOrPredicateOrAnswer)) {
      condition = conditionOrPredicateOrAnswer(this._subject, this._context);
    } else if (isOption(conditionOrPredicateOrAnswer)) {
      condition = conditionOrPredicateOrAnswer.isSome();

      if (condition) {
        answer = conditionOrPredicateOrAnswer.get();
      }
    } else {
      // Result
      condition = conditionOrPredicateOrAnswer.isOk();

      if (condition) {
        answer = conditionOrPredicateOrAnswer.get();
      }
    }

    return condition
      ? new Question.Rhetorical(
          this._type,
          this._uri,
          this._diagnostic,
          this._subject,
          this._context,
          this.answer(answer!)
        )
      : this;
  }

  public map<U>(
    mapper: Mapper<T, U>
  ): Question<TYPE, SUBJECT, CONTEXT, ANSWER, U, URI> {
    return new Question(
      this._type,
      this._uri,
      this._diagnostic,
      this._subject,
      this._context,
      (answer) => mapper(this._quester(answer))
    );
  }

  public apply<U>(
    mapper: Question<TYPE, SUBJECT, CONTEXT, ANSWER, Mapper<T, U>, URI>
  ): Question<TYPE, SUBJECT, CONTEXT, ANSWER, U, URI> {
    return mapper.flatMap((mapper) => this.map(mapper));
  }

  public flatMap<U>(
    mapper: Mapper<T, Question<TYPE, SUBJECT, CONTEXT, ANSWER, U, URI>>
  ): Question<TYPE, SUBJECT, CONTEXT, ANSWER, U, URI> {
    return new Question(
      this._type,
      this._uri,
      this._diagnostic,
      this._subject,
      this._context,
      (answer) => mapper(this._quester(answer))._quester(answer)
    );
  }

  public flatten<TYPE, SUBJECT, CONTEXT, ANSWER, T>(
    this: Question<
      TYPE,
      SUBJECT,
      CONTEXT,
      ANSWER,
      Question<TYPE, SUBJECT, CONTEXT, ANSWER, T>
    >
  ): Question<TYPE, SUBJECT, CONTEXT, ANSWER, T> {
    return new Question(
      this._type,
      this._uri,
      this._diagnostic,
      this._subject,
      this._context,
      (answer) => this._quester(answer)._quester(answer)
    );
  }

  public toJSON(): Question.JSON<TYPE, SUBJECT, CONTEXT, URI> {
    return {
      type: Serializable.toJSON(this._type),
      uri: this._uri,
      diagnostic: this._diagnostic.toJSON(),
      subject: Serializable.toJSON(this._subject),
      context: Serializable.toJSON(this._context),
    };
  }
}

/**
 * @public
 */
export namespace Question {
  export interface JSON<TYPE, SUBJECT, CONTEXT, URI extends string = string> {
    [key: string]: json.JSON;
    type: Serializable.ToJSON<TYPE>;
    uri: URI;
    diagnostic: Diagnostic.JSON;
    subject: Serializable.ToJSON<SUBJECT>;
    context: Serializable.ToJSON<CONTEXT>;
  }

  export function isQuestion<
    TYPE,
    SUBJECT,
    CONTEXT,
    ANSWER,
    T = ANSWER,
    URI extends string = string
  >(value: unknown): value is Question<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI> {
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
  export class Rhetorical<
    TYPE,
    SUBJECT,
    CONTEXT,
    ANSWER,
    T = ANSWER,
    URI extends string = string
  > extends Question<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI> {
    private readonly _answer: T;

    public constructor(
      type: TYPE,
      uri: URI,
      diagnostic: Diagnostic,
      subject: SUBJECT,
      context: CONTEXT,
      answer: T
    ) {
      super(type, uri, diagnostic, subject, context, () => answer);
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
    public map<U>(
      mapper: Mapper<T, U>
    ): Rhetorical<TYPE, SUBJECT, CONTEXT, ANSWER, U, URI> {
      return new Rhetorical(
        this._type,
        this._uri,
        this._diagnostic,
        this._subject,
        this._context,
        mapper(this._answer)
      );
    }
  }
}
