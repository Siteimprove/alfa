import { Functor } from "@siteimprove/alfa-functor";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Monad } from "@siteimprove/alfa-monad";

export class Question<Q, A, S, T = A> implements Monad<T>, Functor<T> {
  public static of<Q, A, S>(
    uri: string,
    type: Q,
    subject: S,
    message: string
  ): Question<Q, A, S> {
    return new Question(uri, type, subject, message, answer => answer);
  }

  public readonly uri: string;
  public readonly type: Q;
  public readonly subject: S;
  public readonly message: string;
  private readonly quester: Mapper<A, T>;

  protected constructor(
    uri: string,
    type: Q,
    subject: S,
    message: string,
    quester: Mapper<A, T>
  ) {
    this.uri = uri;
    this.type = type;
    this.subject = subject;
    this.message = normalize(message);
    this.quester = quester;
  }

  public map<U>(mapper: Mapper<T, U>): Question<Q, A, S, U> {
    return new Question(
      this.uri,
      this.type,
      this.subject,
      this.message,
      answer => mapper(this.quester(answer))
    );
  }

  public flatMap<U>(
    mapper: Mapper<T, Question<Q, A, S, U>>
  ): Question<Q, A, S, U> {
    return new Question(
      this.uri,
      this.type,
      this.subject,
      this.message,
      answer => mapper(this.quester(answer)).quester(answer)
    );
  }

  public answer(answer: A): T {
    return this.quester(answer);
  }

  public toJSON() {
    return {
      uri: this.uri,
      type: this.type,
      subject: this.subject,
      message: this.message
    };
  }
}

function normalize(string: string): string {
  return string.replace(/\s+/g, " ").trim();
}
