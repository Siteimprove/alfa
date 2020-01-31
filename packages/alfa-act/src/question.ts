import { Functor } from "@siteimprove/alfa-functor";
import { Serializable } from "@siteimprove/alfa-json";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Monad } from "@siteimprove/alfa-monad";
import * as json from "@siteimprove/alfa-json";

export class Question<Q, A, S, T = A>
  implements Monad<T>, Functor<T>, Serializable {
  public static of<Q, A, S>(
    uri: string,
    type: Q,
    subject: S,
    message: string
  ): Question<Q, A, S> {
    return new Question(uri, type, subject, message, answer => answer);
  }

  private readonly _uri: string;
  private readonly _type: Q;
  private readonly _subject: S;
  private readonly _message: string;
  private readonly _quester: Mapper<A, T>;

  protected constructor(
    uri: string,
    type: Q,
    subject: S,
    message: string,
    quester: Mapper<A, T>
  ) {
    this._uri = uri;
    this._type = type;
    this._subject = subject;
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

  public get message(): string {
    return this._message;
  }

  public map<U>(mapper: Mapper<T, U>): Question<Q, A, S, U> {
    return new Question(
      this._uri,
      this._type,
      this._subject,
      this._message,
      answer => mapper(this._quester(answer))
    );
  }

  public flatMap<U>(
    mapper: Mapper<T, Question<Q, A, S, U>>
  ): Question<Q, A, S, U> {
    return new Question(
      this._uri,
      this._type,
      this._subject,
      this._message,
      answer => mapper(this._quester(answer))._quester(answer)
    );
  }

  public answer(answer: A): T {
    return this._quester(answer);
  }

  public toJSON(): Question.JSON {
    return {
      uri: this._uri,
      type: Serializable.toJSON(this._type),
      subject: Serializable.toJSON(this._subject),
      message: this._message
    };
  }
}

export namespace Question {
  export interface JSON {
    [key: string]: json.JSON;
    uri: string;
    type: json.JSON;
    subject: json.JSON;
    message: string;
  }

  export function isQuestion<Q, A, S, T = A>(
    value: unknown
  ): value is Question<Q, A, S, T> {
    return value instanceof Question;
  }
}

function normalize(string: string): string {
  return string.replace(/\s+/g, " ").trim();
}
