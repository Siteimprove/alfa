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

  private readonly _type: Q;
  private readonly _uri: string;
  private readonly _message: string;
  private readonly _subject: S;
  private readonly _context: C;
  private readonly _quester: Mapper<A, T>;

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
    return this.flatMap((question) => question);
  }

  public answer(answer: A): T {
    return this._quester(answer);
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
}

function normalize(string: string): string {
  return string.replace(/\s+/g, " ").trim();
}
