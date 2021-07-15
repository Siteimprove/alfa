import { Applicative } from "@siteimprove/alfa-applicative";
import { Functor } from "@siteimprove/alfa-functor";
import { Serializable } from "@siteimprove/alfa-json";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Monad } from "@siteimprove/alfa-monad";

import * as json from "@siteimprove/alfa-json";

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
    uri: string,
    type: Q,
    subject: S,
    context: C,
    message: string
  ): Question<Q, S, C, A> {
    return new Question(
      uri,
      type,
      subject,
      context,
      message,
      (answer) => answer
    );
  }

  private readonly _uri: string;
  private readonly _type: Q;
  private readonly _subject: S;
  private readonly _context: C;
  private readonly _message: string;
  private readonly _quester: Mapper<A, T>;

  protected constructor(
    uri: string,
    type: Q,
    subject: S,
    context: C,
    message: string,
    quester: Mapper<A, T>
  ) {
    this._uri = uri;
    this._type = type;
    this._subject = subject;
    this._context = context;
    this._message = normalize(message);
    this._quester = quester;
  }

  public get uri(): string {
    return this._uri;
  }

  public get type(): Q {
    return this._type;
  }

  public get subject(): S {
    return this._subject;
  }

  public get context(): C {
    return this._context;
  }

  public get message(): string {
    return this._message;
  }

  public map<U>(mapper: Mapper<T, U>): Question<Q, S, C, A, U> {
    return new Question(
      this._uri,
      this._type,
      this._subject,
      this._context,
      this._message,
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
      this._uri,
      this._type,
      this._subject,
      this._context,
      this._message,
      (answer) => mapper(this._quester(answer))._quester(answer)
    );
  }

  public flatten<Q, S, C, A, T>(
    this: Question<Q, S, C, A, Question<Q, S, C, A, T>>
  ): Question<Q, S, C, A, T> {
    return this.flatMap((question) => question);
  }

  public answer(answer: A): T {
    return this._quester(answer);
  }

  public toJSON(): Question.JSON<Q, S, C> {
    return {
      uri: this._uri,
      type: Serializable.toJSON(this._type),
      subject: Serializable.toJSON(this._subject),
      context: Serializable.toJSON(this._context),
      message: this._message,
    };
  }
}

/**
 * @public
 */
export namespace Question {
  export interface JSON<Q, S, C> {
    [key: string]: json.JSON;
    uri: string;
    type: Serializable.ToJSON<Q>;
    subject: Serializable.ToJSON<S>;
    context: Serializable.ToJSON<C>;
    message: string;
  }

  export function isQuestion<Q, S, C, A, T = A>(
    value: unknown
  ): value is Question<Q, S, C, A, T> {
    return value instanceof Question;
  }
}

function normalize(string: string): string {
  return string.replace(/\s+/g, " ").trim();
}
